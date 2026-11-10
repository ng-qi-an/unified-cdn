import { Resend } from "resend";
import getSiteConfig from "./getSiteConfig";
import saveSiteConfig from "./saveSiteConfig";
import { defaultSiteConfig, SiteConfigType } from "./siteConfigType";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";

 

export default async function unLinkSiteNotificationMethod(method: keyof SiteConfigType["notifications"]["methods"]){
    const siteConfig = await getSiteConfig();
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session || !session.user){
        throw new Error("Unauthorised.")
    }
    const hasPermission = await userHasPermissionServer({siteConfig: ["update"]}, session.user);
    if (!hasPermission.isAuthorised) {
        throw new Error("Unauthorised")
    }
    await saveSiteConfig("notifications", {
        notifications: {
            ...siteConfig.notifications,
            methods: {
                ...siteConfig.notifications.methods,
                [method]: defaultSiteConfig.notifications.methods[method]
            }
        }
    })
}