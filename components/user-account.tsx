"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type User } from "@supabase/supabase-js"
import { Bookmark, Settings, UserCog, UserIcon } from "lucide-react"

import useSupabaseClient from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export const UserAccount = ({ user }: { user: User | null }) => {
    const router = useRouter()
    const supabase = useSupabaseClient()

    return user ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={"ghost"}
                    className="relative ml-1 h-8 w-8 rounded-full shadow-xl"
                >
                    <Avatar>
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback>
                            <UserIcon className="text-muted-foreground/90" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.user_metadata.full_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
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
                    <DropdownMenuItem asChild>
                        <Link
                            className="w-full cursor-pointer py-2 text-left"
                            href={"/settings"}
                        >
                            <UserCog className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Button
                            className="w-full cursor-pointer"
                            onClick={async () => {
                                await supabase.auth.signOut()
                                await router.refresh()
                            }}
                        >
                            Log Out
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <></>
    )
}
