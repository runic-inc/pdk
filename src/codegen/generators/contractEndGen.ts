import { ContractSchema } from "../contractSchema";
import { Generator } from "../generator";

export class ContractEndGen implements Generator {
    gen(schema: ContractSchema): string {
        return `\n` +
            `    /// Code after this marker will not be overwritten by the PDK code generator #PDK-USER-CODE#\n` +
            `}`;
    }
}