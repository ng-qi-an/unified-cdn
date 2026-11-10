'use client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { GetSiteConfigReturnType } from "@/lib/actions/site-settings/getSiteConfig";
import linkSiteNotificationMethodClient from "@/lib/actions/site-settings/linkSiteNotificationMethodClient";
import unlinkSiteNotificationMethodClient from "@/lib/actions/site-settings/unlinkSiteNotificationMethodClient";
import revalidateData from "@/lib/revalidateData";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmailEditDialog({open, onOpenChange, siteConfig}: {open: boolean, onOpenChange: (open: boolean) => void, siteConfig: GetSiteConfigReturnType}){
    const [resendApiKey, setResendApiKey] = useState(siteConfig.notifications.methods.email.resendApiKey || "");
    const [emailOrigin, setEmailOrigin] = useState(siteConfig.notifications.methods.email.emailOrigin || "");
    const [showApiKey, setShowApiKey] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [changes, setChanges] = useState(false);
    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
    useEffect(()=>{
        if (resendApiKey !== siteConfig.notifications.methods.email.resendApiKey || emailOrigin !== siteConfig.notifications.methods.email.emailOrigin){
            setChanges(true);
        } else {
            setChanges(false);
        }
    }, [resendApiKey, emailOrigin])
    return <>
        <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Unlinking this method will prevent all users from recieving <span className="font-semibold text-foreground">critical notifications</span> via email. To get email notifications back, you have to link again.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={submitting} variant="destructive" onClick={async()=>{
                        setSubmitting(true);
                        try {
                            await unlinkSiteNotificationMethodClient("email")
                        } catch (error) {
                            if (error instanceof Error) {
                                toast.add({
                                    title: "Error unlinking email",
                                    description: error.message,
                                    type: "error"
                                })
                            } else {
                                console.error("Unexpected error unlinking email notification method:", error);
                                toast.add({
                                    title: "Error unlinking email",
                                    description: "An unexpected error occurred. Please try again.",
                                    type: "error"
                                })    
                            }
                        }
                        await revalidateData(window.location.pathname);
                        setSubmitting(false);
                        setShowUnlinkDialog(false);
                        onOpenChange(false);
                    }}>
                        Unlink
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form className="contents" onSubmit={async(e)=>{
                    e.preventDefault();
                    if (!resendApiKey.trim() || !emailOrigin.trim()) return;
                    if (!changes) return onOpenChange(false);
                    setSubmitting(true);
                    try {
                        await linkSiteNotificationMethodClient("email", {
                            resendApiKey: resendApiKey.trim(),
                            emailOrigin: emailOrigin.trim()
                        })
                        onOpenChange(false);
                        revalidateData(window.location.pathname);
                    } catch (error) {
                        if (error instanceof Error) {
                            toast.add({
                                title: "Error updating email",
                                description: error.message,
                                type: "error"
                            })
                        } else {
                            console.error("Unexpected error updating email notification method:", error);
                            toast.add({
                                title: "Error updating email",
                                description: "An unexpected error occurred. Please try again.",
                                type: "error"
                            })    
                        }
                    }
                    setSubmitting(false);
                }}>
                    <DialogHeader>
                        <DialogTitle>Edit email method</DialogTitle>
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
                        <Button variant="ghost" type="button" className="mr-auto text-destructive hover:text-destructive" onClick={()=> setShowUnlinkDialog(true)}>
                            Unlink
                        </Button>
                        <Button variant="secondary" type="button" onClick={()=> {
                            setResendApiKey(siteConfig.notifications.methods.email.resendApiKey || "");
                            setEmailOrigin(siteConfig.notifications.methods.email.emailOrigin || "");
                            onOpenChange(false);
                        }}>Cancel</Button>
                        <Button type="submit" disabled={!emailOrigin.trim() || !resendApiKey.trim() || submitting}>Confirm</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
}