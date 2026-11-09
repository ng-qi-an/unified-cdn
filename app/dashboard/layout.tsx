import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const instant = false;

export default async function Layout({children}: {children: React.ReactNode}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session){
        return <div className="flex h-full">
            <SidebarProvider>
                <DashboardSidebar/>
                <main className="min-w-0 w-full h-screen">
                    {children} 
                </main>
            </SidebarProvider>
        </div>
    } else {
        redirect("/auth/sign-in", "replace");
    }
}