import { create } from 'zustand';
import { ScopeConfig } from '@/types';
import defaultContract from '@/wizard/lib/defaultContract';
import defaultScope from '@/wizard/lib/defaultScope';
import { nanoid } from 'nanoid';
import { UContractConfig } from '../types';
import { persist } from 'zustand/middleware';

type EditorState = {
    scopeConfig: ScopeConfig;
    updateScopeConfig: (config: ScopeConfig) => void;
    contractsConfig: UContractConfig[];
    contractConfig: UContractConfig;
    editor: string | null;
    getContractConfig: () => UContractConfig | undefined;
    setEditor: (id: string | null) => void;
    addNewContract: () => string;
    deleteContract: (id: string) => void;
    updateContractConfig: (newConfig: UContractConfig) => void;
    updateContractsConfig: (newConfigs: UContractConfig[]) => void;
};

const useStore = create<EditorState>()(
    persist(
        (set, get) => ({
            scopeConfig: defaultScope,
            updateScopeConfig: (config: ScopeConfig) => set({ scopeConfig: config }),
            contractsConfig: [defaultContract],
            editor: defaultContract._uid,
            contractConfig: defaultContract,
            getContractConfig: () => {
                return {
                    ...get().contractsConfig.find((config) => config._uid === get().editor)!,
                    scopeName: get().scopeConfig.name,
                };
            },
            setEditor: (id: string | null) => set({ editor: id }),
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
            updateContractsConfig: (newConfigs: UContractConfig[]) => set({ contractsConfig: newConfigs }),
        }),
        {
            name: 'wizard-store',
        },
    ),
);

export default useStore;

// computed selector hooks
export const useConfig = () => useStore((state) => state.getContractConfig());
