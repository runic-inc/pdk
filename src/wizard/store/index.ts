import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContractSlice } from './contractSlice';
import { createEditorSlice } from './editorSlice';
import { createProjectSlice } from './projectSlice';
import { ContractSlice, EditorSlice, ProjectSlice } from './types';

const useStore = create<EditorSlice & ProjectSlice & ContractSlice>()(
    persist(
        (...f) => ({
            ...createEditorSlice(...f),
            ...createProjectSlice(...f),
            ...createContractSlice(...f),
        }),
        {
            name: 'wizard-store',
        },
    ),
);

export default useStore;

// computed selector hooks
export const useConfig = () => useStore((state) => state.getContractConfig());
