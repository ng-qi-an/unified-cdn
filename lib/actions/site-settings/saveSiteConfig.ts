import { db } from "@/lib/db";
import { SiteConfigType } from "./siteConfigType";
import { siteConfig } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";
import getSiteConfig from "./getSiteConfig";
import { updateTag } from "next/cache";

export default async function saveSiteConfig<K extends keyof SiteConfigType>(keys: K[] | K, value: Pick<SiteConfigType, K>){
    const formerSiteConfig = await getSiteConfig();
    if (!formerSiteConfig.raw) {
        throw new Error("Site config not found");
    }
    const { raw: _raw, ...config } = formerSiteConfig;
    const payload = {
        ...config,
        ...value
    };
    await db.update(siteConfig).set({value: payload}).where(eq(siteConfig.id, "default"));
    updateTag("siteDefaultConfig");
    return true;
}