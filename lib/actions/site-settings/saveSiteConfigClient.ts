'use server';

import saveSiteConfig from "./saveSiteConfig";
import type { SiteConfigType } from "./siteConfigType";

export default async function saveSiteConfigClient<K extends keyof SiteConfigType>(
    keys: K[] | K,
    value: Pick<SiteConfigType, K>,
) {
    return await saveSiteConfig(keys, value);
}
