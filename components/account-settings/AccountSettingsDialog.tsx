'use client';
import { User } from "@/lib/schema/schemaTypes";
import { Dialog, DialogContent } from "../ui/dialog";
import { Bell, Info, Shield, UserIcon } from "lucide-react";
import AccountSettings from "./pages/AccountSettings";
import NotificationSettings from "./pages/NotificationSettings";
import { useState } from "react";
import { Button } from "../ui/button";

export default function AccountSettingsDialog({open, setOpen, user}: {open: boolean, setOpen: (open: boolean) => void, user: User}) {
    const pages = [
        {
            name: "Account",
            icon: UserIcon,
            component: AccountSettings
        },
        {
            name: "Security",
            icon: Shield,
            component: AccountSettings
        },
        {
            name: "Notifications",
            icon: Bell,
            component: NotificationSettings
        },
        {
            name: "About",
            icon: Info,
            component: AccountSettings
        },
    ]
    const [selectedPageIndex, setSelectedPageIndex] = useState(2);
    const activePage = pages[selectedPageIndex];
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-[700px] h-full max-h-[calc(100%-40px)] sm:max-h-[500px] p-0 flex flex-col">
            <div className="flex h-full">
                <div className="w-[200px] border-r border-border/50 py-4 px-2 space-y-1">
                    {pages.map((page, index)=>{
                        return <Button key={page.name} size="sm" className={`w-full justify-start ${selectedPageIndex == index ? "bg-border" : "hover:bg-accent"} gap-2 pl-3`} variant={selectedPageIndex === index ? "secondary" : "ghost"} onClick={() => setSelectedPageIndex(index)}><page.icon/> {page.name}</Button>
                    })}
                    <div className="flex-1"/>
                </div>
                <div className="flex-1 h-full flex flex-col p-6">
                    <activePage.component user={user}/>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}