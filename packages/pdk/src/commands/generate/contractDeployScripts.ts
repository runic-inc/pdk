import { cliProcessor } from '../../common/cliProcessor';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { PatchworkProject } from '../../types';

export async function generateContractDeployScripts(config: PatchworkProject, contractsDir?: string, output?: string) {
    try {
        await cliProcessor.generateDeployScripts(config, contractsDir, output);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { config, contractsDir, output });
    }
}
