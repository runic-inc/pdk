import { create } from 'zustand';
import { ContractConfig } from '@/types';
import defaultConfig from '@/wizard/lib/defaultContract';
import { nanoid } from 'nanoid';

type EditorState = {
    contractsConfig: ContractConfig[];
    contractConfig: ContractConfig;
    editor: string | null;
    getContractConfig: () => ContractConfig | undefined;
    setEditor: (id: string | null) => void;
    addNewContract: () => void;
    updateContractConfig: (newConfig: ContractConfig) => void;
};

const useStore = create<EditorState>()((set, get) => ({
    contractsConfig: [defaultConfig],
    editor: defaultConfig._uid,
    contractConfig: defaultConfig,
    getContractConfig: () => get().contractsConfig.find((config) => config._uid === get().editor),
    setEditor: (id: string | null) => set({ editor: id }),
    addNewContract: () => {
        set({
            contractsConfig: [
                ...get().contractsConfig,
                {
                    ...defaultConfig,
                    _uid: nanoid(),
                    name: 'New Contract ' + (get().contractsConfig.length + 1),
                },
            ],
        });
    },
    updateContractConfig: (newConfig: ContractConfig) => {
        set({
            contractsConfig: get().contractsConfig.map((config) => {
                if (config._uid === get().editor) {
                    console.log('found', get().editor);
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
