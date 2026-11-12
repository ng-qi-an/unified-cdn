'use client';

import { cn } from "cn";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo(props: React.ImgHTMLAttributes<HTMLImageElement>){
    const {resolvedTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted && <img {...props} src={'/logo-transparent.png'} className={cn(resolvedTheme == "dark" ? "invert" : "", props.className)} />
}