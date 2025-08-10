import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { getGeminiToolDeclarations, executeTool } from "../tools/index.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export async function chat(message: string) {
    const tools = getGeminiToolDeclarations();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
            tools: tools.length > 0 ? [{ functionDeclarations: tools }] : [],
        }
    });

    // Check if the response contains tool calls
    if (response.candidates?.[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;
        let finalResponse = "";

        for (const part of parts) {
            if (part.text) {
                finalResponse += part.text;
            } else if (part.functionCall) {
                // Execute the tool
                try {
                    const toolResult = await executeTool(
                        part.functionCall?.name || "",
                        part.functionCall?.args
                    );

                    // Create a simple response with the tool result
                    const toolResultText = typeof toolResult === 'object'
                        ? JSON.stringify(toolResult, null, 2)
                        : String(toolResult);

                    finalResponse += `\n\nCalculation result: ${toolResultText}`;
                } catch (error) {
                    finalResponse += `\n\nError executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            }
        }

        return finalResponse || "No response generated";
    }

    return response.text || "No response generated";
}

export async function chatStream(message: string) {
    const tools = getGeminiToolDeclarations();

    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
            tools: tools.length > 0 ? [{ functionDeclarations: tools }] : [],
        }
    });

    for await (const chunk of response) {
        console.log(chunk.text);
    }
}


