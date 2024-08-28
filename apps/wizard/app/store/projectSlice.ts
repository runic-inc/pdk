import { ScopeConfig } from '@/types';
import defaultScope from '@/wizard/lib/defaultScope';
import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import defaultContract from '../lib/defaultContract';
import { UContractConfig } from '../types';
import { ProjectSlice, StoreSlices } from './types';

export const createProjectSlice: StateCreator<StoreSlices, [], [], ProjectSlice> = (set, get) => ({
    scopeConfig: defaultScope,
    updateScopeConfig: (config: ScopeConfig) => set({ scopeConfig: config }),
    contractsConfig: [defaultContract],
    updateContractsConfig: (newConfigs: UContractConfig[]) => set({ contractsConfig: newConfigs }),
    addNewContract: () => {
        const id = nanoid();
        set({
            contractsConfig: [
                ...get().contractsConfig,
                {
                    ...defaultContract,
                    _uid: id,
                    name: 'New Contract ' + (get().contractsConfig.length + 1),
                },
            ],
        });
        return id;
    },
    deleteContract: (id: string) => {
        // get index of current contract
        if (get().editor === id) {
            const index = get().contractsConfig.findIndex((config) => config._uid === id);
            const newEditor = get().contractsConfig[index - 1]?._uid || get().contractsConfig[index + 1]?._uid || null;
            set({ editor: newEditor });
        }
        set({
            contractsConfig: get().contractsConfig.filter((config) => config._uid !== id),
        });
    },
});
