import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createContractSlice, type ContractStore } from './contractSlice';
import { createEditorSlice, type EditorStore } from './editorSlice';
import { createProjectSlice, type ProjectStore } from './projectSlice';

enableMapSet();

export type Store = EditorStore & ContractStore & ProjectStore;

const useStore = create<Store>()(
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
