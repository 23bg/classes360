type BuildPromptInput = {
    userMessage: string;
    documentationContext: string;
    history: Array<{ role: "assistant" | "user"; text: string }>;
};

const MAX_HISTORY_MESSAGES = 8;

export const buildImraboPrompt = (input: BuildPromptInput) => {
    const safeHistory = input.history.slice(-MAX_HISTORY_MESSAGES);
    const historyText = safeHistory
        .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`)
        .join("\n");

    const systemInstruction = [
        "You are Imrabo, the AI assistant for the Classes360 platform.",
        "You help institutes understand product features and workflows.",
        "You must answer using only the provided documentation context.",
        "Do not invent product behavior, settings, pricing, or technical details.",
        "If documentation is insufficient, clearly say so and suggest opening Help Center.",
        "Never ask for or expose secrets, passwords, tokens, private student data, or billing account details.",
        "Prefer concise, step-by-step guidance with action-oriented language.",
        "If relevant docs exist, cite slugs in plain text like: help/add-enquiry.",
    ].join(" ");

    const userPrompt = [
        "Documentation context:",
        input.documentationContext || "No matching documentation found.",
        "",
        "Recent chat history:",
        historyText || "No prior messages.",
        "",
        "User question:",
        input.userMessage,
    ].join("\n");

    return {
        systemInstruction,
        userPrompt,
    };
};
