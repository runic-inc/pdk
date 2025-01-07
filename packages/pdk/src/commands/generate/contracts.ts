import { cliProcessor } from '../../common/cliProcessor';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { PatchworkProject } from '../../types';

export async function generateContracts(config: PatchworkProject, outputDir?: string, contract?: string) {
    try {
        cliProcessor.generateSolidity(config, outputDir, contract);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { config, outputDir, contract });
    }
}
