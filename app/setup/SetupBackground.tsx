'use client';
import GradientASCII from "@/components/GradientASCII";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
export default function SetupBackground(){
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [dimGradient, setDimGradient] = useState(false);
    const pathname = usePathname();
    useEffect(()=> {
        setMounted(true)
    }, []);
    useEffect(()=>{
        if (pathname != "/setup" && pathname != "/setup/complete"){
            setDimGradient(true)
        } else {
            setDimGradient(false)
        }
    }, [pathname])
    return mounted && <motion.div animate={{opacity: dimGradient ? (resolvedTheme == 'dark' ? 0.4 : 0.7) : 1, y: resolvedTheme == "dark" ? (dimGradient ? -90 : -10) : (dimGradient ? 50 : 10)}} transition={{duration: 1.2, type: "spring"}} className={`h-screen absolute w-screen -z-1`}>
        <GradientASCII
            colors={resolvedTheme == "dark"? ["#1e3fd8","#f6f8ff","#a5d8ff","#38bdf8"] : ["#e8f0ff", "#b4d0ff","#7cb4fb", "#4f8ff7"]}
            shape={resolvedTheme == "dark" ? "horizon" : "rise"}
            characters="01"
            cellSize={18}
            density={0.8}
            glyphOpacity={0.45}
            glow={0.2}
            depthOfField={0}
            flicker={0.2}
            softness={0.5}
            scale={0.9}
            flow={0.5}
            speed={1}
            gradientOpacity={resolvedTheme == "dark" ? 0.9 : 0.9}
            grain={0.08}
            variation={0}
            mouseInteraction
            scrambleRadius={0.1}
            clickEffect="wave"
            intro
            lightMode={resolvedTheme == "light"}
        />
    </motion.div>
}