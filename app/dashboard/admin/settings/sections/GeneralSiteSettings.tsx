import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import saveSiteConfigClient from "@/lib/actions/site-settings/saveSiteConfigClient";
import { roles } from "@/lib/permissions/permissions";
import revalidateData from "@/lib/revalidateData";
import { useEffect, useState } from "react";

export default function GeneralSiteSettings({siteConfig}: {siteConfig: GetSiteConfigReturnType}){
    const [allowSignups, setAllowSignups] = useState(siteConfig.auth.allowSignups);
    const [defaultRole, setDefaultRole] = useState(siteConfig.auth.defaultUserRole);
    const [changed, setChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (siteConfig.auth.allowSignups !== allowSignups || siteConfig.auth.defaultUserRole !== defaultRole){
            setChanged(true);
        } else {
            setChanged(false);
        }
    }, [allowSignups, defaultRole])
    return <form className="contents" onSubmit={async(e)=>{
        e.preventDefault();
        if (!changed) return;
        setSubmitting(true);
        try {
            await saveSiteConfigClient("auth", {
                auth: {
                    allowSignups: allowSignups,
                    defaultUserRole: defaultRole
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
                <CardTitle>General</CardTitle>
                <CardDescription>General information about your site.</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Timezone</FieldLabel>
                        <Input value={siteConfig.general.timezone} disabled/>
                        <FieldDescription>Used for parsing dates on analytics and logs. This cannot be changed.</FieldDescription>
                    </Field>
                    <Field orientation="horizontal">
                        <div className="w-full">
                            <FieldLabel>Allow sign-up</FieldLabel>
                            <FieldDescription>Allow any visitor to sign up as a user on their own.</FieldDescription>
                        </div>
                        <Switch checked={allowSignups} onCheckedChange={(checked)=> setAllowSignups(checked)}/>
                    </Field>
                    <Field>
                        <FieldLabel>Default role</FieldLabel>
                        <Select items={roles} onValueChange={(value)=> setDefaultRole(value!)} value={defaultRole} required>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role)=>{
                                    return <SelectItem value={role.value} key={role.value}>
                                        <div className="flex flex-col">
                                            <p className="font-medium">{role.label}</p>
                                            <p className="text-muted-foreground">{role.description}</p>
                                        </div>
                                    </SelectItem>
                                })}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Default role for newly created or signed up users.</FieldDescription>
                    </Field>
                </FieldGroup>
            </CardContent>
            <CardFooter>
                <Button disabled={!changed || submitting} type="submit">Save</Button>
                {changed && <Button className="ml-auto" variant="ghost" type="button" onClick={()=>{
                    setAllowSignups(siteConfig.auth.allowSignups);
                    setDefaultRole(siteConfig.auth.defaultUserRole);
                }}>Reset changes</Button>}
            </CardFooter>
        </Card>
    </form>
}