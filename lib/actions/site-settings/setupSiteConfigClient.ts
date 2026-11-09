'use server';

import { db } from "@/lib/db";
import { defaultSiteConfig } from "./siteConfigType";
import { siteConfig } from "@/lib/schema/schema";
import { updateTag } from "next/cache";

export default async function setupSiteConfigClient({timezone, allowSignups}: {timezone: string, allowSignups: boolean}){
    const payload: typeof siteConfig.$inferInsert = {
        id: "default",
        value: {
            ...defaultSiteConfig,
            general: {
                ...defaultSiteConfig.general,
                timezone: timezone,
            },
            auth: {
                ...defaultSiteConfig.auth,
                allowSignups: allowSignups,
            }
        }
    }
    await db.insert(siteConfig).values(payload);
    updateTag("siteDefaultConfig");
    return true;
}