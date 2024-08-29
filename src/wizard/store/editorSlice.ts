import { StateCreator } from 'zustand';
import { Store } from '.';
import defaultContract from '../lib/defaultContract';

export type EditorStore = {
    editor: string | null;
    setEditor: (id: string | null) => void;
};

export const createEditorSlice: StateCreator<Store, [], [], EditorStore> = (set, get) => ({
    editor: defaultContract._uid,
    setEditor: (id: string | null) => set({ editor: id }),
});
