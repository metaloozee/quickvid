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

    if (!user) {
        return (
            <section className="container mt-40 flex items-center">
                <div className="flex max-w-5xl flex-col items-start gap-5">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                        Unauthorized
                    </h1>
                    <p className="text-muted-foreground">
                        Insufficient privileges are restricting your access to
                        this page; consider logging in or reaching out to the
                        administrator for assistance.
                    </p>
                </div>
            </section>
        )
    }

    if (!data) {
        return (
            <section className="container mt-40 flex items-center">
                <div className="flex max-w-5xl flex-col items-start gap-5">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                        No Data Found
                    </h1>
                    <p className="text-muted-foreground">
                        We apologize for the inconvenience; your video request
                        cannot be processed. Please reach out to the
                        administrator or attempt again.
                    </p>
                </div>
            </section>
        )
    }

    const videoInfo = await ytdl.getInfo(data?.videoid ?? "")

    return (
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            {data.summary ? (
                <div className="flex flex-col gap-10 md:col-span-2">
                    <div className="flex flex-col items-start gap-5 rounded-xl bg-secondary p-5">
                        <div className="flex w-full flex-col items-center justify-between gap-5 md:flex-row md:items-center">
                            <Embed
                                thumbnail={
                                    videoInfo.videoDetails.thumbnails.reverse()[0]
                                        .url
                                }
                            />
                            <div className="flex w-full flex-col gap-2">
                                <h1 className="text-md text-center font-extrabold leading-tight tracking-tighter md:text-left md:text-lg">
                                    {videoInfo.videoDetails.title}
                                </h1>
                                <p className="text-center text-xs text-muted-foreground md:text-left">
                                    {videoInfo.videoDetails.description &&
                                    videoInfo.videoDetails.description?.length >
                                        100
                                        ? videoInfo.videoDetails.description
                                              ?.slice(0, 100)
                                              .concat("...")
                                        : videoInfo.videoDetails.description}
                                </p>
                                <div className="mt-3 flex flex-row items-center justify-center gap-4 md:items-start md:justify-start">
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
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-5 rounded-xl p-5 outline-dashed outline-2 outline-secondary">
                        {data.summary}
                        <Button className="w-full" variant={"secondary"}>
                            Regenerate Summary
                        </Button>
                    </div>
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
                <div className="flex w-full flex-col gap-5 rounded-xl border-primary p-5 outline-dashed outline-2 outline-primary">
                    <p className="text-xs">
                        Our fact checker verifies video content by searching the
                        internet and comparing information from reliable
                        sources. It labels videos as accurate, partially
                        accurate, or inaccurate based on its analysis. Please
                        note that accuracy depends on available internet
                        information.
                    </p>
                    <Button>Check for Truth</Button>
                </div>
            </div>
        </section>
    )
}
