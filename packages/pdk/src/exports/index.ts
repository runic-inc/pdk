import { ContractProcessor } from '../commands/dev/services/contract-processor';
import { getChainForNetwork } from '../commands/dev/services/helpers';

export const processContracts = async (configPath: string, config = {}, shouldDeploy = false) => {
    const processor = new ContractProcessor();
    return processor.processContracts(configPath, config, shouldDeploy);
};

export * from '../commands/dev/types';
export * from '../common/helpers/metadata';
export { getChainForNetwork };
