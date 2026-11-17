'use client';
import { useEffect, useState } from "react";
import { useSiteConfig } from "./providers/site-config-provider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

export default function DemoModeDialog(){
    const siteConfig = useSiteConfig();
    const [open, setOpen] = useState(false);
    useEffect(()=>{
        if (siteConfig.general.demoMode && window.localStorage.getItem("demoModeDialogAcknowledge") != "true"){
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [siteConfig.general.demoMode])
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogTitle>This site is in Demo Mode</DialogTitle>
            <p className="text-muted-foreground">Take note: any files you add or API keys you create on this site can be <span className="font-medium text-foreground">deleted at a moment's notice.</span></p>
            <p className="text-foreground font-medium">Do not use this site for your application or store sensitive information.</p>
            <DialogFooter>
                <Button variant="ghost" onClick={()=> {
                    window.localStorage.setItem("demoModeDialogAcknowledge", "true");
                    setOpen(false);
                }}>Don't show again</Button>
                <Button onClick={()=> {
                    setOpen(false);
                }}>I understand</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}