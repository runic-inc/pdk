import { ScopeConfig } from '@/types';
import defaultScope from '@/wizard/lib/defaultScope';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { Store } from '.';
import defaultContract from '../lib/defaultContract';
import { UContractConfig } from '../types';

type ContractRecords = Record<string, UContractConfig>;

export type ProjectStore = {
    scopeConfig: ScopeConfig;
    updateScopeConfig: (config: ScopeConfig) => void;
    contractsConfig: ContractRecords;
    updateContractsConfig: (newConfigs: ContractRecords) => void;
    contractsOrder: string[];
    updateContractsOrder: (order: string[]) => void;
    addNewContract: () => string;
    deleteContract: (id: string) => void;
};

export const createProjectSlice: StateCreator<Store, [], [], ProjectStore> = (set, get) => ({
    scopeConfig: defaultScope,
    updateScopeConfig: (config: ScopeConfig) => set({ scopeConfig: config }),
    contractsConfig: {
        [defaultContract._uid]: defaultContract,
    },
    updateContractsConfig: (newConfigs: ContractRecords) => set({ contractsConfig: newConfigs }),
    contractsOrder: [defaultContract._uid],
    updateContractsOrder: (order: string[]) => set({ contractsOrder: order }),
    addNewContract: () => {
        const id = nanoid();
        set(
            produce((store: Store) => {
                store.contractsConfig[id] = {
                    ...defaultContract,
                    _uid: id,
                    name: 'New Contract ' + (store.contractsOrder.length + 1),
                };
                store.contractsOrder.push(id);
            }),
        );
        return id;
    },
    deleteContract: (id: string) => {
        // get index of current contract
        set(
            produce((store: Store) => {
                const index = store.contractsOrder.indexOf(id);
                if (store.editor === id) {
                    const newEditor = store.contractsOrder[index - 1] ?? store.contractsOrder[index + 1] ?? null;
                    store.editor = newEditor;
                }
                store.contractsOrder.splice(index, 1);
                delete store.contractsConfig[id];
            }),
        );
    },
});
