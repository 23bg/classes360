"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/constants/api";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

type Message = {
    id: string;
    role: "assistant" | "user";
    text: string;
};

const CHAT_STORAGE_KEY = "classes360:imrabo-chat";

const QUICK_SUGGESTIONS = [
    "Add enquiry",
    "Create course",
    "Convert student",
    "Billing help",
];

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    role: "assistant",
    text: "Hi, I am Imrabo. Ask me about leads, students, fees, billing, or workflows.",
};

const loadInitialMessages = () => {
    if (typeof window === "undefined") {
        return [WELCOME_MESSAGE];
    }

    try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!raw) return [WELCOME_MESSAGE];

        const parsed = JSON.parse(raw) as Message[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [WELCOME_MESSAGE];
        }

        return parsed;
    } catch {
        return [WELCOME_MESSAGE];
    }
};

export default function ImraboChat() {
    const [messages, setMessages] = useState<Message[]>(loadInitialMessages);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    const streamAssistantResponse = async (userText: string) => {
        const userId = `${Date.now()}-user`;
        const assistantId = `${Date.now()}-assistant`;

        setMessages((prev) => [
            ...prev,
            { id: userId, role: "user", text: userText },
            { id: assistantId, role: "assistant", text: "" },
        ]);

        setIsSending(true);

        try {
            const response = await fetch(`/api/v1${API.INTERNAL.AI.IMRABO_CHAT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userText,
                    history: messages.slice(-8).map((message) => ({ role: message.role, text: message.text })),
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Chat request failed");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const chunk = await reader.read();
                done = chunk.done;
                if (chunk.value) {
                    const textChunk = decoder.decode(chunk.value, { stream: true });
                    setMessages((prev) =>
                        prev.map((message) =>
                            message.id === assistantId
                                ? { ...message, text: `${message.text}${textChunk}` }
                                : message
                        )
                    );
                }
            }
        } catch {
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === assistantId
                        ? {
                            ...message,
                            text: "I could not respond right now. Please open Help Center for guidance.",
                        }
                        : message
                )
            );
        } finally {
            setIsSending(false);
        }
    };

    const sendMessage = async (seedText?: string) => {
        const text = (seedText ?? input).trim();
        if (!text || isSending) return;

        setInput("");
        await streamAssistantResponse(text);
    };

    const clearChat = () => {
        setMessages([WELCOME_MESSAGE]);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size='icon' className="bg-green-500"><Bot className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[420px] p-0">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bot className="h-4 w-4" /> Ask Imrabo
                    </SheetTitle>
                </SheetHeader>

                <div className="px-4 py-2 border-b flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                        <Button
                            key={suggestion}
                            size="sm"
                            variant="secondary"
                            onClick={() => void sendMessage(suggestion)}
                            disabled={isSending}
                        >
                            {suggestion}
                        </Button>
                    ))}
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={clearChat} disabled={isSending}>
                        Clear
                    </Button>
                </div>

                <div className="h-[calc(100%-170px)] overflow-y-auto px-4 py-3 space-y-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`rounded-lg px-3 py-2 text-sm ${message.role === "assistant"
                                ? "bg-muted text-foreground"
                                : "bg-primary text-primary-foreground ml-8"
                                }`}
                        >
                            {message.text || (message.role === "assistant" ? "..." : "")}
                        </div>
                    ))}

                    {isSending ? (
                        <div className="rounded-lg px-3 py-2 text-sm bg-muted text-foreground inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Imrabo is thinking...
                        </div>
                    ) : null}
                    <div ref={endRef} />
                </div>

                <div className="border-t p-3 flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
                        placeholder="Ask anything..."
                        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                            if (event.key === "Enter") void sendMessage();
                        }}
                        disabled={isSending}
                    />
                    <Button
                        size="icon"
                        onClick={() => void sendMessage()}
                        aria-label="Send message"
                        disabled={isSending}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
