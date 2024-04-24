import { Skeleton } from "@/components/ui/skeleton"

export default async function SummariesDefaultPage() {
    return (
        <section className="container mt-10 flex w-screen flex-col items-start gap-5">
            <div className="flex w-full flex-row items-center gap-10 overflow-scroll md:overflow-visible">
                <Skeleton className="h-[150px] w-full max-w-xl bg-secondary" />
            </div>
        </section>
    )
}
