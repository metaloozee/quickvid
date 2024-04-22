import { config } from "dotenv"
import type { Config } from "drizzle-kit"

config({ path: ".env.local" })

export default {
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.NEON_DATABASE_URL!,
    },
} satisfies Config
