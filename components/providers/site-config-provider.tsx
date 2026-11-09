'use client';
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import getSiteConfigClient from "@/lib/actions/site-settings/getSiteConfigClient";
import { defaultSiteConfig } from "@/lib/actions/site-settings/siteConfigType";
import { createContext, useContext, useEffect, useState } from "react";

const placeholderSiteConfig: GetSiteConfigReturnType = { ...defaultSiteConfig, raw: null };

const SiteConfigContext = createContext<GetSiteConfigReturnType>(placeholderSiteConfig);
export const useSiteConfig = () => useContext(SiteConfigContext);


export default function SiteConfigProvider({children, initialSiteConfig}: {children: React.ReactNode; initialSiteConfig: GetSiteConfigReturnType}){
    return <SiteConfigContext.Provider value={initialSiteConfig}>
        {children}
    </SiteConfigContext.Provider>
}