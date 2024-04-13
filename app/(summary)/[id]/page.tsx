import Image from "next/image"
import { Eye } from "lucide-react"
import ytdl from "ytdl-core"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Embed } from "@/components/youtube-embed"

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

    const videoInfo = await ytdl.getInfo(data?.video ?? "")

    return (
        <section className="container mt-10 flex items-center">
            <div className="max-w-5xl flex-col items-start gap-5">
                <Embed
                    thumbnail={
                        videoInfo.videoDetails.thumbnails.reverse()[0].url
                    }
                />
                <div className="mt-4">
                    <h1 className="text-2xl font-extrabold leading-tight tracking-tighter md:text-3xl">
                        {videoInfo.videoDetails.title}
                    </h1>
                    <div className="mt-4 flex gap-2">
                        <Badge>{videoInfo.videoDetails.author.name}</Badge>
                        <Badge variant="secondary">
                            <Eye className="mr-2 h-3 w-3" />{" "}
                            {videoInfo.videoDetails.viewCount}
                        </Badge>
                    </div>
                </div>
            </div>
        </section>
    )
}
