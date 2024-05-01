import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import { db } from "@/lib/db/index"

export const { handlers, auth } = NextAuth({
    trustHost: true,
    callbacks: {
        session: ({ session, token, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
    adapter: DrizzleAdapter(db),
    providers: [Google],
})
