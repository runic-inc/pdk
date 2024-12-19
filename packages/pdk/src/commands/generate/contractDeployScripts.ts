import { cliProcessor } from '../../common/cliProcessor';
import { ErrorCode, PDKError } from '../../common/helpers/error';

export async function generateContractDeployScripts(configFiles: string[], contractsDir?: string, output?: string) {
    try {
        cliProcessor.generateDeployScripts(configFiles, contractsDir, output);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { configFiles, contractsDir, output });
    }
}
