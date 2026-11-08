'use client';
import AccountSettingsDialog from "@/components/account-settings/AccountSettingsDialog";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { Notification, User } from "@/lib/schema/schemaTypes";
import { UserWithRole } from "better-auth/plugins";
import { Bell, Check, ChevronsUpDown, LaptopMinimal, LogOut, Moon, Palette, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserDropdown({user}:{user: User}){
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [accSettingsOpen, setAccSettingsOpen] = useState(false);

    return <>
        <AccountSettingsDialog open={accSettingsOpen} setOpen={setAccSettingsOpen} user={user}/>
        <DropdownMenu>
            <div className="flex items-center w-full">
                <DropdownMenuTrigger nativeButton={true} render={
                    <SidebarMenuButton size="default" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12">
                        <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback className="rounded-full">CN</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                }/>
                <NotificationPopover open={notifOpen} setOpen={setNotifOpen} userId={user.id} notifications={notifications} setNotifications={setNotifications}>
                    <Button size="icon" className="min-h-12 hover:bg-sidebar-accent!" variant="ghost">
                        <Bell/>
                    </Button>
                </NotificationPopover>
            </div>
            <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={ "top"}
            align="start"
            sideOffset={4}
            >
            <DropdownMenuGroup>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setAccSettingsOpen(true)}><Settings />Settings</DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger><Palette/> Theme</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>{theme == "light" ? <Check/> : <Sun/>} Light</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>{theme == "dark" ? <Check/> : <Moon/>} Dark</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>{theme == "system" ? <Check/> : <LaptopMinimal/>} System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={async()=> await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.replace("/auth/sign-in");
                    },
                    onError: (error) => {
                        toast.add({
                            title: "Error signing out",
                            description: error.error.message || "An unknown error occurred.",
                            type: "error",
                        })
                    },
                },
            })}>
                <LogOut />
                Log out
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </>
}
