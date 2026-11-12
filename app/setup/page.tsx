'use client';
import GradientASCII from "@/components/GradientASCII";
import { useSiteConfig } from "@/components/providers/site-config-provider";
import Shuffle from "@/components/Shuffle"
import { Button } from "@/components/ui/button"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function SetupStart(){
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mountText, setMountText] = useState(false);
    const router = useRouter();
    const siteConfig = useSiteConfig();
    useEffect(()=> {
        if (siteConfig.raw){
            router.push("/auth/sign-in");
        } else {
            setMounted(true)
            setTimeout(()=> setMountText(true), 0)
        }
    }, []);
    return <AnimatePresence>
        {mounted && <motion.div animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.4}}>
            <div className="flex flex-col items-center justify-center h-screen w-screen">
                <div className="h-5"/>
                {mountText && <Shuffle
                    text="Unified CDN"
                    className="font-semibold text-5xl! sm:text-7xl!"
                    colorFrom={"var(--background)"}
                    effect="blur"
                    shuffleDirection="up"
                    duration={1.6}
                    animationMode="center"
                    shuffleTimes={14}
                    ease="expo.out"
                    stagger={0.06}
                    threshold={0.1}
                    triggerOnce={true}
                    triggerOnHover={false}
                    hoverRadius={0}
                    motionBlur={true}
                    respectReducedMotion={true}
                    maxDelay={0}
                    scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    loop={false}
                    loopDelay={0}
                />}
                <motion.p className="mt-4 text-muted-foreground text-base" initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.4, delay: 1.8}}>This takes about 5 minutes to complete.</motion.p>
                <motion.div className="mt-6 flex gap-1" initial={{y: 10, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.4, delay: 2.2}}>
                    <Button size="lg" className="group active:scale-95 hover:bg-primary/90 pr-5 active:bg-primary" onClick={()=>{
                        setMounted(false);
                        setTimeout(()=>{
                            console.log("pushing to /setup/admin");
                            router.push("/setup/admin");
                        }, 200)
                    }}>
                        Start setup <ArrowRight className="ml-2 group-active:translate-x-0 transition-all size-4"/>
                    </Button>
                    <Button size="icon-lg" variant="outline" onClick={()=> setTheme(resolvedTheme == "dark" ? "light" : "dark")}>
                        {resolvedTheme == "dark" ? <Sun/> : <Moon/>}
                    </Button>
                </motion.div>
            </div>
        </motion.div>}
    </AnimatePresence>
}