import { ContractSchema } from "../contractSchema";
import { Generator } from "../generator";

export class ContractEndGen implements Generator {
    gen(schema: ContractSchema): string {
        return `}`;
    }
}