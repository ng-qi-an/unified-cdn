import { Label } from "@/components/ui/label";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { AppWindowMac, Book, Database, ExternalLink, Home, Key, Logs, Search, Settings, Shield, Users } from "lucide-react";
import { Suspense } from "react";
import UserDropdown from "./UserDropdown";
import DashboardSidebarLink from "./DashboardSidebarLink";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Logo from "@/components/Logo";
import { SiGithub } from "@icons-pack/react-simple-icons";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";


export default async function DashboardSidebar() {
    const data = await auth.api.getSession({
        headers: await headers()
    })
    if (!data?.user) return null;
    const siteConfig = await getSiteConfig();

    const links: {[header: string]: {name: string, href: string, external?: boolean, icon: React.ReactNode}[]} = {
        navigation: [
            {name: "Dashboard", href: "/dashboard", icon: <Home/>},
            {name: "Applications", href: "/dashboard/applications", icon: <AppWindowMac/>},
            {name: "API Keys", href: "/dashboard/api-keys", icon: <Key/>},
            {name: "Logs", href: "/dashboard/logs", icon: <Logs/>},
        ],
        ...(data.user.role == "admin" || data.user.role == "superAdmin" ? {
            management: [
                    {name: "Users", href: "/dashboard/admin/users", icon: <Users/>},
                    {name: "Databases", href: "/dashboard/admin/databases", icon: <Database/>},
                    {name: "Audit", href: "/dashboard/admin/audit", icon: <Shield/>},
                    {name: "Settings", href: "/dashboard/admin/settings", icon: <Settings/>},
            ],
        } : {}),
        help: [
            {name: "Documentation", href: "/docs", external: true, icon: <Book/>},
            {name: "Github", href: "/github", external: true, icon: <SiGithub/>},
        ]
    }
    return <Sidebar>
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-2! mt-1 hover:bg-transparent active:bg-transparent">
                        <Logo className="size-5 ml-1"/>
                        <div className="flex flex-col">
                            <span className="text-base font-medium">Unified CDN</span>
                            {siteConfig.general.demoMode && <span className="text-xs -mt-0.5 text-muted-foreground">Demo mode</span>}
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <Label htmlFor="search" className="sr-only">
                        Search
                    </Label>
                    <SidebarInput
                        id="search"
                        placeholder="Search for anything..."
                        className="pl-8"
                    />
                    <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
            {Object.values(links).map((group, index: number) => {
              return <SidebarGroup key={index}>
                <SidebarGroupLabel>{Object.keys(links)[index]}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {group.map((link, index: number) => {
                            return <DashboardSidebarLink key={index} href={link.href} Icon={link.icon} name={link.name} external={link.external}/>
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>  
            })}
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Suspense fallback={<div className="p-2">Loading...</div>}>
                        <UserDropdown user={data.user}/>
                    </Suspense>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
}