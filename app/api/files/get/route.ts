import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrCodeOrUser } from "@/lib/permissions/serverPermissionHelpers";
import { files as filesDb } from "@/lib/schema/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";

export const GET = verifyAPIKeyOrCodeOrUser("GET_FILES", async (req, ctx, apiKey, user, code) => {
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.timezone){
        return errorToResponse(new InvalidConfigurationError("The site's timezone is not set."));
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
    const fileIds = req.nextUrl.searchParams.get("ids")?.split(", ") ?? [];
    if (code){
        if (code.data.fileIds && code.data.fileIds.length > 0 && JSON.stringify(code.data.fileIds.sort()) != JSON.stringify(fileIds.sort())){
            return errorToResponse(new UnauthorisedError("The file IDs provided do not match the file IDs allowed by the grant code."));
        }
    }
    const files = await db.select().from(filesDb).where(and(eq(filesDb.applicationId, appData.id), fileIds.length > 0 ? inArray(filesDb.id, fileIds) : isNotNull(filesDb.id)));
    return Response.json({files: files}, {status: 200});
})