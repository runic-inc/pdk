import Layout from './components/Layout';
import { TooltipProvider } from '@/wizard/primitives/tooltip';

const App = () => {
    return (
        <TooltipProvider>
            <Layout />
        </TooltipProvider>
    );
};

export default App;
