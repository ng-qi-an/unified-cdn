import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteConfigProvider from "@/components/providers/site-config-provider";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";
import { DatabaseCog, ShieldCogCorner } from "lucide-react";
import ConfigNeeded from "@/components/ConfigNeeded";
import { redirect } from "next/navigation";
import SetupSaver from "./SetupSaver";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    template: '%s | Unified CDN',
    default: 'Unified CDN',
  },
  description: 'An open-source file storage solution, unifying CDNs.',
};

function LayoutWrapper({children}: {children: React.ReactNode}){
  return <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
    <body className="min-h-full flex flex-col" suppressHydrationWarning>
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
              {children}
          </TooltipProvider>
        </ThemeProvider>
        <Toaster/>
    </body>
  </html>
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  if (!process.env.DATABASE_URL){
    return <LayoutWrapper>
        <ConfigNeeded title="Database not configured" description="Paste your database url in the .env file, rebuild the service, then return back here." link="/docs/setup" Icon={DatabaseCog}/>
    </LayoutWrapper>
  } else if (!process.env.BETTER_AUTH_URL || !process.env.BETTER_AUTH_SECRET){
    return <LayoutWrapper>
        <ConfigNeeded title="BetterAuth not configured" description="Fill in the url and secret in the .env file, rebuild the service, then return back here." link="/docs/setup" Icon={ShieldCogCorner}/>
    </LayoutWrapper>
  }
  const siteConfig = await getSiteConfig();
  return <LayoutWrapper>
    <SetupSaver siteConfig={siteConfig} />
    <SiteConfigProvider initialSiteConfig={siteConfig}>
      {children}
    </SiteConfigProvider>
  </LayoutWrapper>
}
