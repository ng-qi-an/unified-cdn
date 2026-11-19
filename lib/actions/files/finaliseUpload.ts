import { db } from "@/lib/db";
import { files as filesDb } from "@/lib/schema/schema";
import { InvalidConfigurationError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";
import updateSizeAnalyticsEvent from "@/lib/actions/analytics/updateSizeAnalyticsEvent";
import updateFilesAnalyticsEvent from "@/lib/actions/analytics/updateFilesAnalyticsEvent";
import updateRequestsAnalyticsEvent from "@/lib/actions/analytics/updateRequestsAnalyticsEvent";
import { makeAppLog } from "@/lib/actions/logs/appLog";
import { makeDbLog } from "@/lib/actions/logs/dbLog";
import { eq, sum } from "drizzle-orm";
import passLimit from "@/lib/actions/files/passLimit";
import type { GrantCodeActions } from "@/lib/actions/files/grant-codes/grantCodeActions";

export interface FinaliseUploadContext {
    appId: string;
    databaseId: string;
    appLimit: number;
    dbLimit: number;
    codeBody: GrantCodeActions["UPLOAD_FILES"] | null;
    timezone: string;
    userId?: string;
    apiKeyId?: string;
    filesLimitExceeded: boolean;
}

export async function finaliseUpload(successFiles: typeof filesDb.$inferInsert[], failedFiles: { filename: string; reason: string }[], receivedCount: number, cleanup: () => Promise<void>, ctx: FinaliseUploadContext): Promise<Response> {
    if (ctx.filesLimitExceeded) {
        await cleanup();
        return errorToResponse(new InvalidConfigurationError("You can only upload a maximum of 20 files at a time."));
    }
    if (receivedCount === 0) {
        return errorToResponse(new InvalidConfigurationError("No files were uploaded."));
    }
    if (successFiles.length === 0) {
        return errorToResponse(new InvalidConfigurationError("All file uploads failed. Please check your configuration and try again."));
    }
    const totalUploadSize = successFiles.reduce((acc, file) => acc + file.size, 0);
    if (ctx.codeBody) {
        if (receivedCount !== ctx.codeBody.fileCount) {
            await cleanup();
            return errorToResponse(new InvalidConfigurationError(`This code is meant to upload exactly ${ctx.codeBody.fileCount} files. You provided ${receivedCount}.`));
        }
        if (ctx.codeBody.maximumFileSize !== undefined && successFiles.some((file) => file.size > ctx.codeBody!.maximumFileSize!)) {
            await cleanup();
            return errorToResponse(new InvalidConfigurationError(`One or more files exceed the grant code's maximum allowed file size of ${ctx.codeBody.maximumFileSize} bytes.`));
        }
        if (ctx.codeBody.maximumTotalSize && totalUploadSize > ctx.codeBody.maximumTotalSize) {
            await cleanup();
            return errorToResponse(new InvalidConfigurationError(`Uploading your payload would exceed the grant code's maximum total size by ${totalUploadSize - ctx.codeBody.maximumTotalSize} bytes.`));
        }
    }
    if (ctx.appLimit > 0) {
        const totalAppSize = (await db.select({ totalSize: sum(filesDb.size) }).from(filesDb).where(eq(filesDb.applicationId, ctx.appId)))[0]?.totalSize;
        const passedApp = passLimit({ incomingSize: totalUploadSize, currentSize: totalAppSize ? Number(totalAppSize) : 0, limit: ctx.appLimit });
        if (!passedApp.success) {
            await cleanup();
            return Response.json({ error: "LimitExceededError", message: `Uploading your payload would exceed the application's file limit by ${passedApp.exceedsBy} bytes.`, exceedsBy: passedApp.exceedsBy }, { status: 403 });
        }
    }
    if (ctx.dbLimit > 0) {
        const totalDbSize = (await db.select({ totalSize: sum(filesDb.size) }).from(filesDb).where(eq(filesDb.databaseId, ctx.databaseId)))[0]?.totalSize;
        const passedDb = passLimit({ incomingSize: totalUploadSize, currentSize: totalDbSize ? Number(totalDbSize) : 0, limit: ctx.dbLimit });
        if (!passedDb.success) {
            await cleanup();
            return Response.json({ error: "LimitExceededError", message: `Uploading your payload would exceed the database's file limit by ${passedDb.exceedsBy} bytes.`, exceedsBy: passedDb.exceedsBy }, { status: 403 });
        }
    }
    await db.insert(filesDb).values(successFiles);
    await updateRequestsAnalyticsEvent({ increment: 1, appId: ctx.appId, timezone: ctx.timezone });
    await updateFilesAnalyticsEvent({ increment: successFiles.length, appId: ctx.appId, timezone: ctx.timezone });
    await updateSizeAnalyticsEvent({ increment: totalUploadSize, appId: ctx.appId, timezone: ctx.timezone });
    await makeAppLog({ appId: ctx.appId, code: "FILE_CREATED", data: { files: successFiles.map((f) => ({ id: f.id, name: f.name, size: f.size })) }, userId: ctx.userId, apiKeyId: ctx.apiKeyId });
    await makeDbLog({ dbId: ctx.databaseId, code: "FILE_CREATED", data: { files: successFiles.map((f) => ({ id: f.id, name: f.name, size: f.size })) }, userId: ctx.userId, appId: ctx.appId });
    return Response.json({ uploads: successFiles, failed: failedFiles }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
