"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type QrHistoryItem = {
    value: string;
    png: string;
    createdAt: string;
};

const STORAGE_KEY = "classes360_qr_history";

const buildQrText = (data: {
    websiteUrl: string;
    phoneNumber: string;
    whatsappLink: string;
    admissionFormLink: string;
}) => {
    const lines = [
        data.websiteUrl.trim() ? `Website: ${data.websiteUrl.trim()}` : "",
        data.phoneNumber.trim() ? `Phone: ${data.phoneNumber.trim()}` : "",
        data.whatsappLink.trim() ? `WhatsApp: ${data.whatsappLink.trim()}` : "",
        data.admissionFormLink.trim() ? `Admission Form: ${data.admissionFormLink.trim()}` : "",
    ].filter(Boolean);

    return lines.join("\n");
};

export default function QrCodeGeneratorTool() {
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [whatsappLink, setWhatsappLink] = useState("");
    const [admissionFormLink, setAdmissionFormLink] = useState("");
    const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [history, setHistory] = useState<QrHistoryItem[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as QrHistoryItem[]) : [];
        } catch {
            return [];
        }
    });
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const qrText = useMemo(
        () =>
            buildQrText({
                websiteUrl,
                phoneNumber,
                whatsappLink,
                admissionFormLink,
            }),
        [websiteUrl, phoneNumber, whatsappLink, admissionFormLink]
    );

    const generateQr = async () => {
        setError(null);

        if (!qrText) {
            setError("Add at least one field to generate QR code.");
            return;
        }

        setIsGenerating(true);
        try {
            const [png, svg] = await Promise.all([
                QRCode.toDataURL(qrText, { width: 512, margin: 1 }),
                QRCode.toString(qrText, { type: "svg", margin: 1, width: 512 }),
            ]);

            setPngDataUrl(png);
            setSvgContent(svg);

            const nextHistory: QrHistoryItem[] = [{ value: qrText, png, createdAt: new Date().toISOString() }, ...history].slice(0, 5);
            setHistory(nextHistory);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
        } catch {
            setError("Failed to generate QR code. Try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle>Generate QR Code</CardTitle>
                    <CardDescription>Add website, phone, WhatsApp, or admission link</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input placeholder="Website URL" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
                    <Input placeholder="Phone Number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
                    <Input placeholder="WhatsApp Link" value={whatsappLink} onChange={(event) => setWhatsappLink(event.target.value)} />
                    <Input
                        placeholder="Admission Form Link"
                        value={admissionFormLink}
                        onChange={(event) => setAdmissionFormLink(event.target.value)}
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button onClick={generateQr} disabled={isGenerating} className="w-full">
                        {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Download in PNG or SVG format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pngDataUrl ? (
                        <>
                            <Image
                                src={pngDataUrl}
                                alt="Generated QR code"
                                width={288}
                                height={288}
                                unoptimized
                                className="mx-auto h-72 w-72 rounded-lg border p-2"
                            />
                            <div className="flex flex-wrap gap-2">
                                <Button asChild>
                                    <a href={pngDataUrl} download="classes360-qr.png">Download PNG</a>
                                </Button>
                                {svgContent ? (
                                    <Button asChild variant="outline">
                                        <a
                                            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`}
                                            download="classes360-qr.svg"
                                        >
                                            Download SVG
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Generate a QR code to see preview.</p>
                    )}

                    {history.length ? (
                        <div className="space-y-2 border-t pt-4">
                            <p className="text-sm font-medium">Last 5 generated</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {history.map((item) => (
                                    <div key={item.createdAt} className="rounded-md border p-2">
                                        <Image
                                            src={item.png}
                                            alt="QR history"
                                            width={80}
                                            height={80}
                                            unoptimized
                                            className="h-20 w-20 rounded border"
                                        />
                                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
