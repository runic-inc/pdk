import { ContractConfig, Feature, MintConfig, ProjectConfig, ScopeConfig } from '@patchworkdev/common/types';
import _ from 'lodash';
import useStore from '../store';
import sanitizeName from './sanitizeName';

function storeToSchema(): ProjectConfig {
    const { contractsConfig, scopeConfig } = useStore.getState();
    const contracts: Record<string, ContractConfig> = {};
    const mintConfigs: Record<string, MintConfig> = {};
    //const patchFees = new Map();
    //const assignFees = new Map();

    const contractNameByUid = (uid: string) => {
        return contractsConfig[uid].name;
    };

    Object.values(contractsConfig).forEach((contract) => {
        const sanitizedName = sanitizeName(contract.name);
        contracts[sanitizedName] = {
            ...contract,
            scopeName: sanitizeName(scopeConfig.name),
            fragments: Array.from(contract.fragments).map((fragment) => {
                return sanitizeName(contractNameByUid(fragment));
            }),
        };
        if (contract.features.includes(Feature.MINTABLE) && contract.mintFee) {
            mintConfigs[sanitizedName] = {
                flatFee: Number(contract.mintFee),
                active: true,
            };
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
            name: sanitizeName(scopeConfig.name),
            bankers: _.compact(scopeConfig.bankers),
            operators: _.compact(scopeConfig.operators),
        },
    ];
    return {
        name: sanitizeName(scopeConfig.name) as any,
        scopes,
        contracts,
    };
}

export default storeToSchema;
