"use client"

import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const description = "An interactive area chart"

export function ChartAreaInteractive() {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Admissions Trend</CardTitle>
                <CardDescription>Dashboard trend chart will be enabled in the next phase.</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="h-[250px] w-full rounded border border-dashed bg-muted/30" />
            </CardContent>
        </Card>
    )
}

