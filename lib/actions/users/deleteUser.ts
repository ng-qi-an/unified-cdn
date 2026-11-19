import { deleteFiles } from "../files/deleteFiles";
import { applications, databases } from "@/lib/schema/schema";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { getS3Client } from "@/lib/providers/s3/getClient";
import { DeleteBucketCommand } from "@aws-sdk/client-s3";
import { isCredentialError } from "@/lib/providers/s3/isCredentialError";
import { Application, Database } from "@/lib/schema/schemaTypes";
import { apikey, user } from "@/lib/schema/auth-schema";



type DeleteTargetApp = Application & {files: { id: string; key: string }[]; database: { keys: Record<string, string>; provider: string } | null};

type DeleteTargetDatabase = Database & {files: { id: string; key: string }[]};

export default async function deleteUser(targetUser: { id: string; applications: DeleteTargetApp[]; databases: DeleteTargetDatabase[] }){
    let deletedFiles: string[] = []
    const userKeys = await db.select().from(apikey).where(eq(apikey.referenceId, targetUser.id));
    const appResponse = await Promise.all(targetUser.applications.map(async (app) => {
        try {
            const appKeys = userKeys.filter((key)=> {try {return key.metadata && JSON.parse(key.metadata).appId == app.id} catch {return false}}).map((key)=> key.id);
            if (app.files.length > 0 && app.database) {
                const {deleted} = await deleteFiles({filesFromDb: app.files, keys: app.database.keys, provider: app.database.provider});
                deletedFiles = [...deletedFiles, ...deleted];
                if (deleted.length < app.files.length){
                    console.log("Some files could not be deleted for app", app.name);
                    await db.delete(applications).where(eq(applications.id, app.id));
                    try {
                        await db.delete(apikey).where(and(eq(apikey.referenceId, targetUser.id), inArray(apikey.id, appKeys)));
                    } catch (error) {
                        console.log("Error deleting user API keys for app", app.name, ":", error, "but will be caught in catch all.");
                    }
                    return {status: "warning", message: `Could not delete the files for app ${app.name}. The bucket is at ${app.database.keys.bucketName} on ${app.database.provider}`};
                }
            }
            await db.delete(applications).where(eq(applications.id, app.id));
            try {
                await db.delete(apikey).where(and(eq(apikey.referenceId, targetUser.id), inArray(apikey.id, appKeys)));
            } catch (error) {
                console.log("Error deleting user API keys for app", app.name, ":", error, "but will be caught in catch all.");
            }
            return {status: "success", message: `Application ${app.name} deleted successfully.`};
        
        } catch (error) {
            console.error("Error deleting user applications:", error);
            return {status: "error", message: `Could not delete the application ${app.name}. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
        }
    }))
    if (appResponse.some(r => r.status === "error")){
        return {error: "FAILED_DELETE_APP_OBJECTS", message: "Some applications could not be deleted. Check details for exact failures.", details: appResponse};
    }
    // Delete user databases
    const response: {status: "success" | "warning" | "error", message: string}[] = await Promise.all(targetUser.databases.map(async (database) => {
        try {
            let promiseResponse: {status: "success" | "warning" | "error", message: string} = {status: "success", message: "Database items deleted successfully."};
            const remainingFiles = database.files.filter((file)=> !deletedFiles.includes(file.id));
            if (remainingFiles.length > 0) {
                const {deleted} = await deleteFiles({filesFromDb: remainingFiles, keys: database.keys, provider: database.provider});
                if (deleted.length < remainingFiles.length){
                    console.log("Some files could not be deleted for database", database.id);
                    promiseResponse = {status: "warning", message: `Could not delete the files for database ${database.name}. The bucket is at ${database.keys.bucketName} on ${database.provider}`};
                }
            }
            if (promiseResponse.status == "success"){
                if (database.provider.startsWith("s3-")) {
                    const client = getS3Client(database.keys.accessUrl, database.keys.accessKeyId, database.keys.secretAccessKey, database.keys.region);
                    try {
                        const r = await client.send(new DeleteBucketCommand({ Bucket: database.keys.bucketName }));
                        console.log("Delete bucket response meta:", r.$metadata);
                        if (r.$metadata.httpStatusCode != 204){
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. Delete the bucket manually instead.`};
                        }
                    } catch (error) {
                        if (isCredentialError(error) || error instanceof Error && (error.message.includes("ENOTFOUND") || error.name == "InvalidArgument")) {
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. Delete the bucket manually instead.`};
                        } else if (error instanceof Error && error.name == "BucketNotEmpty"){
                            promiseResponse = {status: "warning", message: `Could not delete the bucket ${database.keys.bucketName} on ${database.provider} for DB ${database.name}. There are still extra files in your bucket. Delete your bucket manually instead.`};
                        } else {
                            console.error("Unknown error deleting bucket:", error);
                            if (error instanceof Error) {
                                promiseResponse = {status: "error", message: error.message};
                            } else {
                                promiseResponse = {status: "error", message: "An unknown error occurred."};
                            }
                        }
                    }
                }
            }
            if (promiseResponse && promiseResponse.status == "error") {
                return promiseResponse;
            }
            try {
                await db.delete(databases).where(and(eq(databases.id, database.id), eq(databases.ownerId, targetUser.id)));
            } catch (error) {
                return {status: "error", message: `Could not delete the database ${database.name} from the database. The bucket has been deleted. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
            }
            return promiseResponse;
        } catch (error) {
            console.error("Error deleting files for database", database.id, ":", error);
            return {status: "error", message: `Could not delete the files for database ${database.name}. The bucket is at ${database.keys.bucketName} on ${database.provider}. Error: ${error instanceof Error ? error.message : "Unknown error"}`};
        }
    }))
    const combinedResponse = [...appResponse, ...response];
    if (combinedResponse.some(r => r.status === "error")){
        return {error: "FAILED_DELETE_DB_OBJECTS", message: "Some databases/applications could not be deleted. Check details for exact failures.", details: combinedResponse};
    }
    try {
        const deleteRes = await db.delete(user).where(eq(user.id, targetUser.id));
        if (deleteRes.rowCount == 0) {
            return {error: "FAILED_DELETE_USER", message: "Could not delete the user. No error is provided.", details: combinedResponse};
        }
    } catch (error) {
        console.error("Error deleting user from database:", error);
        return {error: "FAILED_DELETE_USER", message: `Could not delete the user. Error: ${error instanceof Error ? error.message : "Unknown error"}`, details: combinedResponse};
    }
    try {
        await db.delete(apikey).where(and(eq(apikey.referenceId, targetUser.id)));
    } catch (error) {
        console.error("Error deleting user API keys from database:", error);
        combinedResponse.push({status: "warning", message: `Could not delete the user's API keys (used reference id ${targetUser.id}). Error: ${error instanceof Error ? error.message : "Unknown error"}`});
    }
    return {status: "success", details: combinedResponse};
}