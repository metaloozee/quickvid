"use client"

import { User } from "@supabase/supabase-js"

import useSupabaseClient from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export const LoginBtn = ({
    user,
    children
}: {
    user: User | null,
    children?: React.ReactNode
}) => {
    const supabase = useSupabaseClient()

    const handleLogin = () => {
        supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }


    if (user) {
        return <></>
    }

    return (
        <Button onClick={handleLogin} className="group">
            {children ?? "Login"}
        </Button>
    )
}
