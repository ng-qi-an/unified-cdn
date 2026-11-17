import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import deleteUser from "@/lib/actions/users/deleteUser";
import { db } from "@/lib/db";
import { InsufficientPermissionsError, InvalidConfigurationError, UnauthorisedError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    const siteConfig = await getSiteConfig();
    if (!siteConfig.general.demoMode){
        return errorToResponse(new InsufficientPermissionsError("Demo mode is not enabled."));
    }
    const reqKey = req.nextUrl.searchParams.get("key")
    if (!siteConfig.general.demoResetKey){
        return errorToResponse(new InvalidConfigurationError("Demo reset key is not set. Please set a demo reset key in the site settings."));
    }
    if (!reqKey || reqKey !== siteConfig.general.demoResetKey){
        return errorToResponse(new UnauthorisedError("Invalid demo reset key."));
    }
    const nonSuperAdminUsers = await db.query.user.findMany({
        where: {
            NOT: {
                role: "superAdmin"
            }
        },
        with: {
            applications: {
                with: {
                    database: true,
                    files: true
                }
            },
            databases: {
                with: {
                    files: true
                }
            }
        }
    })
    const responses = await Promise.all(nonSuperAdminUsers.map(async (user) => {
        return await deleteUser(user);
    }))
    const success = responses.filter(res => !res.error && res.details.filter(d => d.status == "warning").length == 0)
    const warning = responses.filter(res => !res.error && res.details.filter(d => d.status == "warning").length > 0)
    const failed = responses.filter(res => res.error)
    return Response.json({status: "OK", success, warning, failed}, {status: 200})
}