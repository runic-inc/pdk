import { ContractSchema } from "../contractSchema";
import { Generator } from "../generator";
import { capitalizeFirstLetter } from "../utils";

export class MintFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        return "";
    }
}