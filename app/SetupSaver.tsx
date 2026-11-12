'use client';
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SetupSaver({siteConfig}: {siteConfig: GetSiteConfigReturnType}) {
    const pathname = usePathname();
    useEffect(()=>{
        if (!siteConfig.raw && !pathname.startsWith("/setup")){
            window.location.href = "/setup";
        }
    }, [pathname])
    return <></>
}