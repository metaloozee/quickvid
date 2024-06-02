import Link from "next/link"
import { Github } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const Navbar = async () => {
    return (
        <header className="top-0 z-40 w-full border-b bg-background/30 backdrop-blur-md">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <h1 className="text-xl">
                            Quick
                            <span className="text-primary">Vid</span>
                        </h1>
                    </Link>
                    <Badge
                        variant={"secondary"}
                        className="h-5 text-[10px] font-light"
                    >
                        Beta
                    </Badge>
                </div>

                <div className="flex flex-1 items-center justify-end">
                    <nav className="flex items-center justify-center gap-5">
                        <Button size={null} variant={"link"} asChild>
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href={"https://git.new/summary"}
                            >
                                <Github className="size-6" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
