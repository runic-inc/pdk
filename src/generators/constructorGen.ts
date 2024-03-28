import { ContractSchema } from "../contractSchema";
import { Generator, ind } from "../generator";
import { cleanAndCapitalizeFirstLetter } from "../utils";

export class ConstructorGen implements Generator {
    gen(schema: ContractSchema): string {
        let output = `` +
        `constructor(address _manager, address _owner)\n`;
        output += `    Patchwork721("${schema.scopeName}", "${schema.name}", "${schema.symbol}", _manager, _owner)\n`;
        if (schema.hasLiteRef()) {
            output += `    PatchworkLiteRef()\n`;
        }
        output += `{}\n`;
        return ind(4, output);
    }
}