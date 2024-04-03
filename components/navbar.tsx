import createSupabaseServerClient from "@/lib/supabase/server"
import Link from "next/link"
import { UserAccount } from "@/components/user-account"

export const Navbar = async () => {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <header className="top-0 z-40 w-full border-b bg-background/30 backdrop-blur-md">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <h1 className="text-xl">
                            Quick
                            <span className="text-primary">Vid</span>
                        </h1>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-end">
                    <nav className="flex items-center justify-center gap-5">
                        <UserAccount
                            user={user ?? null}
                        />
                    </nav>
                </div>
            </div>
        </header>
    )
}
