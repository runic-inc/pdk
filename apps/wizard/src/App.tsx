import { EditorProvider } from './components/EditorProvider';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from './primitives/tooltip';

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
