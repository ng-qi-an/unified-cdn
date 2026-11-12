'use server';

import { db } from "@/lib/db";
import { defaultSiteConfig, SiteConfigType } from "./siteConfigType";
import { siteConfig } from "@/lib/schema/schema";
import { updateTag } from "next/cache";

export default async function setupSiteConfigClient(value: Partial<SiteConfigType>){
    const payload: typeof siteConfig.$inferInsert = {
        id: "default",
        value: {
            ...defaultSiteConfig,
            ...value
        }
    }
    await db.insert(siteConfig).values(payload);
    updateTag("siteDefaultConfig");
    return true;
}