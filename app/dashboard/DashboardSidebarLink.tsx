'use client';

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardSidebarLink({href, Icon, name, external}: {href: string, Icon: ReactNode, name: string, external?: boolean}){
    const pathname = usePathname();
    return <Link href={pathname == href ? "" : href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname == href}>{Icon}{name}</SidebarMenuButton>
        </SidebarMenuItem>
    </Link>
}