import "@/styles/globals.css"
import { Metadata } from "next"
import Link from "next/link"
import { GeistMono } from "geist/font/mono"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
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
                        {/* <AnnouncementBanner text="Access to QuickVid's closed version requires owner authorization; please reach out for permission." /> */}
                        <Navbar />
                        <div className="mb-10 flex-1">
                            {children}
                            <p className="container mt-10 font-mono text-xs text-neutral-500">
                                made with ❤️ by{" "}
                                <Link
                                    className="underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://github.com/metaloozee/"
                                >
                                    metaloozee
                                </Link>
                            </p>
                        </div>
                    </div>
                    {/* <TailwindIndicator /> */}
                </ThemeProvider>
            </body>
        </html>
    )
}
