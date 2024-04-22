"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlignJustify, Bookmark, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const LinksDropdown = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                    <AlignJustify />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            className="w-full cursor-pointer py-2 text-left"
                            href={"/summaries"}
                        >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Summaries
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link
                            className="w-full cursor-pointer py-2 text-left"
                            href={"/settings"}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
