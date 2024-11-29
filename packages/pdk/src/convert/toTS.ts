import { cliProcessor } from '../common/cliProcessor';
import { ErrorCode, PDKError } from '../common/helpers/error';

export async function convertToTS(configFiles: string[], output?: string) {
    try {
        cliProcessor.convertToTS(configFiles, output);
    } catch (e) {
        throw new PDKError(ErrorCode.PDK_ERROR, `Error converting files`, { configFiles, output });
    }
}
