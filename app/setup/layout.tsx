import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { redirect } from "next/navigation";
import SetupBackground from "./SetupBackground";

export default async function SetupLayout({children}: {children: React.ReactNode}) {
    return <div className="h-screen w-screen overflow-hidden relative">
        <SetupBackground/>
        {children}
    </div>;
}