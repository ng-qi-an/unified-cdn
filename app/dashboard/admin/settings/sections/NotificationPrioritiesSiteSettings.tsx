import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { NotificationTypeList } from "@/lib/actions/notifications/notificationTypes";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import saveSiteConfigClient from "@/lib/actions/site-settings/saveSiteConfigClient";
import revalidateData from "@/lib/revalidateData";
import { useEffect, useState } from "react";

export default function NotificationPrioritiesSiteSettings({siteConfig}: {siteConfig: GetSiteConfigReturnType}){
    const [notificationPriorities, setNotificationPriorities] = useState(siteConfig.notifications.priorities);
    const [changed, setChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (JSON.stringify(notificationPriorities) !== JSON.stringify(siteConfig.notifications.priorities)){
            setChanged(true);
        } else {
            setChanged(false);
        }
    }, [notificationPriorities])
    return <form className="contents" onSubmit={async(e)=>{
        e.preventDefault();
        if (!changed) return;
        setSubmitting(true);
        try {
            await saveSiteConfigClient("notifications", {
                notifications: {
                    ...siteConfig.notifications,
                    priorities: notificationPriorities,
                }
            })
            setSubmitting(false);
            setChanged(false);
            revalidateData(window.location.pathname);
        } catch (e){
            console.error(e);
            toast.add({
                title: "Error saving settings",
                description: "There was an error saving your settings. Please try again.",
                type: "error"
            })
            setSubmitting(false);
        }
    }}>
        <Card className="shrink-0">
            <CardHeader>
                <CardTitle>Notification priorities</CardTitle>
                <CardDescription>Adjust how severe each notification type is. Users can configure their notification method to correspond with a priority.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 w-full gap-2 gap-x-4">
                    {NotificationTypeList.map((type)=>{
                        return <Field key={type} orientation="horizontal">
                            <FieldLabel>{type}</FieldLabel>
                            <Select items={[
                                {value: "low", label: "Low"},
                                {value: "medium", label: "Medium"},
                                {value: "high", label: "High"},
                            ]} value={notificationPriorities[type]} onValueChange={(x)=>{
                                setNotificationPriorities((prev)=>{
                                    const newPriorities = {...prev};
                                    newPriorities[type] = x as "low" | "medium" | "high";
                                    return newPriorities;
                                })
                            }}>
                                <SelectTrigger className="min-w-32">
                                    <SelectValue placeholder="Select a priority"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    })}
                </div>
            </CardContent>
            <CardFooter>
                <Button disabled={!changed || submitting} type="submit">Save</Button>
                {changed && <Button className="ml-auto" variant="ghost" type="button" onClick={()=>{
                    setNotificationPriorities(siteConfig.notifications.priorities);
                }}>Reset changes</Button>}
            </CardFooter>
        </Card>
    </form>
}