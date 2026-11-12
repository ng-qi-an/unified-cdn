import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { db } from "@/lib/db";
import { user } from "@/lib/schema/auth-schema";
import { redirect } from "next/navigation";

export const instant = false;

export default async function SetupGeneralLayout({children}: {children: React.ReactNode}) {
    const users = await db.select().from(user);
    if (users.length == 0){
        return redirect("/setup/admin");
    } else {
        const siteConfig = await getSiteConfig();
        if (siteConfig.raw){
            return redirect("/setup/complete");
        }
        return children
    }
}