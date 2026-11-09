'use client';
import { SiteConfigType } from "@/lib/actions/site-settings/siteConfigType";
import GeneralSiteSettings from "./sections/GeneralSiteSettings";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";


export default function SiteSettingsRenderedClient({siteConfig}: {siteConfig: GetSiteConfigReturnType}){
    return <div className="grid grid-cols-1 lg:grid-cols-2 w-full pt-4 gap-2">
        <GeneralSiteSettings siteConfig={siteConfig}/>
    </div>
}