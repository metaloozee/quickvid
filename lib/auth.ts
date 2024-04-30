import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

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
    providers: [GitHub],
})
