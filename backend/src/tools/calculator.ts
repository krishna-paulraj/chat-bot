/**
 * Calculator MCP Tool
 * Provides basic arithmetic operations for the chat bot
 */

export interface CalculatorOperation {
    operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'percentage';
    operands: number[];
}

export interface CalculatorResult {
    operation: string;
    operands: number[];
    result: number;
    expression: string;
}

export class Calculator {
    /**
     * Perform addition
     */
    static add(a: number, b: number): number {
        return a + b;
    }

    /**
     * Perform subtraction
     */
    static subtract(a: number, b: number): number {
        return a - b;
    }

    /**
     * Perform multiplication
     */
    static multiply(a: number, b: number): number {
        return a * b;
    }

    /**
     * Perform division
     */
    static divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error('Division by zero is not allowed');
        }
        return a / b;
    }

    /**
     * Perform exponentiation
     */
    static power(base: number, exponent: number): number {
        return Math.pow(base, exponent);
    }

    /**
     * Calculate square root
     */
    static sqrt(n: number): number {
        if (n < 0) {
            throw new Error('Cannot calculate square root of negative number');
        }
        return Math.sqrt(n);
    }

    /**
     * Calculate percentage
     */
    static percentage(value: number, percentage: number): number {
        return (value * percentage) / 100;
    }

    /**
     * Execute a calculator operation
     */
    static execute(operation: CalculatorOperation): CalculatorResult {
        const { operation: op, operands } = operation;
        let result: number;
        let expression: string;

        switch (op) {
            case 'add':
                if (operands.length !== 2) {
                    throw new Error('Addition requires exactly 2 operands');
                }
                result = this.add(operands[0]!, operands[1]!);
                expression = `${operands[0]} + ${operands[1]}`;
                break;

            case 'subtract':
                if (operands.length !== 2) {
                    throw new Error('Subtraction requires exactly 2 operands');
                }
                result = this.subtract(operands[0]!, operands[1]!);
                expression = `${operands[0]} - ${operands[1]}`;
                break;

            case 'multiply':
                if (operands.length !== 2) {
                    throw new Error('Multiplication requires exactly 2 operands');
                }
                result = this.multiply(operands[0]!, operands[1]!);
                expression = `${operands[0]} × ${operands[1]}`;
                break;

            case 'divide':
                if (operands.length !== 2) {
                    throw new Error('Division requires exactly 2 operands');
                }
                result = this.divide(operands[0]!, operands[1]!);
                expression = `${operands[0]} ÷ ${operands[1]}`;
                break;

            case 'power':
                if (operands.length !== 2) {
                    throw new Error('Power operation requires exactly 2 operands');
                }
                result = this.power(operands[0]!, operands[1]!);
                expression = `${operands[0]} ^ ${operands[1]}`;
                break;

            case 'sqrt':
                if (operands.length !== 1) {
                    throw new Error('Square root requires exactly 1 operand');
                }
                result = this.sqrt(operands[0]!);
                expression = `√${operands[0]}`;
                break;

            case 'percentage':
                if (operands.length !== 2) {
                    throw new Error('Percentage calculation requires exactly 2 operands');
                }
                result = this.percentage(operands[0]!, operands[1]!);
                expression = `${operands[1]}% of ${operands[0]}`;
                break;

            default:
                throw new Error(`Unsupported operation: ${op}`);
        }

        return {
            operation: op,
            operands,
            result,
            expression
        };
    }

    /**
     * Parse and execute a mathematical expression string
     */
    static parseExpression(expression: string): CalculatorResult {
        // Remove whitespace
        const cleanExpression = expression.replace(/\s+/g, '');

        // Simple regex patterns for different operations
        const patterns = {
            add: /^(-?\d+(?:\.\d+)?)\+(-?\d+(?:\.\d+)?)$/,
            subtract: /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/,
            multiply: /^(-?\d+(?:\.\d+)?)[×*](-?\d+(?:\.\d+)?)$/,
            divide: /^(-?\d+(?:\.\d+)?)[÷\/](-?\d+(?:\.\d+)?)$/,
            power: /^(-?\d+(?:\.\d+)?)\^(-?\d+(?:\.\d+)?)$/,
            sqrt: /^√(-?\d+(?:\.\d+)?)$/,
            percentage: /^(-?\d+(?:\.\d+)?)%of(-?\d+(?:\.\d+)?)$/i
        };

        for (const [operation, pattern] of Object.entries(patterns)) {
            const match = cleanExpression.match(pattern);
            if (match) {
                const operands = match.slice(1).map(Number);
                return this.execute({
                    operation: operation as CalculatorOperation['operation'],
                    operands
                });
            }
        }

        throw new Error(`Unable to parse expression: ${expression}`);
    }
}

/**
 * MCP Tool Definition for Calculator
 */
export const calculatorTool = {
    name: "calculator",
    description: "Perform basic arithmetic calculations including addition, subtraction, multiplication, division, power, square root, and percentage calculations",
    inputSchema: {
        type: "object",
        properties: {
            operation: {
                type: "string",
                enum: ["add", "subtract", "multiply", "divide", "power", "sqrt", "percentage"],
                description: "The arithmetic operation to perform"
            },
            operands: {
                type: "array",
                items: {
                    type: "number"
                },
                description: "The numbers to operate on (required when using operation)"
            },
            expression: {
                type: "string",
                description: "Alternative: provide a mathematical expression string (e.g., '5 + 3', '10 * 2', '√16')"
            }
        },
        required: ["operation", "operands"]
    }
};

/**
 * Handle calculator tool calls
 */
export async function handleCalculatorTool(args: any): Promise<CalculatorResult> {
    try {
        if (args.expression) {
            return Calculator.parseExpression(args.expression);
        } else if (args.operation && args.operands) {
            return Calculator.execute({
                operation: args.operation,
                operands: args.operands
            });
        } else {
            throw new Error('Either expression or (operation + operands) must be provided');
        }
    } catch (error) {
        throw new Error(`Calculator error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
