'use client';

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NotificationPriorities } from "@/lib/actions/notifications/notificationTypes";
import { NotificationPreferencesType } from "@/lib/notificationPreferences";
import { User } from "@/lib/schema/schemaTypes";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function NotificationMethodCard({name, description, enabled, priorities, onSave, disableToggleSwitch}: {name: string, description: string, enabled: boolean, priorities: NotificationPriorities[], onSave: (enabled: boolean, priorities: NotificationPriorities[]) => void, disableToggleSwitch?: boolean}) {
    const [selectedPriorities, setSelectedPriorities] = useState<NotificationPriorities[]>(priorities || []);
    return <Card className="border shrink-0" size="sm">
        <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <CardAction className="h-full">
                <div className="h-full flex items-center">
                    <Switch disabled={disableToggleSwitch} checked={enabled} onCheckedChange={(checked) => onSave(checked, selectedPriorities)}/>
                </div>
            </CardAction>
        </CardHeader>
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
            <Button size="sm" variant="ghost" disabled={disableToggleSwitch}>Unlink</Button>
            <Button size="sm">Save</Button>
        </CardFooter>
    </Card>
}

export default function NotificationSettings({user}: {user: User}) {
    const notifPreferences: NotificationPreferencesType = user.notif_preferences || {};
    return <>
        <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Manage notification methods and priorities</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-auto scroll-fade pt-6 gap-4">
            <NotificationMethodCard name="Email" description="Sent to your primary email address" enabled={notifPreferences.email.enabled} priorities={notifPreferences.email.priority} onSave={(enabled, priorities) => {

            }} disableToggleSwitch/>
            <NotificationMethodCard name="Telegram" description="Sent through a telegram bot" enabled={notifPreferences.telegram?.enabled} priorities={notifPreferences.telegram?.priority} onSave={(enabled, priorities) => {

            }}/>
        </div>
    </>
}