import { Feature } from '@/types';
import { produce } from 'immer';
import _ from 'lodash';
import { StateCreator } from 'zustand';
import { Store } from '.';
import defaultContract from '../lib/defaultContract';
import { UContractConfig } from '../types';

export type ContractStore = {
    contractConfig: UContractConfig;
    getContractConfig: () => UContractConfig | undefined;
    updateContractConfig: (newConfig: UContractConfig) => void;
    //getContractFields: () => UFieldConfig[];
    //updateContractFields: (newFields: UFieldConfig[]) => void;
    getContractFeatures: () => Feature[];
    updateContractFeatures: (selectedKeys: Feature[], featureGroupKeys: Feature[]) => void;
};

export const createContractSlice: StateCreator<Store, [], [], ContractStore> = (set, get) => ({
    contractConfig: defaultContract,
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
});
