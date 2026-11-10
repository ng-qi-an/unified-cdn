'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import linkSiteNotificationMethodClient from "@/lib/actions/site-settings/linkSiteNotificationMethodClient";
import revalidateData from "@/lib/revalidateData";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TelegramLinkDialog({open, onOpenChange}: {open: boolean, onOpenChange: (open: boolean) => void}){
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (!webhookBaseUrl){
            setWebhookBaseUrl(window.location.origin);
        }
    }, [])
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <form className="contents" onSubmit={async(e)=>{
                e.preventDefault();
                if (!telegramBotToken.trim() || !webhookBaseUrl.trim()) return;
                setSubmitting(true);
                try {
                    await linkSiteNotificationMethodClient("telegram", {
                        telegramBotToken: telegramBotToken.trim(),
                        webhookBaseUrl: webhookBaseUrl.trim(),
                        telegramBotUsername: null
                    })
                    toast.add({
                        title: "Telegram is successfully linked",
                        description: "Telegram was linked successfully as a notification method.",
                        type: "success"
                    })
                    onOpenChange(false);
                    await revalidateData(window.location.pathname);
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
                        <FieldLabel>Webhook Base URL</FieldLabel>
                        <Input placeholder="E.g. https://unified-cdn.com" value={webhookBaseUrl} onChange={(e)=> setWebhookBaseUrl(e.target.value)} required type="url" />
                        <FieldDescription>Should be a link pointing at Unified CDN. Set for you by default.</FieldDescription>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={()=> onOpenChange(false)}>Close</Button>
                    <Button type="submit" disabled={!telegramBotToken.trim() || !webhookBaseUrl.trim() || submitting}>Confirm</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}