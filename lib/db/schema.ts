import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
    vector,
} from "drizzle-orm/pg-core"

export const videos = pgTable(
    "videos",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        videoid: text("videoid").unique(),
        videotitle: text("videotitle"),
        transcript: text("transcript"),
        created_at: timestamp("created_at").defaultNow(),
        embedding: vector("embedding", { dimensions: 1536 }),
    },
    (table) => ({
        embeddingIndex: index("embeddingIndex").using(
            "hnsw",
            table.embedding.op("vector_cosine_ops")
        ),
    })
)

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
