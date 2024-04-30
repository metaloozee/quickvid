"use client"

import * as React from "react"
import { MonitorSmartphone, MoonStar, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="flex justify-center md:justify-start">
            <ToggleGroup
                type="single"
                className="w-fit rounded-full border p-1 text-muted-foreground"
                defaultValue={"dark"}
            >
                <ToggleGroupItem
                    className="rounded-full"
                    onClick={() => setTheme("light")}
                    value="light"
                    aria-label="Toggle light"
                >
                    <Sun className="size-3" />
                </ToggleGroupItem>

                {/* <ToggleGroupItem
                    className="rounded-full"
                    onClick={() => setTheme("system")}
                    value="system"
                    aria-label="Toggle system"
                >
                    <MonitorSmartphone className="size-3" />
                </ToggleGroupItem> */}

                <ToggleGroupItem
                    className="rounded-full"
                    onClick={() => setTheme("dark")}
                    value="dark"
                    aria-label="Toggle dark"
                >
                    <MoonStar className="size-3" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}
