import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"

export const Footer = () => {
    return (
        <div className="container my-10 flex flex-col items-center justify-start gap-5 md:flex-row">
            <ThemeToggle />
            <p className="text-left font-mono text-xs text-muted-foreground">
                made with ❤️ by{" "}
                <Link
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/metaloozee/"
                >
                    metaloozee
                </Link>{" "}
                •{" "}
                <Link
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.buymeacoffee.com/metaloozee"
                >
                    support
                </Link>
            </p>
        </div>
    )
}
