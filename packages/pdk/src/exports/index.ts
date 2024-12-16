import { ContractProcessor } from '../commands/dev/services/contract-processor';

export const processContracts = async (configPath: string, config = {}, shouldDeploy = false) => {
    const processor = new ContractProcessor();
    return processor.processContracts(configPath, config, shouldDeploy);
};
