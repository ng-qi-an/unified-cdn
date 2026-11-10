'use server';
import { SiteConfigType } from "./siteConfigType";
import unLinkSiteNotificationMethod from "./unlinkSiteNotificationMethod";

export default async function unlinkSiteNotificationMethodClient(method: keyof SiteConfigType["notifications"]["methods"]) {
    return await unLinkSiteNotificationMethod(method);  
}