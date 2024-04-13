import { URLSearchParams } from "url"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function SummaryIndexPage({ params }: { params: any }) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
        .from("summaries")
        .select("*, users(avatar_url, full_name)")
        .eq("video", params.id)
        .eq("userid", user?.id)
        .single()

    return (
        <>
            <h1>hello</h1>
            <h1>{data?.id}</h1>
        </>
    )
}
