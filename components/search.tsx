"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search as SearchIcon } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

import { Input } from "@/components/ui/input"

export const Search = ({ placeholder }: { placeholder: string }) => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        console.log(`Searching... ${term}`)

        const params = new URLSearchParams(searchParams)

        if (term) {
            params.set("query", term)
        } else {
            params.delete("query")
        }

        replace(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <div className="relative flex w-full items-center justify-center">
            <Input
                placeholder={placeholder}
                onChange={(e) => {
                    handleSearch(e.target.value)
                }}
                defaultValue={searchParams.get("query")?.toString()}
                className="peer pl-10"
            />
            <SearchIcon className="absolute left-3 size-4 text-muted-foreground peer-focus:text-primary" />
        </div>
    )
}
