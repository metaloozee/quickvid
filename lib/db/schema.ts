import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
    vector,
} from "drizzle-orm/pg-core"

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

export const embeddings = pgTable(
    "embeddings",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        videoid: text("videoid").references(() => videos.videoid, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
        embedding: vector("embedding", { dimensions: 1536 }),
        content: text("content"),
    },
    (table) => ({
        embeddingIndex: index("embeddingIndex").using(
            "hnsw",
            table.embedding.op("vector_cosine_ops")
        ),
    })
)

export type Video = typeof videos.$inferSelect
export type Summary = typeof summaries.$inferSelect
export type Embedding = typeof embeddings.$inferSelect
