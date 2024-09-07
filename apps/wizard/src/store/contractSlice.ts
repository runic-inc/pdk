import { Feature } from '@patchworkdev/common/types';
import { produce } from 'immer';
import _ from 'lodash';
import { StateCreator } from 'zustand';
import { Store } from '.';
import { UContractConfig } from '../types';

export type ContractStore = {
    getContractConfig: () => UContractConfig | undefined;
    updateContractConfig: (newConfig: UContractConfig) => void;
    //getContractFields: () => UFieldConfig[];
    //updateContractFields: (newFields: UFieldConfig[]) => void;
    getContractFeatures: () => Feature[];
    updateContractFeatures: (selectedKeys: Feature[], featureGroupKeys: Feature[]) => void;
    updateContractFeatureOptions: (feature: Feature, key: string, value: string) => void;
    updateContractFragments: (fragments: string[]) => void;
    addFragmentToContract: (target: string) => void;
    removeFragmentFromContract: (target: string) => void;
    removeFragmentFromContracts: (uid: string) => void;
    getAssignedTo: () => Array<{ uid: string; name: string }>;
    getAssignedFrom: () => Array<{ uid: string; name: string }>;
};

export const createContractSlice: StateCreator<Store, [], [], ContractStore> = (set, get) => ({
    getContractConfig: () => {
        return {
            ...get().contractsConfig[get().editor!],
            scopeName: get().scopeConfig.name,
        };
    },
    updateContractConfig: (newConfig: UContractConfig) => {
        set(
            produce((state: Store) => {
                state.contractsConfig[state.editor!] = newConfig;
            }),
        );
    },
    getContractFeatures: () => {
        return get().contractsConfig[get().editor!].features ?? [];
    },
    updateContractFeatures: (selectedKeys: Feature[], featureGroupKeys: Feature[]) => {
        set(
            produce((state: Store) => {
                const features = _.uniq(_.clone(state.contractsConfig[state.editor!].features));
                _.pull(features, ...featureGroupKeys);
                features.push(...selectedKeys);
                state.contractsConfig[state.editor!].features = features;
            }),
        );
    },
    updateContractFeatureOptions: (feature: Feature, key: string, value: string) => {
        set(
            produce((state: Store) => {
                if (feature in state.contractsConfig[state.editor!].featureOptions) {
                    state.contractsConfig[state.editor!].featureOptions[feature]![key] = value;
                } else {
                    state.contractsConfig[state.editor!].featureOptions[feature] = { [key]: value };
                }
            }),
        );
    },
    updateContractFragments: (fragments: string[]) => {
        set(
            produce((state: Store) => {
                state.contractsConfig[state.editor!].fragments = new Set(fragments);
            }),
        );
    },
    addFragmentToContract: (target: string) => {
        set(
            produce((state: Store) => {
                state.contractsConfig[target!].fragments.add(state.editor!);
            }),
        );
    },
    removeFragmentFromContract: (target: string) => {
        set(
            produce((state: Store) => {
                state.contractsConfig[target!].fragments.delete(state.editor!);
            }),
        );
    },
    removeFragmentFromContracts: (uid: string) => {
        set(
            produce((state: Store) => {
                const contracts = Object.values(_.clone(get().contractsConfig));
                contracts.forEach((contract) => {
                    if ('has' in contract.fragments && contract.fragments.has(uid)) {
                        state.contractsConfig[contract._uid].fragments.delete(uid);
                    }
                });
            }),
        );
    },
    getAssignedTo: (): Array<{ uid: string; name: string }> => {
        const records = [];
        for (const contract of Object.values(get().contractsConfig)) {
            if ('has' in contract.fragments && contract.fragments.has(get().editor!)) {
                records.push({
                    uid: contract._uid,
                    name: contract.name,
                });
            }
        }
        return records;
    },
    getAssignedFrom: (): Array<{ uid: string; name: string }> => {
        const records = Array.from(get().contractsConfig[get().editor!].fragments).map((uid) => {
            return {
                uid: get().contractsConfig[uid]._uid,
                name: get().contractsConfig[uid].name,
            };
        });
        return records;
    },
});
