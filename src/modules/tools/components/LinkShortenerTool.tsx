"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CreateShortLinkResponse = {
    success: boolean;
    data?: {
        shortUrl: string;
        slug: string;
    };
    error?: {
        message?: string;
    };
};

export default function LinkShortenerTool() {
    const [longUrl, setLongUrl] = useState("");
    const [customSlug, setCustomSlug] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createShortLink = async () => {
        setError("");
        setShortUrl("");

        if (!longUrl.trim()) {
            setError("Long URL is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/v1/tools/short-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalUrl: longUrl.trim(),
                    customSlug: customSlug.trim() || undefined,
                }),
            });

            const payload = (await response.json()) as CreateShortLinkResponse;
            if (!response.ok || !payload.success || !payload.data) {
                setError(payload.error?.message || "Unable to shorten link");
                return;
            }

            setShortUrl(payload.data.shortUrl);
        } catch {
            setError("Unable to shorten link");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyLink = async () => {
        if (!shortUrl) return;
        await navigator.clipboard.writeText(shortUrl);
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Free Link Shortener</CardTitle>
                <CardDescription>Create a short URL for admission forms and campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Input placeholder="Long URL" value={longUrl} onChange={(event) => setLongUrl(event.target.value)} />
                <Input
                    placeholder="Custom slug (optional)"
                    value={customSlug}
                    onChange={(event) => setCustomSlug(event.target.value)}
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="w-full" disabled={isSubmitting} onClick={createShortLink}>
                    {isSubmitting ? "Generating..." : "Generate Short Link"}
                </Button>

                {shortUrl ? (
                    <div className="space-y-2 rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">Your short link</p>
                        <p className="break-all font-medium">{shortUrl}</p>
                        <Button variant="outline" onClick={copyLink}>Copy</Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
