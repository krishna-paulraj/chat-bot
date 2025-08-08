import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

// Chat session interface
export interface ChatSession {
    id: string;
    history: Array<{
        role: "user" | "model";
        parts: Array<{ text: string }>;
    }>;
    createdAt: Date;
    lastActivity: Date;
}

// In-memory storage for chat sessions (in production, use a database)
const chatSessions: Map<string, ChatSession> = new Map();

export async function chat(message: string) {
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: message,
    });

    return response.text || "No response generated";
}

export async function chatStream(message: string) {
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: "Explain how AI works in 100 words",
    });

    for await (const chunk of response) {
        console.log(chunk.text);
    }
}

export async function createChatSession(initialMessage?: string): Promise<ChatSession> {
    const sessionId = generateSessionId();

    const session: ChatSession = {
        id: sessionId,
        history: [],
        createdAt: new Date(),
        lastActivity: new Date()
    };

    // Add initial message if provided
    if (initialMessage) {
        session.history.push({
            role: "user",
            parts: [{ text: initialMessage }]
        });

        // Get AI response
        const aiResponse = await chat(initialMessage);
        session.history.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });
    }

    chatSessions.set(sessionId, session);
    return session;
}

export async function sendMessage(sessionId: string, message: string): Promise<{ response: string; session: ChatSession }> {
    const session = chatSessions.get(sessionId);
    if (!session) {
        throw new Error("Chat session not found");
    }

    // Add user message to history
    session.history.push({
        role: "user",
        parts: [{ text: message }]
    });

    // Create chat instance with history
    const chat = ai.chats.create({
        model: "gemini-1.5-flash",
        history: session.history
    });

    // Send message and get response
    const result = await chat.sendMessage({ message: [{ text: message }] });
    const response = result.text || "No response generated";

    // Add AI response to history
    session.history.push({
        role: "model",
        parts: [{ text: response }]
    });

    // Update last activity
    session.lastActivity = new Date();
    chatSessions.set(sessionId, session);

    return { response, session };
}

export function getChatSession(sessionId: string): ChatSession | undefined {
    return chatSessions.get(sessionId);
}

export function getAllChatSessions(): ChatSession[] {
    return Array.from(chatSessions.values());
}

export function deleteChatSession(sessionId: string): boolean {
    return chatSessions.delete(sessionId);
}

function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}