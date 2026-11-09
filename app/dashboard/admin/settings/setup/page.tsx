'use client';
import Dashboard from "@/components/navigation/Dashboard";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import setupSiteConfigClient from "@/lib/actions/site-settings/setupSiteConfigClient";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

export default function SiteSettingsSetupPage(){
    const [timezone, setTimezone] = useState("");
    const [allowSignups, setAllowSignups] = useState(false);
    const [invalidTimezone, setInvalidTimezone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    useEffect(()=>{
        if (timezone){
            try {
                Intl.DateTimeFormat(undefined, { timeZone: timezone });
                setInvalidTimezone(false);
            } catch {
                setInvalidTimezone(true);
            }
        } else {
            setInvalidTimezone(false);
        }
    }, [timezone])
    return <Dashboard>
        <DashboardHeader breadcrumbs={[{name: "Site settings"}]}/>
            <DashboardBody>
                <DashboardSectionHeader title="Setup site"/>
                <form className="flex flex-col h-full w-full pt-4 gap-2" onSubmit={async (e)=>{
                    e.preventDefault();
                    if (invalidTimezone || !timezone.trim()){
                        return toast.add({
                            title: "Invalid timezone",
                            description: "Please check your timezone and try again.",
                            type: "error"
                        })
                    }
                    setSubmitting(true);
                    await setupSiteConfigClient({timezone: timezone.trim(), allowSignups: allowSignups})
                    setSubmitting(false);
                    router.push("/dashboard/admin/settings")
                }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>General</CardTitle>
                            <CardDescription>General information about your site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Timezone</FieldLabel>
                                    <Input value={timezone} onChange={(e)=> setTimezone(e.target.value)} type="text" placeholder="E.g. Asia/Singapore"/>
                                    {invalidTimezone ? <FieldError>Timezone must be in IANA format, please check again.</FieldError> : <FieldDescription>Used to parse dates for analytics and logs. Must be in IANA format, and cannot be changed later.</FieldDescription>}
                                </Field>
                                <Field orientation="horizontal">
                                    <FieldLabel>Allow sign-up</FieldLabel>
                                    <Switch checked={allowSignups} onCheckedChange={(checked)=> setAllowSignups(checked)}/>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                    <div className="flex-1"/>
                    <Button type="submit" disabled={invalidTimezone || !timezone.trim() || submitting}>Continue <ArrowRight/></Button>
                </form>
            </DashboardBody>
    </Dashboard>
}