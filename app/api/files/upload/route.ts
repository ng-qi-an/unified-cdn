import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrCodeOrUser } from "@/lib/permissions/serverPermissionHelpers";
import { convertUnit } from "@/lib/unitConverter";
import { files as filesDb } from "@/lib/schema/schema";
import { generateId } from "better-auth";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { Application } from "@/lib/schema/schemaTypes";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { GrantCodeActions } from "@/lib/actions/files/grant-codes/grantCodeActions";
import Busboy from "@fastify/busboy";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";
import { HCDNClient } from "@/lib/providers/hcdn/client";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createWriteStream, promises as fsp } from "node:fs";
import { uploadStreamedFiles } from "@/lib/providers/hcdn/uploadStreamedFiles";
import { HCDNAuthenticationError } from "@/lib/providers/hcdn/errors";
import { finaliseUpload } from "@/lib/actions/files/finaliseUpload";
import { pipeline } from "node:stream/promises";

const maxFileSize = convertUnit(0.5, "gb", "b"); // 0.5 GB in bytes
const maxFiles = 20; // Maximum number of files allowed

export const POST = verifyAPIKeyOrCodeOrUser("UPLOAD_FILES", async (req, ctx, apiKey, user, code) => {
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.timezone){
        return errorToResponse(new InvalidConfigurationError("The site's timezone is not set."));
    }
    try {
        let appData: Pick<Application, "id" | "limit"> & { database: { provider: string, id: string, keys: any | undefined, limit: number } | null } | null = null;
        if (apiKey){
            appData = await db.query.applications.findFirst({where: {id: apiKey.metadata?.appId}, with: {database: {columns: {provider: true, id: true, keys: true, limit: true}}}, columns: {id: true, limit: true}}) ?? null;
        } else if (user){
            if (!req.nextUrl.searchParams.get("appId")){
                return errorToResponse(new InvalidConfigurationError("Missing appId in query parameters."));
            }
            const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
            appData = await db.query.applications.findFirst({where: {id: req.nextUrl.searchParams.get("appId") as string, ownerId: !viewAllPerms.isAuthorised ? user.id : {isNotNull: true}}, with: {database: {columns: {provider: true, id: true, keys: true, limit: true}}}, columns: {id: true, limit: true}}) ?? null;
        }
        if (!appData) {
            return errorToResponse(new UnauthorisedError());
        }
        const dbProvider = appData.database?.provider;
        let codeBody: GrantCodeActions["UPLOAD_FILES"] | null = null;
        if (code){
            codeBody = code.data as GrantCodeActions["UPLOAD_FILES"];
            if (!codeBody.fileCount){
                return errorToResponse(new InvalidConfigurationError("The grant code does not have the required data."));
            }
        }
        const busboy = new Busboy({
            headers: Object.fromEntries(req.headers.entries()) as { "content-type": string; [key: string]: string },
            limits: {
                files: maxFiles,
                fileSize: maxFileSize
            }
        })
        if (!dbProvider && dbProvider != "hackclub-cdn" && !dbProvider?.startsWith("s3-")){
            return errorToResponse(new InvalidConfigurationError("The configured database provider is not supported."));
        }
        const finalisedCtx = {
            appId: appData.id,
            databaseId: appData.database?.id ?? "",
            appLimit: appData.limit,
            dbLimit: appData.database?.limit ?? 0,
            codeBody,
            timezone: siteConfig.general.timezone,
            userId: user?.id,
            apiKeyId: apiKey?.id,
            filesLimitExceeded: false
        }
        if (dbProvider == "hackclub-cdn"){
            const hcdn = new HCDNClient(appData.database!.keys.apiKey);
            const hcdnFailed: { filename: string; reason: string }[] = [];
            const spooled: { tmpPath: string; filename: string; mimeType: string; size: number }[] = [];
            const tmpPaths: string[] = [];
            const spoolTasks: Promise<void>[] = [];
            let hitFilesLimit = false;
            busboy.on("filesLimit", () => {
                hitFilesLimit = true;
            });
            let receivedFiles = 0;
            busboy.on("file", (name, stream, filename, _encoding, mimeType) => {
                receivedFiles += 1
                if (name !== "files") { return stream.resume(); }
                if (codeBody?.allowedFileTypes && !codeBody.allowedFileTypes.includes(mimeType)) {
                    hcdnFailed.push({ filename, reason: `File type ${mimeType} is not allowed for this grant code.` });
                    return stream.resume();
                }
                const tmpPath = join(tmpdir(), `ucdn-${generateId(16)}`);
                tmpPaths.push(tmpPath);
                let bytes = 0;
                let hitLimit = false;
                stream.on("data", (chunk) => { bytes += chunk.length; });
                stream.on("limit", () => { hitLimit = true; });
                spoolTasks.push(
                    pipeline(stream, createWriteStream(tmpPath)).then(() => {
                        if (hitLimit || (stream as unknown as { truncated?: boolean }).truncated) {
                            hcdnFailed.push({ filename, reason: `File size exceeds the maximum allowed size of ${maxFileSize} bytes.` });
                            return;
                        }
                        spooled.push({ tmpPath, filename, mimeType, size: bytes });
                    }).catch(() => {
                        hcdnFailed.push({ filename, reason: "Failed to receive file." });
                    })
                );
            });
            req.signal.addEventListener("abort", () => busboy.destroy());
            Readable.fromWeb(req.body as any).pipe(busboy);
            await new Promise<void>((resolve, reject) => {
                busboy.on("finish", () => resolve());
                busboy.on("error", reject);
            });
            await Promise.all(spoolTasks);
            try {
                if (receivedFiles == 0) {
                    return errorToResponse(new InvalidConfigurationError("No files were uploaded."));
                }
                let hcdnUploads: { id: string; filename: string; size: number; content_type: string }[] = [];
                if (spooled.length > 0) {
                    let batch;
                    try {
                        batch = await uploadStreamedFiles(hcdn, spooled);
                    } catch (err) {
                        if (err instanceof HCDNAuthenticationError) {
                            return errorToResponse(new InvalidConfigurationError("Could not connect to database provider. Please check your database key configurations."));
                        }
                        throw err;
                    }
                    hcdnFailed.push(...batch.failed);
                    hcdnUploads = batch.uploads;
                }
                const hcdnSuccess: typeof filesDb.$inferInsert[] = hcdnUploads.map((u) => ({
                    id: generateId(16),
                    applicationId: appData.id,
                    databaseId: appData.database!.id,
                    key: u.id,
                    name: u.filename,
                    contentType: u.content_type,
                    size: u.size
                }));
                if (hcdnSuccess.length === 0) {
                    return errorToResponse(new InvalidConfigurationError("All file uploads failed. Please check your configuration and try again."));
                }
                const hcdnIds = hcdnSuccess.map((f) => f.key);
                return finaliseUpload(hcdnSuccess, hcdnFailed, receivedFiles, async () => {
                    if (hcdnIds.length > 0) {
                        await hcdn.deleteFiles(hcdnIds).catch((err) => {
                            console.error("Error cleaning up files from HCDN:", err);
                        });
                    }
                }, {...finalisedCtx, filesLimitExceeded: hitFilesLimit});
            } finally {
                await Promise.all(tmpPaths.map((p) => fsp.unlink(p).catch(() => {})));
            }

        } else if (dbProvider.startsWith("s3-")) {
            const client = getS3Client(appData.database!.keys.accessUrl, appData.database!.keys.accessKeyId, appData.database!.keys.secretAccessKey);
            const uploadTasks: Promise<{ok: true, file: typeof filesDb.$inferInsert} | {ok: false, filename: string, reason: string}>[] = [];
            let hitFilesLimit = false;
            busboy.on("filesLimit", () => {
                hitFilesLimit = true;
            });
            busboy.on("file", (name, stream, filename, _encoding, mimeType)=>{
                if (name !== "files"){
                    return stream.resume();
                }
                if (codeBody?.allowedFileTypes && !codeBody.allowedFileTypes.includes(mimeType)){
                    uploadTasks.push(Promise.resolve({
                        ok: false as const,
                        filename,
                        reason: `File type ${mimeType} is not allowed for this grant code.`
                    }))
                    return stream.resume();
                }

                let bytes = 0;
                stream.on("data", (chunk)=> bytes += chunk.length);
                let limitExceeded = false;
                stream.on("limit", ()=> {
                    limitExceeded = true;
                })
                const fileKey = generateId(16);
                const key = `unified-cdn/${fileKey}`;
                const upload = new Upload({
                    client,
                    params: {
                        Bucket: appData.database!.keys.bucketName,
                        Key: key,
                        Body: stream,
                        ContentType: mimeType
                    },
                    partSize: 10 * 1024 * 1024, // 10mb
                    queueSize: 2,
                })
                req.signal.addEventListener("abort", ()=> upload.abort());
                uploadTasks.push(upload.done().then(async()=>{
                    if (limitExceeded || stream.truncated){
                        await client.send(new DeleteObjectCommand({
                            Bucket: appData.database!.keys.bucketName,
                            Key: key
                        })).catch((err)=>{
                            console.error("Error deleting truncated file from S3:", err);
                        })                        
                        return {
                            ok: false as const,
                            filename,
                            reason: `File size exceeds the maximum allowed size of ${maxFileSize} bytes.`
                        }
                    }
                    return {
                        ok: true as const,
                        file: {
                            id: generateId(16),
                            applicationId: appData!.id,
                            databaseId: appData!.database!.id,
                            key,
                            name: filename,
                            contentType: mimeType,
                            size: bytes
                        }
                    }
                }).catch((err)=>{
                    if (isCredentialError(err)){
                        return {
                            ok: false as const,
                            filename: filename, 
                            reason: "Invalid S3 credentials. Please check your configuration."
                        }
                    } 
                    return {
                        ok: false as const,
                        filename: filename, 
                        reason: err instanceof Error ? err.message : "Unknown error"
                    }
                }))
            })
            Readable.fromWeb(req.body as any).pipe(busboy);
            await new Promise<void>((resolve, reject)=>{
                busboy.on("finish", ()=> resolve());
                busboy.on("error", (err)=> reject(err));
            })
            const results = await Promise.all(uploadTasks);
            const successFiles = results.filter(r => r.ok).map(r => r.file);
            const failedFiles = results.filter(r => !r.ok).map(r => ({ filename: r.filename, reason: r.reason }));
            const successKeys = successFiles.map((f) => f.key);
            return finaliseUpload(successFiles, failedFiles, uploadTasks.length, async () => {
                if (successKeys.length > 0) {
                    await client.send(new DeleteObjectsCommand({
                        Bucket: appData.database!.keys.bucketName,
                        Delete: { Objects: successKeys.map((Key) => ({ Key })) },
                    })).catch((err) => { console.error("Error cleaning up files from S3:", err); });
                }
            }, {...finalisedCtx, filesLimitExceeded: hitFilesLimit});
        } else {
            console.log(appData.database?.provider)
            return errorToResponse(new InvalidConfigurationError("The configured database provider is not supported."));
        }
    } catch (error) {
        console.error("Error processing file upload:", error);
        return errorToResponse(error);
    }
})