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

export default function TelegramEditDialog({open, onOpenChange, siteConfig}: {open: boolean, onOpenChange: (open: boolean) => void, siteConfig: GetSiteConfigReturnType}){
    const [telegramBotToken, setTelegramBotToken] = useState(siteConfig.notifications.methods.telegram?.telegramBotToken || "");
    const [telegramBotUsername, setTelegramBotUsername] = useState(siteConfig.notifications.methods.telegram?.telegramBotUsername || "");
    const [webhookBaseUrl, setWebhookBaseUrl] = useState(siteConfig.notifications.methods.telegram?.webhookBaseUrl || "");
    const [showToken, setShowToken] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [changes, setChanges] = useState(false);
    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
    useEffect(()=>{
        if (telegramBotToken !== siteConfig.notifications.methods.telegram?.telegramBotToken || telegramBotUsername !== siteConfig.notifications.methods.telegram?.telegramBotUsername || webhookBaseUrl !== siteConfig.notifications.methods.telegram?.webhookBaseUrl){
            setChanges(true);
        } else {
            setChanges(false);
        }
    }, [telegramBotToken, telegramBotUsername, webhookBaseUrl])
    return <>
        <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Unlinking this method will prevent all users from recieving <span className="font-semibold text-foreground">critical notifications</span> via telegram. To get telegram messages back, you have to link again.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={submitting} variant="destructive" onClick={async()=>{
                        setSubmitting(true);
                        try {
                            await unlinkSiteNotificationMethodClient("telegram")
                        } catch (error) {
                            if (error instanceof Error) {
                                toast.add({
                                    title: "Error unlinking telegram",
                                    description: error.message,
                                    type: "error"
                                })
                            } else {
                                console.error("Unexpected error unlinking telegram notification method:", error);
                                toast.add({
                                    title: "Error unlinking telegram",
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
                    if (!telegramBotToken.trim() || !webhookBaseUrl.trim()) return;
                    if (!changes) return onOpenChange(false);
                    setSubmitting(true);
                    try {
                        await linkSiteNotificationMethodClient("telegram", {
                            telegramBotToken: telegramBotToken.trim(),
                            telegramBotUsername: telegramBotUsername.trim() || null,
                            webhookBaseUrl: webhookBaseUrl.trim()
                        })
                        onOpenChange(false);
                        revalidateData(window.location.pathname);
                    } catch (error) {
                        if (error instanceof Error) {
                            toast.add({
                                title: "Error updating telegram",
                                description: error.message,
                                type: "error"
                            })
                        } else {
                            console.error("Unexpected error updating telegram notification method:", error);
                            toast.add({
                                title: "Error updating telegram",
                                description: "An unexpected error occurred. Please try again.",
                                type: "error"
                            })    
                        }
                    }
                    setSubmitting(false);
                }}>
                    <DialogHeader>
                        <DialogTitle>Edit telegram method</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Telegram Bot token</FieldLabel>
                            <InputGroup>
                                <InputGroupInput autoComplete="off" value={telegramBotToken} onChange={(e)=>setTelegramBotToken(e.target.value)} placeholder="Enter your Telegram Bot token" type={showToken ? "text" : "password"}/>
                                <InputGroupAddon align={"inline-end"}>
                                    <InputGroupButton onClick={()=> setShowToken(!showToken)}>
                                        {showToken ? <EyeOff/> : <Eye/> }
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldDescription>Follow the <Link href="https://resend.com" target="_blank" className="text-primary underline">Unified CDN documentation</Link> to get your token.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Telegram Bot username</FieldLabel>
                            <Input placeholder="E.g. unified-cdn_bot" value={telegramBotUsername} onChange={(e)=> setTelegramBotUsername(e.target.value)} type="text" />
                            <FieldDescription>Leave blank to set automatically.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel>Webhook Base URL</FieldLabel>
                            <Input placeholder="E.g. https://unified-cdn.com" value={webhookBaseUrl} onChange={(e)=> setWebhookBaseUrl(e.target.value)} required type="url" />
                            <FieldDescription>Should be a link pointing at Unified CDN. Set for you by default.</FieldDescription>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button variant="ghost" type="button" className="mr-auto text-destructive hover:text-destructive" onClick={()=> setShowUnlinkDialog(true)}>
                            Unlink
                        </Button>
                        <Button variant="secondary" type="button" onClick={()=> {
                            setTelegramBotToken(siteConfig.notifications.methods.telegram?.telegramBotToken || "");
                            setWebhookBaseUrl(siteConfig.notifications.methods.telegram?.webhookBaseUrl || "");
                            onOpenChange(false);
                        }}>Cancel</Button>
                        <Button type="submit" disabled={!webhookBaseUrl.trim() || !telegramBotToken.trim() || submitting}>Confirm</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
}