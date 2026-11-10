'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import linkSiteNotificationMethodClient from "@/lib/actions/site-settings/linkSiteNotificationMethodClient";
import revalidateData from "@/lib/revalidateData";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmailLinkDialog({open, onOpenChange, siteConfig}: {open: boolean, onOpenChange: (open: boolean) => void, siteConfig: GetSiteConfigReturnType}){
    const [resendApiKey, setResendApiKey] = useState("");
    const [emailOrigin, setEmailOrigin] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (!emailOrigin){
            setEmailOrigin("notifications@" + window.location.hostname);
        }
    }, [])
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <form className="contents" onSubmit={async(e)=>{
                e.preventDefault();
                if (!resendApiKey.trim() || !emailOrigin.trim()) return;
                setSubmitting(true);
                try {
                    await linkSiteNotificationMethodClient("email", {
                        resendApiKey: resendApiKey.trim(),
                        emailOrigin: emailOrigin.trim()
                    })
                    toast.add({
                        title: "Email is successfully linked",
                        description: "Email was linked successfully as a notification method.",
                        type: "success"
                    })
                    onOpenChange(false);
                    revalidateData(window.location.pathname);
                } catch (error) {
                    if (error instanceof Error) {
                        toast.add({
                            title: "Error linking email",
                            description: error.message,
                            type: "error"
                        })
                    } else {
                        console.error("Unexpected error linking email notification method:", error);
                        toast.add({
                            title: "Error linking email",
                            description: "An unexpected error occurred. Please try again.",
                            type: "error"
                        })    
                    }
                }
                setSubmitting(false);
            }}>
                <DialogHeader>
                    <DialogTitle>Link Email</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Resend API Key</FieldLabel>
                        <InputGroup>
                            <InputGroupInput autoComplete="off" value={resendApiKey} onChange={(e)=>setResendApiKey(e.target.value)} placeholder="Enter your Resend API key" type={showApiKey ? "text" : "password"}/>
                            <InputGroupAddon align={"inline-end"}>
                                <InputGroupButton onClick={()=> setShowApiKey(!showApiKey)}>
                                    {showApiKey ? <EyeOff/> : <Eye/> }
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>Get your API key from <Link href="https://resend.com" target="_blank" className="text-primary underline">Resend</Link>.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel>Sender's email address</FieldLabel>
                        <Input placeholder="notifications@unified-cdn.com" value={emailOrigin} onChange={(e)=> setEmailOrigin(e.target.value)} required type="email" />
                        <FieldDescription>Used to send notifications. Can be any address but must be on your configured Resend domain.</FieldDescription>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={()=> onOpenChange(false)}>Close</Button>
                    <Button type="submit" disabled={!emailOrigin.trim() || !resendApiKey.trim() || submitting}>Confirm</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}