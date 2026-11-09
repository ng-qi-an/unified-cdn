import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { redirect } from "next/navigation";

export default async function SignupLayout({children}: {children: React.ReactNode}){
    const siteConfig = await getSiteConfig();
    if (siteConfig.auth.allowSignups === false){
        return redirect("/auth/sign-in");
    } else {
        return children
    }
}