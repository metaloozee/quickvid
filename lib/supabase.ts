import { env } from "@/env.mjs"
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient<Storage>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
