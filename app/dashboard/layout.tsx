import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DemoModeDialog from "@/components/DemoModeDialog";
import { cn } from "cn";
import ColorThemeProvider from "@/components/providers/color-theme-provider";

export const instant = false;

export default async function Layout({children}: {children: React.ReactNode}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session){
        return <ColorThemeProvider initialColorTheme={session.user.theme}>
            <div className={cn("flex h-full")}>
                <SidebarProvider>
                    <DemoModeDialog/>
                    <DashboardSidebar/>
                    <main className="min-w-0 w-full h-screen">
                        {children} 
                    </main>
                </SidebarProvider>
            </div>
        </ColorThemeProvider>
    } else {
        redirect("/auth/sign-in", "replace");
    }
}