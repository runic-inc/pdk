import path from 'path';
import { CLIProcessor } from '../cliProcessor';

import { ErrorCode, PDKError } from '../helpers/error';

export async function generateContracts(configFiles: string[], outputDir?: string, contract?: string) {
    path.join(__dirname, '../schemas/patchwork-contract-config.schema.json');
    const CONTRACT_SCHEMA = path.join(__dirname, '../schemas/patchwork-contract-config.schema.json');
    const PROJECT_SCHEMA = path.join(__dirname, '../schemas/patchwork-project-config.schema.json');

    const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

    try {
        cliProcessor.generateSolidity(configFiles, outputDir, contract);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { configFiles, outputDir, contract });
    }
}
