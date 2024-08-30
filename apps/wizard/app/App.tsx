import { TooltipProvider } from '@/wizard/primitives/tooltip';
import { EditorProvider } from './components/EditorProvider';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';

const App = () => {
    return (
        <ThemeProvider defaultTheme='light'>
            <TooltipProvider>
                <EditorProvider>
                    <Layout />
                </EditorProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
};

export default App;
