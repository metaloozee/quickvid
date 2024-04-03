import Link from "next/link"
import { MoveRight } from "lucide-react"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { LoginBtn } from "@/components/login-btn"

export default async function IndexPage() {
    const supabase = await createSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <section className="container mt-40 flex items-center">
            <div className="flex max-w-5xl flex-col items-start gap-5">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Save time and get the essence of any YouTube video with our
                    intelligent summarization.
                </h1>
                <p className="text-sm text-muted-foreground">
                    Using cutting-edge Artificial Intelligence technology, our
                    application intelligently analyzes the contents of a YouTube
                    video and generates a concise summary that captures the
                    essence of the video.
                </p>

                <LoginBtn user={user}>
                    <>
                        Get Started
                        <MoveRight className="ml-2 h-4 w-4 transition-all duration-200 group-hover:ml-4" />
                    </>
                </LoginBtn>

                <p className="mt-10 font-mono text-xs text-neutral-500">
                    made with ❤️ by{" "}
                    <Link
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/metaloozee/"
                    >
                        metaloozee
                    </Link>
                </p>
            </div>
        </section>
    )
}
