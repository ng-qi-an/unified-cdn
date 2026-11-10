import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import { SiTelegram } from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import { useState } from "react";
import EmailLinkDialog from "./notifDialogs/EmailLinkDialog";
import EmailEditDialog from "./notifDialogs/EmailEditDialog";
import TelegramLinkDialog from "./notifDialogs/TelegramLinkDialog";
import TelegramEditDialog from "./notifDialogs/TelegramEditDialog";

export default function NotificationMethodsSiteSettings({siteConfig}: {siteConfig: GetSiteConfigReturnType}){
    const notificationMethods = [
        {
            id: "email",
            name: "Email",
            icon: Mail,
            linkDialog: EmailLinkDialog,
            editDialog: EmailEditDialog,
            description: "Uses the Resend API to send emails directly.",
        },
        {
            id: "telegram",
            name: "Telegram",
            icon: SiTelegram,
            linkDialog: TelegramLinkDialog,
            editDialog: TelegramEditDialog,
            description: "Sends messages to users through a Telegram bot.",
        }
    ] 
    function NotificationMethodCard({method}: {method: typeof notificationMethods[number]}){
        const [openLinkDialog, setOpenLinkDialog] = useState(false);
        const [openEditDialog, setOpenEditDialog] = useState(false);
        return <>
            <method.linkDialog open={openLinkDialog} onOpenChange={setOpenLinkDialog} siteConfig={siteConfig}/>
            <method.editDialog open={openEditDialog} onOpenChange={setOpenEditDialog} siteConfig={siteConfig}/>
            <Item variant="outline" size="sm">
                <ItemMedia variant="icon">
                    <method.icon className="size-5"/>
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{method.name}</ItemTitle>
                    <ItemDescription>{method.description}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    {siteConfig.notifications.methods[method.id as keyof typeof siteConfig.notifications.methods]?.linked ? <Button size="sm" variant="secondary" onClick={()=> setOpenEditDialog(true)}>Edit</Button> : <Button size="sm" variant="outline" onClick={()=> setOpenLinkDialog(true)}>Link</Button>}
                </ItemActions>
            </Item>
        </>
    }
    return <Card className="shrink-0">
        <CardHeader>
            <CardTitle>Notification methods</CardTitle>
            <CardDescription>Configure the way notifications are sent.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            {notificationMethods.map((method)=>{
                return <NotificationMethodCard key={method.id} method={method}/>
            })}
            <p className="text-muted-foreground">More are coming in the future ;p</p>
        </CardContent>
    </Card>
}