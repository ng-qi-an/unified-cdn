import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { redirect } from "next/navigation";

export default async function SiteSettingsSetupLayout({ children }: { children: React.ReactNode }) {
    const siteConfig = await getSiteConfig();
    if (siteConfig.raw){
        redirect("/dashboard/admin/settings")
    }
    return children;
}