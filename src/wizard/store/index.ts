import { create } from 'zustand';
import { ContractConfig, ScopeConfig } from '@/types';
import defaultContract from '@/wizard/lib/defaultContract';
import defaultScope from '@/wizard/lib/defaultScope';
import { nanoid } from 'nanoid';

type EditorState = {
    scopeConfig: ScopeConfig;
    updateScopeConfig: (config: ScopeConfig) => void;
    contractsConfig: ContractConfig[];
    contractConfig: ContractConfig;
    editor: string | null;
    getContractConfig: () => ContractConfig | undefined;
    setEditor: (id: string | null) => void;
    addNewContract: () => string;
    updateContractConfig: (newConfig: ContractConfig) => void;
};

const useStore = create<EditorState>()((set, get) => ({
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
    updateContractConfig: (newConfig: ContractConfig) => {
        set({
            contractsConfig: get().contractsConfig.map((config) => {
                if (config._uid === get().editor) {
                    return newConfig;
                }
                return config;
            }),
        });
    },
}));

export default useStore;

// computed selector hooks
export const useConfig = () => useStore((state) => state.getContractConfig());
