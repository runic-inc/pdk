import { cliProcessor } from '../common/cliProcessor';
import { ErrorCode, PDKError } from '../common/helpers/error';

export async function generateContracts(configFiles: string[], outputDir?: string, contract?: string) {
    try {
        cliProcessor.generateSolidity(configFiles, outputDir, contract);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { configFiles, outputDir, contract });
    }
}
