import { createContext, useContext } from 'react';
import useStore, { Store } from '../store';

const EditorProviderContext = createContext<string | null>(null);

export function EditorProvider({ children, ...props }: { children: React.ReactNode }) {
    const editor = useStore((state: Store) => state.editor);

    return (
        <EditorProviderContext.Provider {...props} value={editor}>
            {children}
        </EditorProviderContext.Provider>
    );
}

const useEditor = () => {
    const context = useContext(EditorProviderContext);

    if (context === undefined) throw new Error('useEditor must be used within EditorProvider');

    return context;
};
