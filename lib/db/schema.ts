import {
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
)

export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    videoid: text("videoid").unique(),
    videotitle: text("videotitle"),
    transcript: text("transcript"),
    created_at: timestamp("created_at").defaultNow(),
})

export const summaries = pgTable("summaries", {
    id: uuid("id").primaryKey().defaultRandom(),
    videoid: text("videoid")
        .references(() => videos.videoid, {
            onDelete: "cascade",
            onUpdate: "cascade",
        })
        .notNull(),
    summary: text("summary"),
    updated_at: timestamp("updated_at").defaultNow(),
})

export type Video = typeof videos.$inferSelect
export type Summary = typeof summaries.$inferSelect
