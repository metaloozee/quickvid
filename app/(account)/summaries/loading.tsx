import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <section className="container mt-10 flex w-full flex-col items-start gap-5">
            <Skeleton className="h-[170px] w-full rounded-xl bg-secondary/30" />
            <Skeleton className="h-[170px] w-full rounded-xl bg-secondary/30" />
            <Skeleton className="h-[170px] w-full rounded-xl bg-secondary/30" />
        </section>
    )
}
