"use client"

import { UserIcon } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"

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

export const UserButton = () => {
    const { data: session } = useSession()

    return session?.user ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="relative rounded-full shadow-xl"
                >
                    <Avatar className="max-h-[35px] max-w-[35px]">
                        <AvatarImage
                            className="max-h-[35px] max-w-[35px]"
                            src={
                                session.user.image ??
                                "https://source.boringavatars.com/beam/120"
                            }
                            alt={session.user.name ?? ""}
                        />
                        <AvatarFallback>
                            <UserIcon className="text-muted-foreground/90" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-4 w-full" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="text-xs">
                        Pro Credits: 0
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Button className="w-full" onClick={() => signOut()}>
                            Log Out
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <Button size={"sm"} onClick={() => signIn("github")}>
            Login
        </Button>
    )
}
