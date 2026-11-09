import { db } from "@/lib/db";
import { siteConfig } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { defaultSiteConfig, SiteConfigType } from "./siteConfigType";

async function fetchSiteConfig() {
    const [siteSettings] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.id, "default"));
    return siteSettings ? siteSettings.value : null;
}

// Fresh cache key per process, so each deployment/dev-server restart re-fetches once
const instanceKey = crypto.randomUUID();

const getCachedSiteConfig = unstable_cache(fetchSiteConfig, ["site-default-config", instanceKey], {tags: ["siteDefaultConfig"]});

export type GetSiteConfigReturnType = SiteConfigType & {raw: SiteConfigType | null};

export default async function getSiteConfig(): Promise<GetSiteConfigReturnType> {
    const siteConfig = await getCachedSiteConfig();
    return { ...defaultSiteConfig, ...siteConfig, raw: siteConfig };
}