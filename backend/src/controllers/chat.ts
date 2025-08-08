import { Request, Response } from "express";
import { 
    createChatSession, 
    sendMessage, 
    getChatSession, 
    getAllChatSessions, 
    deleteChatSession 
} from "../models/chat.js";

// Create a new chat session
export async function createSession(req: Request, res: Response): Promise<void> {
    try {
        const { initialMessage } = req.body;
        const session = await createChatSession(initialMessage);
        
        res.status(201).json({
            success: true,
            session: {
                id: session.id,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                messageCount: session.history.length
            }
        });
    } catch (error) {
        console.error("Error creating chat session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create chat session"
        });
    }
}

// Send a message to an existing chat session
export async function sendMessageToSession(req: Request, res: Response): Promise<void> {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required"
            });
            return;
        }

        if (!message) {
            res.status(400).json({
                success: false,
                error: "Message is required"
            });
            return;
        }

        const result = await sendMessage(sessionId, message);
        
        res.json({
            success: true,
            response: result.response,
            session: {
                id: result.session.id,
                lastActivity: result.session.lastActivity,
                messageCount: result.session.history.length
            }
        });
    } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof Error && error.message === "Chat session not found") {
            res.status(404).json({
                success: false,
                error: "Chat session not found"
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Failed to send message"
        });
    }
}

// Get a specific chat session with its history
export async function getSession(req: Request, res: Response): Promise<void> {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required"
            });
            return;
        }

        const session = getChatSession(sessionId);

        if (!session) {
            res.status(404).json({
                success: false,
                error: "Chat session not found"
            });
            return;
        }

        res.json({
            success: true,
            session: {
                id: session.id,
                history: session.history,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity
            }
        });
    } catch (error) {
        console.error("Error getting chat session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get chat session"
        });
    }
}

// Get all chat sessions (summary)
export async function getAllSessions(req: Request, res: Response): Promise<void> {
    try {
        const sessions = getAllChatSessions();
        
        const sessionSummaries = sessions.map(session => ({
            id: session.id,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            messageCount: session.history.length
        }));

        res.json({
            success: true,
            sessions: sessionSummaries
        });
    } catch (error) {
        console.error("Error getting all chat sessions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get chat sessions"
        });
    }
}

// Delete a chat session
export async function deleteSession(req: Request, res: Response): Promise<void> {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: "Session ID is required"
            });
            return;
        }

        const deleted = deleteChatSession(sessionId);

        if (!deleted) {
            res.status(404).json({
                success: false,
                error: "Chat session not found"
            });
            return;
        }

        res.json({
            success: true,
            message: "Chat session deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting chat session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete chat session"
        });
    }
}
