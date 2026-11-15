import { GrantCodeActions } from "@/lib/actions/files/grant-codes/grantCodeActions";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrCodeOrUser } from "@/lib/permissions/serverPermissionHelpers";
import { files as filesDb } from "@/lib/schema/schema";
import { and, eq, inArray } from "drizzle-orm";

export const GET = verifyAPIKeyOrCodeOrUser("GET_FILES", async (req, ctx, apiKey, user, code) => {
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.timezone){
        return errorToResponse(new InvalidConfigurationError("The site's timezone is not set."));
    }
    if (code){
        const codeBody = code.data as GrantCodeActions["GET_FILES"];
        if (!codeBody || !codeBody.fileIds || !Array.isArray(codeBody.fileIds) || codeBody.fileIds.length === 0){
            return errorToResponse(new InvalidConfigurationError("The grant code does not have the required data."));
        }
    }
    let appData;
    if (apiKey){
        appData = await db.query.applications.findFirst({where: {id: apiKey.metadata?.appId}, columns: {id: true}}) ?? null;
    } else if (user){
        if (!req.nextUrl.searchParams.get("appId")){
            return errorToResponse(new InvalidConfigurationError("Missing appId in form data."));
        }
        const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
        appData = await db.query.applications.findFirst({where: {id: req.nextUrl.searchParams.get("appId") as string, ownerId: !viewAllPerms.isAuthorised ? user.id : {isNotNull: true}}, columns: {id: true}}) ?? null;
    }
    if (!appData){
        return errorToResponse(new UnauthorisedError());
    }
    const fileIds = req.nextUrl.searchParams.getAll("id");
    const files = await db.select().from(filesDb).where(and(eq(filesDb.applicationId, appData.id), inArray(filesDb.id, fileIds)));
    if (files.length === 0){
        return errorToResponse(new InvalidConfigurationError("No files found for the provided ids."));
    }
    return Response.json(files, {status: 200});
})