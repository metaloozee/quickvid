import "@/styles/globals.css"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistMono } from "geist/font/mono"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { AnnouncementBanner } from "@/components/accouncement"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: "/favicon.ico",
    },
}

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={GeistMono.className}>
            <body className={cn("min-h-screen bg-background antialiased")}>
                <Toaster richColors />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                >
                    <Analytics />
                    <SpeedInsights />

                    <div className="relative flex min-h-screen flex-col">
                        {/* <AnnouncementBanner text="Due to high demand, YouTube is limiting our ability to process transcripts. This won't impact users hosting locally." /> */}
                        <Navbar />
                        <div className="flex-1">{children}</div>
                        <Footer />
                    </div>
                    {/* <TailwindIndicator /> */}
                </ThemeProvider>
            </body>
        </html>
    )
}
