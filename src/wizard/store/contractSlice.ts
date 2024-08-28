import { Feature } from '@/types';
import _ from 'lodash';
import { StateCreator } from 'zustand';
import defaultContract from '../lib/defaultContract';
import { UContractConfig } from '../types';
import { ContractSlice, StoreSlices } from './types';

export const createContractSlice: StateCreator<StoreSlices, [], [], ContractSlice> = (set, get) => ({
    contractConfig: defaultContract,
    getContractConfig: () => {
        return {
            ...get().contractsConfig.find((config) => config._uid === get().editor)!,
            scopeName: get().scopeConfig.name,
        };
    },
    updateContractConfig: (newConfig: UContractConfig) => {
        set({
            contractsConfig: get().contractsConfig.map((config) => {
                if (config._uid === get().editor) {
                    return newConfig;
                }
                return config;
            }),
        });
    },
    getContractFeatures: () => {
        return get().contractsConfig.find((config) => config._uid === get().editor)?.features ?? [];
    },
    updateContractFeatures: (selectedKeys: Feature[], featureGroupKeys: Feature[]) => {
        set({
            contractsConfig: get().contractsConfig.map((config) => {
                if (config._uid === get().editor) {
                    // Get current feature list
                    const features = _.uniq(_.clone(config.features) ?? []);
                    // Remove all keys belonging to the current feature group
                    _.pull(features, ...featureGroupKeys);
                    // Add new features for the group
                    features.push(...selectedKeys);
                    return {
                        ...config,
                        features: _.uniq(features),
                    };
                }
                return config;
            }),
        });
    },
});
