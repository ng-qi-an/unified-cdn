import updateRequestsAnalyticsEvent from "@/lib/actions/analytics/updateRequestsAnalyticsEvent";
import { GrantCodeActions } from "@/lib/actions/files/grant-codes/grantCodeActions";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrCodeOrUser } from "@/lib/permissions/serverPermissionHelpers";

export const GET = verifyAPIKeyOrCodeOrUser("GET_FILE", async (req, ctx: { params: Promise<{ id: string }> }, apiKey, user, code) => {
    const { id } = await ctx.params;
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.timezone){
        return errorToResponse(new InvalidConfigurationError("The site's timezone is not set."));
    }
    if (code){
        const codeBody = code.data as GrantCodeActions["GET_FILE"];
        if (!codeBody || !codeBody.fileId){
            return errorToResponse(new InvalidConfigurationError("The grant code does not have the required data."));
        } else {
            if (codeBody.fileId !== id){
                return errorToResponse(new InvalidConfigurationError("The file provided does not match the file allowed by the grant code."));
            }
        }
    }
    const file = await db.query.files.findFirst({where: {id}, with: {applications: {columns: {ownerId: true}}}});
    if (!file){
        return errorToResponse(new NotFoundError());
    }
    if (apiKey && apiKey.metadata?.appId != file.applicationId){
        return errorToResponse(new UnauthorisedError());
    } else if (user){
        const viewAllPerms = await userHasPermissionServer({applications: ['viewAll']}, user);
        if (!viewAllPerms.isAuthorised && user.id != file.applications?.ownerId){
            return errorToResponse(new UnauthorisedError());
        }
    }
    await updateRequestsAnalyticsEvent({increment: 1, appId: file.applicationId, timezone: siteConfig.general.timezone});
    const { applications, ...actualFile  } = file;
    return Response.json(actualFile, {status: 200});
})