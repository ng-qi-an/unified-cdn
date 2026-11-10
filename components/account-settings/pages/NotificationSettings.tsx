'use client';

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { NotificationPriorities } from "@/lib/actions/notifications/notificationTypes";
import { defaultNotificationPreferences, NotificationPreferencesType } from "@/lib/actions/notifications/notificationPreferences";
import { User } from "@/lib/schema/schemaTypes";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSiteConfig } from "@/components/providers/site-config-provider";
import LinkTelegramDialog from "../dialogs/LinkTelegramDialog";
import unlinkNotificationMethodClient from "@/lib/actions/notifications/unlinkNotificationMethodClient";
import revalidateData from "@/lib/revalidateData";
import { toast } from "@/components/ui/toast";
import saveNotificationPreferencesClient from "@/lib/actions/notifications/saveNotificationPreferencesClient";


export default function NotificationSettings({user}: {user: User}) {
    const notifPreferences: NotificationPreferencesType = user.notif_preferences as NotificationPreferencesType || {};
    const siteConfig = useSiteConfig();
    const [showTelegramLinkDialog, setShowTelegramLinkDialog] = useState(false);
    
    function NotificationMethodCard({id, name, description, linked, enabled, priorities, onLink, disableUnlink, disableLink}: {id: keyof NotificationPreferencesType, name: string, description: string, linked: boolean, enabled: boolean, priorities: NotificationPriorities[], onLink: ()=> void, disableUnlink?: boolean, disableLink?: boolean}) {
        const [selectedPriorities, setSelectedPriorities] = useState<NotificationPriorities[]>(priorities || []);
        const [selectedEnabled, setSelectedEnabled] = useState(enabled);
        const [saving, setSaving] = useState(false);
        return <Card className="border shrink-0" size="sm">
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardAction className="h-full">
                    <div className="h-full flex items-center">
                        {linked ? 
                            <Switch disabled={saving} checked={selectedEnabled} onCheckedChange={async (checked) => {
                                setSaving(true);
                                setSelectedEnabled(checked);
                                try {
                                    await saveNotificationPreferencesClient(id, {
                                        enabled: checked
                                    })
                                    await revalidateData(window.location.pathname);
                                } catch (error) {
                                    if (error instanceof Error) {
                                        toast.add({
                                            title: "Error saving notification preferences",
                                            description: error.message,
                                            type: "error"
                                        })
                                    } else {
                                        console.error("Unexpected error saving notification preferences:", error);
                                        toast.add({
                                            title: "Error saving notification preferences",
                                            description: "An unexpected error occurred. Please try again.",
                                            type: "error"
                                        })    
                                    }
                                    setSelectedEnabled(!checked);
                                }
                                setSaving(false);
                        }}/>
                        : disableLink ? <Tooltip>
                            <TooltipTrigger render={<span>
                            <Button size="sm" variant="outline" disabled>
                                Link
                            </Button>
                            </span>}/>
                            <TooltipContent>
                                <p>{name} is not configured by this site yet.</p>
                            </TooltipContent>
                        </Tooltip>
                        : <Button size="sm" variant="outline" onClick={()=> onLink()}>Link</Button>}
                    </div>
                </CardAction>
            </CardHeader>
            {linked && <>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Notification Types</FieldLabel>
                        <Combobox value={selectedPriorities} onValueChange={(x)=> setSelectedPriorities(x)} items={[{
                            label: "High Priority",
                            value: "high"
                        }, {
                            label: "Medium Priority",
                            value: "medium"
                        }, {
                            label: "Low Priority",
                            value: "low"
                        }]} multiple autoHighlight>
                            <ComboboxTrigger nativeButton={false} render={<div className="border-b border-input h-10 flex items-center px-1 [&[data-popup-open]]:border-ring cursor-default">
                                {selectedPriorities.length == 0 ? <span className="text-muted-foreground text-sm">Select notification types</span> : selectedPriorities.length == 3 ? "All notifications" : selectedPriorities.map((priority)=> priority[0].toUpperCase() + priority.slice(1)).join(" and ") + " only"}
                                <ChevronDown className="ml-auto size-4 text-muted-foreground"/>
                            </div>}/>
                            <ComboboxContent>
                                <ComboboxInput placeholder="Select notification types" showTrigger={false} />
                                <ComboboxEmpty>No notification types found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item)=>{
                                        return <ComboboxItem key={item.value} value={item.value}>
                                            {item.label}
                                        </ComboboxItem>
                                    }}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </Field>
                </FieldGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button size="sm" variant="ghost" disabled={disableUnlink || saving} onClick={async()=>{
                    await unlinkNotificationMethodClient(id);
                    await revalidateData(window.location.pathname);
                    toast.add({
                        title: `${name} unlinked`,
                        description: `You will no longer receive notifications through ${name}.`,
                        type: "success"
                    })
                }}>Unlink</Button>
                <Button size="sm" disabled={saving} onClick={async()=>{
                    setSaving(true);
                    try {
                        await saveNotificationPreferencesClient(id, {
                            priority: selectedPriorities
                        })
                        toast.add({
                            title: "Notification preferences saved",
                            description: "Your notification preferences have been saved.",
                            type: "success"
                        })
                        await revalidateData(window.location.pathname);
                    } catch (error) {
                        if (error instanceof Error) {
                            toast.add({
                                title: "Error saving notification preferences",
                                description: error.message,
                                type: "error"
                            })
                        } else {
                            console.error("Unexpected error saving notification preferences:", error);
                            toast.add({
                                title: "Error saving notification preferences",
                                description: "An unexpected error occurred. Please try again.",
                                type: "error"
                            })    
                        }
                    }
                    setSaving(false);
                }}>Save</Button>
            </CardFooter>
            </>}
        </Card>
    }
    return <>
        <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Manage notification methods and priorities</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-6 gap-4">
            <NotificationMethodCard id="email" name="Email" description="Sent to your primary email address" linked={true} enabled={notifPreferences.email.enabled} priorities={notifPreferences.email.priority} disableLink={!siteConfig.notifications.methods.email.linked} disableUnlink onLink={()=>{}}/>
            <LinkTelegramDialog open={showTelegramLinkDialog} onOpenChange={setShowTelegramLinkDialog} botUsername={siteConfig.notifications.methods.telegram?.telegramBotUsername!}/>
            <NotificationMethodCard id="telegram" name="Telegram" description="Sent through a telegram bot" linked={notifPreferences.telegram?.chatId ? true : false} enabled={notifPreferences.telegram?.enabled} disableLink={!siteConfig.notifications.methods.telegram?.linked} priorities={notifPreferences.telegram?.priority ?? defaultNotificationPreferences.telegram.priority} onLink={()=>{setShowTelegramLinkDialog(true)}}/>
        </div>
    </>
}