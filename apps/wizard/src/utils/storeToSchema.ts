import { Feature, MintConfig, ProjectConfig, ScopeConfig } from '@patchworkdev/common/types';
import useStore from '../store';
import sanitizeName from './sanitizeName';

function storeToSchema(): ProjectConfig {
    const { contractsConfig, scopeConfig } = useStore.getState();
    const contracts = new Map();
    const mintConfigs: Map<string, MintConfig> = new Map();
    const contractRelations = new Map();
    //const patchFees = new Map();
    //const assignFees = new Map();

    Object.values(contractsConfig).forEach((contract) => {
        const sanitizedName = sanitizeName(contract.name);
        contracts.set(sanitizedName, contract);
        if (contract.features.includes(Feature.MINTABLE) && contract.mintFee) {
            mintConfigs.set(sanitizedName, {
                flatFee: contract.mintFee,
                active: true,
            });
        }
        if (contract.features.includes(Feature.LITEREF)) {
            if (contract.assignFee) {
            }
        }
        if (contract.patchFee) {
        }
    });

    const scopes: ScopeConfig[] = [
        {
            ...scopeConfig,
            mintConfigs,
        },
    ];
    return {
        name: scopeConfig.name,
        scopes,
        contracts,
        contractRelations,
    };
}

export default storeToSchema;
