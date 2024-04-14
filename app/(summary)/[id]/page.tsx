import { Eye, Tv } from "lucide-react"
import ytdl from "ytdl-core"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Embed } from "@/components/youtube-embed"

export default async function SummaryIndexPage({ params }: { params: any }) {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
        .from("summaries")
        .select("*, users(avatar_url, full_name)")
        .eq("videoid", params.id)
        .eq("userid", user?.id)
        .single()

    if (!data) {
        return (
            <section className="container mt-40 flex items-center">
                <div className="flex max-w-5xl flex-col items-start gap-5">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                        No Data Found
                    </h1>
                </div>
            </section>
        )
    }

    const videoInfo = await ytdl.getInfo(data?.videoid ?? "")

    return (
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            {data.summary ? (
                <div className="col-span-2 flex flex-col gap-10">
                    <div>{data.summary}</div>
                    <Button variant={"secondary"}>Regenerate Summary</Button>
                </div>
            ) : (
                <div className="col-span-2 flex flex-col gap-10">
                    <div className="gap-2">
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                            No Summary Found!
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Seems like I cannot find any pre-generated summary
                            for your video, kindly click the button below in
                            order to summarize
                        </p>
                    </div>
                    <Button>Summarize</Button>
                </div>
            )}

            <div className="flex w-full flex-col gap-10">
                <div className="flex flex-col items-start gap-5 rounded-xl bg-secondary p-5">
                    <div className="flex w-full flex-col items-center justify-between gap-5 md:flex-row md:items-start">
                        <Embed
                            thumbnail={
                                videoInfo.videoDetails.thumbnails.reverse()[0]
                                    .url
                            }
                        />
                        <div className="flex w-full flex-col gap-2">
                            <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter md:text-left md:text-lg">
                                {videoInfo.videoDetails.title.length > 40
                                    ? videoInfo.videoDetails.title
                                          .slice(0, 40)
                                          .concat("...")
                                    : videoInfo.videoDetails.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 md:items-start">
                        <Badge>
                            <Tv className="mr-2 h-3 w-3" />{" "}
                            {videoInfo.videoDetails.author.name}
                        </Badge>
                        <Badge variant="outline">
                            <Eye className="mr-2 h-3 w-3" />{" "}
                            {videoInfo.videoDetails.viewCount}
                        </Badge>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-5 rounded-xl border-primary p-5 outline-dashed outline-2 outline-primary">
                    <p className="text-sm">
                        Uncover the public sentiment around the video through
                        our advanced Sentiment Insights feature.
                    </p>
                    <Button>Analyze</Button>
                </div>
            </div>
        </section>
    )
}
