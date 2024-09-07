import { ContractRelation, Feature, MintConfig, ProjectConfig, ScopeConfig } from '@patchworkdev/common/types';
import _ from 'lodash';
import useStore from '../store';
import sanitizeName from './sanitizeName';

function storeToSchema(): ProjectConfig {
    const { contractsConfig, scopeConfig } = useStore.getState();
    const contracts = new Map();
    const mintConfigs: Map<string, MintConfig> = new Map();
    const contractRelations: Map<string, ContractRelation> = new Map();
    //const patchFees = new Map();
    //const assignFees = new Map();

    const contractNameByUid = (uid: string) => {
        return contractsConfig[uid].name;
    };

    Object.values(contractsConfig).forEach((contract) => {
        const sanitizedName = sanitizeName(contract.name);
        contracts.set(sanitizedName, contract);
        if (contract.features.includes(Feature.MINTABLE) && contract.mintFee) {
            mintConfigs.set(sanitizedName, {
                flatFee: Number(contract.mintFee),
                active: true,
            });
        }
        if (contract.features.includes(Feature.LITEREF)) {
            if (contract.assignFee) {
            }
            if (contract.fragments) {
                contractRelations.set(sanitizedName, {
                    fragments: Array.from(contract.fragments).map((fragment) => {
                        return sanitizeName(contractNameByUid(fragment));
                    }),
                });
            }
        }
        if (contract.patchFee) {
        }
    });

    const scopes: ScopeConfig[] = [
        {
            ...scopeConfig,
            bankers: _.compact(scopeConfig.bankers),
            operators: _.compact(scopeConfig.operators),
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
