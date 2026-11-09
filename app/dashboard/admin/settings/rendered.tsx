import SiteSettingsRenderedClient from "./client";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import Link from "next/link";

export default async function SiteSettingsRendered(){
    const siteConfig = await getSiteConfig();
    if  (!siteConfig.raw) {
        return <Empty>
            <EmptyMedia variant="icon">
                <Settings/>
            </EmptyMedia>
            <EmptyHeader>
                <EmptyTitle>Setup required</EmptyTitle>
                <EmptyDescription>This site hasn't been initialised correctly. Click the button below to continue.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Link href="/dashboard/admin/settings/setup">
                    <Button>Start setup</Button>
                </Link>
            </EmptyContent>
        </Empty>
    } else {
        return <SiteSettingsRenderedClient siteConfig={siteConfig}/>
    }
}