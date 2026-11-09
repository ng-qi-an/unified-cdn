import { db } from "@/lib/db";
import { SiteConfigType } from "./siteConfigType";
import { siteConfig } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";
import getSiteConfig from "./getSiteConfig";
import { updateTag } from "next/cache";
import { makeAuditLog } from "../logs/makeAuditLog";
import getUpdatedKeys from "./getUpdatedKeys";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { userHasPermissionServer } from "@/lib/permissions/serverPermissionHelpers";
import sendNotification from "../notifications/sendNotification";

export default async function saveSiteConfig<K extends keyof SiteConfigType>(keys: K[] | K, value: Pick<SiteConfigType, K>){
    const data = await auth.api.getSession({
        headers: await headers()
    })
    if (!data || !data.user) {
        throw new Error("Unauthorised")
    }
    const hasPermission = await userHasPermissionServer({siteConfig: ["update"]}, data.user);
    if (!hasPermission.isAuthorised) {
        throw new Error("Unauthorised")
    }
    const formerSiteConfig = await getSiteConfig();
    if (!formerSiteConfig.raw) {
        throw new Error("Site config not found");
    }
    const { raw: _raw, ...config } = formerSiteConfig;
    const payload = {
        ...config,
        ...value
    };
    const updatedKeys = (Array.isArray(keys) ? keys : [keys]).flatMap((key) =>
        getUpdatedKeys(config[key], payload[key], key),
    );
    await db.update(siteConfig).set({value: payload}).where(eq(siteConfig.id, "default"));
    await makeAuditLog({code: "SITE_CONFIG_EDITED", data: {updatedKeys}, userId: data.user.id});
    await sendNotification("SITE_CONFIG_UPDATED", {userGroup: "admins", updatedKeys, triggerUser: data.user, link: "/dashboard/admin/settings"});
    updateTag("siteDefaultConfig");
    return true;
}