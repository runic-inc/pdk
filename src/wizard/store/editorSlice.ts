import { StateCreator } from 'zustand';
import defaultContract from '../lib/defaultContract';
import { EditorSlice, StoreSlices } from './types';

export const createEditorSlice: StateCreator<StoreSlices, [], [], EditorSlice> = (set, get) => ({
    editor: defaultContract._uid,
    setEditor: (id: string | null) => set({ editor: id }),
});
