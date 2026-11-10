import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import getNotificationPreferencesClient from "@/lib/actions/notifications/getNotificationPreferencesClient";
import { createTelegramCodeClient, deleteTelegramCodeClient } from "@/lib/actions/notifications/telegram/telegramCodeClient";
import revalidateData from "@/lib/revalidateData";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function LinkTelegramDialog({open, onOpenChange, botUsername}: {open: boolean, onOpenChange: (open: boolean) => void, botUsername: string}){
    const [generatingCode, setGeneratingCode] = useState(true);
    const [code, setCode] = useState("");
    const [checking, setChecking] = useState(false);
    useEffect(()=>{
        if (open == true){
            (async()=>{
                setGeneratingCode(true);
                try {
                    setCode(await createTelegramCodeClient());
                    setGeneratingCode(false);
                } catch (error) {
                    if (error instanceof Error) {
                        toast.add({
                            title: "Error generating telegram code",
                            description: error.message,
                            type: "error"
                        })
                    } else {
                        console.error("Unexpected error generating telegram code:", error);
                        toast.add({
                            title: "Error generating telegram code",
                            description: "An unexpected error occurred. Please try again.",
                            type: "error"
                        })    
                    }
                }
            })();
        } else {
            setGeneratingCode(true);
            setCode("");
            setChecking(false);
        }
    }, [open])
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Link Telegram</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center">
                    {generatingCode ? 
                    <Spinner/> : 
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "200px", width: "100%" }}
                        value={`https://t.me/${botUsername}?start=${code}`}
                        viewBox={`0 0 256 256`}
                    />}
                </div>
                <div className="col-span-2 pl-4">
                    <ol className="list-decimal space-y-2 text-muted-foreground">
                        <li>Scan the QR code or go to <br/><Link className="underline text-foreground" href={`https://t.me/${botUsername}?start=${code}`} target="_blank" rel="noopener noreferrer">https://t.me/{botUsername}?start={code}</Link></li>
                        <li>Click <span className="text-foreground">"Start"</span> in the chat window.</li>
                        <li>Send <span className="text-foreground">"/start {code}"</span> if you haven't already to the bot.</li>
                        <li>Once you have sent the command, click the <span className="text-foreground">"Check"</span> button below to verify.</li>
                    </ol>
                </div>
            </div>
            <DialogFooter>
                <Button disabled={checking} onClick={()=> onOpenChange(false)} variant="secondary">Cancel</Button>
                <Button disabled={checking || generatingCode} onClick={async()=>{
                    setChecking(true);
                    const pref = await getNotificationPreferencesClient();
                    if (pref.telegram?.chatId){
                        toast.add({
                            title: "Telegram linked",
                            description: "Your telegram account has been successfully linked.",
                        })
                        await revalidateData(window.location.pathname);
                        onOpenChange(false);
                    } else {
                        toast.add({
                            title: "Telegram not linked",
                            description: "Your telegram account has not been linked yet. Please make sure you have sent the command to the bot.",
                        })
                    }
                    setChecking(false);
                }}>Check</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}