import { Notification } from "@/lib/schema/schemaTypes";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "../ui/popover";
import { useEffect, useState } from "react";
import getNotificationsClient from "@/lib/actions/notifications/getNotificationsClient";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { Bell, Check, ChevronLeft, ChevronRight, Circle, MailDot, MailOpen, Mails } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import markAllNotificationsReadClient from "@/lib/actions/notifications/markAllNotificationsReadClient";
import markNotificationClient from "@/lib/actions/notifications/markNotificationClient";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

const limit = 10;

export default function NotificationPopover({userId, open, setOpen, notifications, setNotifications, children}: {userId: string, open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, notifications: Notification[], setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>, children: React.ReactNode}) {
    const [page, setPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    useEffect(()=>{
        (async()=>{
            const data = await getNotificationsClient(userId, {page, limit, showUnreadOnly});
            setNotifications(data.notifications)
            setTotalNotifications(data.total)
        })();
    }, [page, showUnreadOnly])
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger nativeButton={false} render={<span>
            {children}    
        </span>}/>
        <PopoverContent className="w-[400px]">
            <PopoverHeader>
                <div className="flex items-center pl-2">
                    <PopoverTitle>Notifications</PopoverTitle>
                    <Button title={showUnreadOnly ? "Show all notifications" : "Show unread only"} size="icon-xs" variant="ghost" className="ml-auto mr-2" onClick={()=>{
                        setShowUnreadOnly(!showUnreadOnly);
                        setPage(1);
                    }}>{showUnreadOnly ? <Mails/> : <MailOpen/>} </Button>
                    <Button title={"Mark all as read"} size="icon-xs" variant="ghost" onClick={()=>{
                        setNotifications(notifications.map(n => ({...n, read: true})));
                        markAllNotificationsReadClient(userId);
                    }}><Check/></Button>
                </div>
            </PopoverHeader>
            <div className="h-[400px] overflow-auto scroll-fade">
                {notifications.length > 0 ? notifications.map((notification, index)=>{
                    return <Link href={(notification.link && notification.read == false) ? notification.link : ""} key={notification.id} onClick={()=>{
                        setNotifications(notifications.map(n => n.id === notification.id ? {...n, read: true} : n));                            
                        markNotificationClient(notification.id, true);
                        if (notification.link && notification.read == false) {
                            setOpen(false);
                        }
                    }} className="cursor-default">
                        <Item title={notification.link ? "Open" : "Mark as read"} size="sm" className={`${index == 0 && "border-t-0"} border-b-0 border-l-0 border-r-0 border-border ${notification.read == true ? "opacity-60" : "hover:bg-secondary cursor-pointer"} gap-1 group`}>
                            <ItemContent>
                                <ItemTitle>{notification.title}</ItemTitle>
                                <ItemDescription className="text-sm line-clamp-2 group-hover:line-clamp-none">{notification.message}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button size="icon-sm" variant="ghost" className="hover:bg-border! group-hover:opacity-100 opacity-0" onClick={(e)=>{
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (notification.read == false) {
                                        markNotificationClient(notification.id, true);
                                        setNotifications(notifications.map(n => n.id === notification.id ? {...n, read: true} : n));
                                    } else {
                                        markNotificationClient(notification.id, false);
                                        setNotifications(notifications.map(n => n.id === notification.id ? {...n, read: false} : n));
                                    }
                                }}>
                                    {notification.read ? <MailDot/> : <MailOpen/>}
                                </Button>
                            </ItemActions>
                        </Item>
                    </Link>
                }) : <Empty className="h-full">
                    <EmptyMedia variant="icon">
                        <Bell/>
                    </EmptyMedia>
                    <EmptyHeader>
                        <EmptyTitle>No notifications</EmptyTitle>
                        <EmptyDescription>You're all caught up!</EmptyDescription>  
                    </EmptyHeader>
                </Empty>}
            </div>
            <div className="flex items-center pl-2">
                {notifications.length > 0 && <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalNotifications)} of {totalNotifications}
                </p>}
                <Button size="icon-sm" variant="ghost" className="ml-auto" onClick={()=> setPage(Math.max(page - 1, 1))} disabled={page == 1}>
                    <ChevronLeft/>
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={()=> setPage(page + 1)} disabled={totalNotifications <= page * limit}>
                    <ChevronRight/>
                </Button>
            </div>
        </PopoverContent>
    </Popover>
}