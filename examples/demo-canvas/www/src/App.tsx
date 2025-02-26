import { Bubbles } from './components/Bubbles';
import { Canvas } from './components/Canvas';
import Header from './components/Header';
import { Minter } from './components/Minter';

function App() {
    return (
        <div className="w-full text-base p-8">
            <Header />
            <div className="flex w-full">
                <div className="w-2/3">
                    <Canvas />
                </div>
                <div className="w-1/3">
                    <Minter />
                    <Bubbles />
                </div>
            </div>
        </div>
    );
}

export default App;
