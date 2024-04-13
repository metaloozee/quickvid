import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <section className="container mt-10 grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            <div className="col-span-2 flex flex-col gap-10">
                <Skeleton className="h-[350px] w-full bg-secondary" />
            </div>
            <div className="flex w-full flex-col gap-10">
                <Skeleton className="h-[150px] w-full bg-secondary" />
                <Skeleton className="h-[225px] w-full bg-secondary" />
            </div>
        </section>
    )
}
