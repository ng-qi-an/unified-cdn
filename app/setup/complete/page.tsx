'use client';

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/toast";
import createFirstAdminClient from "@/lib/setup/createFirstAdminClient";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultSiteConfig } from "@/lib/actions/site-settings/siteConfigType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roles } from "@/lib/permissions/permissions";
import setupSiteConfigClient from "@/lib/actions/site-settings/setupSiteConfigClient";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox";
import SplitText from "@/components/SplitText";

export default function SetupGeneral(){
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    useEffect(()=> {
        setTimeout(()=> setMounted(true), 200)
    }, []);
    return <div className="flex flex-col h-screen w-full items-center justify-center">
        <AnimatePresence mode="wait">
            {mounted && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, y: 50, transition: {opacity: {duration: 0.1}}}} transition={{duration: 0.6, type: "spring"}} className="flex flex-col h-screen w-full items-center justify-center">
                <div>
                    <SplitText
                        text="Welcome 👋"
                        className="text-5xl font-semibold text-center"
                        effect="rise"
                        splitType="chars"
                        delay={50}
                        duration={1.25}
                        staggerFrom="start"
                        trigger="view"
                        hoverEffect="lift"
                        loop={false}
                        loopDelay={1.5}
                        mask={false}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                    />
                    <motion.p initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 1, duration: 0.4}} className="mt-3 text-xl font-medium">To Unified CDN</motion.p>
                    <motion.div className="mt-6 flex gap-2" initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.4, delay: 1.4}}>
                        <Button size="lg" className="group active:scale-95 hover:bg-primary/90 pr-5 active:bg-primary" onClick={()=>{
                            setMounted(false);
                            setTimeout(()=>{
                                router.push("/auth/sign-in");
                            }, 200)
                        }}>
                            Sign in <ArrowRight className="ml-2 group-active:translate-x-0 transition-all size-4"/>
                        </Button>
                        <Button size="lg" className="group active:scale-95" variant="outline" onClick={()=>{
                            window.open("/docs", "_blank");
                        }}>
                            Docs <ExternalLink/>
                        </Button>
                    </motion.div>
                </div>
            </motion.div>}
        </AnimatePresence>
    </div>
}