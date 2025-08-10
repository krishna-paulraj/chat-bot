/**
 * Tools Registry
 * Central registry for all MCP tools available to the chat bot
 * 
 * To add a new tool:
 * 1. Create a new tool file in this directory (e.g., myTool.ts)
 * 2. Define the tool schema and handler function
 * 3. Import and add it to the toolsRegistry array below
 * 4. Export the tool from this file
 */

import { calculatorTool, handleCalculatorTool } from './calculator.js';
import { xTool, handleXTool } from './x.js';

export interface Tool {
    name: string;
    description: string;
    inputSchema: any;
    handler: (args: any) => Promise<any>;
}

/**
 * Registry of all available tools
 */
export const toolsRegistry: Tool[] = [
    {
        name: calculatorTool.name,
        description: calculatorTool.description,
        inputSchema: calculatorTool.inputSchema,
        handler: handleCalculatorTool
    },
    {
        name: xTool.name,
        description: xTool.description,
        inputSchema: xTool.inputSchema,
        handler: handleXTool
    },
];

/**
 * Get tool by name
 */
export function getToolByName(name: string): Tool | undefined {
    return toolsRegistry.find(tool => tool.name === name);
}

/**
 * Get all available tools
 */
export function getAllTools(): Tool[] {
    return toolsRegistry;
}

/**
 * Execute a tool with given arguments
 */
export async function executeTool(toolName: string, args: any): Promise<any> {
    const tool = getToolByName(toolName);
    if (!tool) {
        throw new Error(`Tool '${toolName}' not found`);
    }

    try {
        return await tool.handler(args);
    } catch (error) {
        throw new Error(`Error executing tool '${toolName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert tools to Gemini AI function declarations format
 */
export function getGeminiToolDeclarations() {
    return toolsRegistry.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
    }));
}

// Export individual tools
export { calculatorTool, handleCalculatorTool } from './calculator.js';
export { xTool, handleXTool } from './x.js';
