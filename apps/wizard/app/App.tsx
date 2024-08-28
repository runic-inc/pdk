import { TooltipProvider } from '@/wizard/primitives/tooltip';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';

const App = () => {
    return (
        <ThemeProvider defaultTheme='light'>
            <TooltipProvider>
                <Layout />
            </TooltipProvider>
        </ThemeProvider>
    );
};

export default App;
