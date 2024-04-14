import "@/styles/globals.css"
import { Metadata } from "next"
import { GeistMono } from "geist/font/mono"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { AnnouncementBanner } from "@/components/accouncement"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
}

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={GeistMono.className}>
            <body className={cn("min-h-screen bg-background antialiased")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <div className="relative flex min-h-screen flex-col">
                        <AnnouncementBanner text="Access to QuickVid's closed version requires owner authorization; please reach out for permission." />
                        <Navbar />
                        <div className="flex-1">{children}</div>
                    </div>
                    {/* <TailwindIndicator /> */}
                </ThemeProvider>
            </body>
        </html>
    )
}
