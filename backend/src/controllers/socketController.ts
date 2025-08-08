import { WebSocket } from "ws";
import { chat } from "../models/chat.js";

const handleConnection = async (ws: WebSocket) => {
    ws.on("message", async (message: Buffer) => {
        const response = await chat(message.toString());
        ws.send(`AI: ${response.toString()}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
}

export { handleConnection };