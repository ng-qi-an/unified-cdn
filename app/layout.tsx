import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteConfigProvider from "@/components/providers/site-config-provider";
import getSiteConfig from "@/lib/actions/site-settings/getSiteConfig";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteConfig = await getSiteConfig();
  return (
    <html
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
            <SiteConfigProvider initialSiteConfig={siteConfig}>
              {children}
            </SiteConfigProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster/>
      </body>
    </html>
  );
}
