import updateRequestsAnalyticsEvent from "@/lib/actions/analytics/updateRequestsAnalyticsEvent";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { InvalidConfigurationError, NotFoundError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse, userHasPermissionServer, verifyAPIKeyOrUser } from "@/lib/permissions/serverPermissionHelpers";

export const GET = verifyAPIKeyOrUser(async (req, ctx: { params: Promise<{ id: string }> }, apiKey, user) => {
    const { id } = await ctx.params;
    const file = await db.query.files.findFirst({where: {id}, with: {applications: {columns: {ownerId: true}}}});
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.timezone){
        return errorToResponse(new InvalidConfigurationError("The site's timezone is not set."));
    }
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