import { create } from 'zustand';
import { ContractConfig } from '@/types';
import contractConfig from '@/wizard/lib/defaultContract';

type EditorState = {
    contractConfig: ContractConfig;
    updateContractConfig: (newConfig: ContractConfig) => void;
};

const useStore = create<EditorState>()((set, get) => ({
    contractConfig,
    updateContractConfig: (newConfig: ContractConfig) => {
        set({ contractConfig: newConfig });
    },
}));

export default useStore;
