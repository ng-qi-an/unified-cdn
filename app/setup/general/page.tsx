'use client';

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/toast";
import createFirstAdminClient from "@/lib/setup/createFirstAdminClient";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultSiteConfig } from "@/lib/actions/site-settings/siteConfigType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roles } from "@/lib/permissions/permissions";
import setupSiteConfigClient from "@/lib/actions/site-settings/setupSiteConfigClient";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";

export default function SetupGeneral(){
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(true);
    const router = useRouter();
    useEffect(()=> {
        setTimeout(()=> setMounted(true), 200)
    }, []);
    const [timezone, setTimezone] = useState("");
    const [allowSignups, setAllowSignups] = useState(defaultSiteConfig.auth.allowSignups);
    const [defaultUserRole, setDefaultUserRole] = useState(defaultSiteConfig.auth.defaultUserRole);
    const [submitting, setSubmitting] = useState(false);
    return <div className="flex flex-col h-screen w-full items-center justify-center">
        <AnimatePresence mode="wait">
            {mounted && <motion.div initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 50, transition: {opacity: {duration: 0.1}}}} transition={{duration: 0.6, type: "spring"}} className="flex flex-col h-screen w-full items-center justify-center">
                <Card className="shrink-0 w-full max-w-[500px] bg-transparent ring-0">
                    <form className="contents" onSubmit={async(e)=>{
                        e.preventDefault();
                        if (step < 2){
                            setStep((step)=> step + 1)
                        } else {
                            if (!timezone.trim() || !defaultUserRole.trim()){
                                return toast.add({
                                    title: "Failed to submit",
                                    description: "Please fill out all fields and ensure no field is invalid.",
                                })
                            }
                            setSubmitting(true);
                            try {
                                await setupSiteConfigClient({
                                    general: {
                                        ...defaultSiteConfig.general,
                                        timezone: timezone,
                                    },
                                    auth: {
                                        ...defaultSiteConfig.auth,
                                        allowSignups: allowSignups,
                                        defaultUserRole: defaultUserRole,
                                }})
                                router.push("/setup/complete")
                            } catch (e){
                                if (e instanceof Error){
                                    toast.add({
                                        title: "Failed to set site settings",
                                        description: e.message,
                                    })
                                } else {
                                    console.error(e);
                                    toast.add({
                                        title: "Failed to set site settings",
                                        description: "An unknown error occurred.",
                                    })
                                }
                            }
                            setSubmitting(false);
                        }
                    }}>
                        <CardHeader>
                            <CardTitle>Site settings</CardTitle>
                            <CardDescription>Configure some variables.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <AnimatePresence mode="wait">
                                    <motion.div key={`admin-setup-step-${step}`} initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -50, transition: {opacity: {duration: 0.1}}}} transition={{duration: 0.6, type: "spring"}} className="">
                                        {step == 0 ? <Field>
                                            <FieldLabel>Timezone</FieldLabel>
                                            <Combobox autoHighlight items={Intl.supportedValuesOf('timeZone')} value={timezone} onValueChange={(value)=> setTimezone(value!)} required>
                                                <ComboboxInput placeholder="Select a timezone from cities" autoFocus/>
                                                <ComboboxContent>
                                                    <ComboboxEmpty>No timezone found.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {(item)=>{
                                                            return <ComboboxItem key={item} value={item}>
                                                                {item}
                                                            </ComboboxItem>
                                                        }}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            <FieldDescription>Used to parse dates and analytics, cannot be changed later.</FieldDescription>
                                        </Field>
                                        : step == 1 ? <Field orientation="horizontal" className="space-x-2">
                                            <div className="w-full">
                                                <FieldLabel>Allow sign up?</FieldLabel>
                                                <FieldDescription>Visitors will be able to create an account without approval.</FieldDescription>
                                            </div>
                                            <Checkbox checked={allowSignups} onCheckedChange={(checked)=> setAllowSignups(checked)}/>
                                        </Field>
                                        : step == 2 && <Field>
                                            <FieldLabel>Default user role</FieldLabel>
                                            <FieldDescription>For newly signed-up/created users.</FieldDescription>
                                            <Select items={roles} onValueChange={(value)=> setDefaultUserRole(value!)} value={defaultUserRole} required>
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role)=>{
                                                        return <SelectItem value={role.value} key={role.value}>
                                                            <div className="flex flex-col">
                                                                <p className="font-medium">{role.label}</p>
                                                                <p className="text-muted-foreground w-full text-wrap">{role.description}</p>
                                                            </div>
                                                        </SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </Field>}
                                    </motion.div>
                                </AnimatePresence>
                            </FieldGroup>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" type="button" disabled={step == 0} onClick={()=> {
                                setStep((step)=> step - 1)
                            }}>
                                Back
                            </Button>
                            <div className="flex-1"/>
                            <Button type="submit" disabled={submitting}>
                                Next
                                <ArrowRight/>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>}
        </AnimatePresence>
    </div>
}