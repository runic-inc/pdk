import type { ContractSchema } from "./contractSchema";

export interface Generator {
    gen(schema: ContractSchema): string;
}

export function ind(numOfSpaces: number, str: string): string {
    const indentation = ' '.repeat(numOfSpaces);
    return str.split('\n').map(line => line ? indentation + line : line).join('\n');
}
