import Header from './components/Header';

function App() {
    return (
        <div className='w-full text-base p-8'>
            <Header />
            <main className='text-gray-500 leading-relaxed m-auto max-w-prose text-lg h-[75vh] flex flex-col justify-center'>
                <p>
                    We've generated a few things to get you up and running with your new Patchwork app. The frontend uses Vite/React + TailwindCSS and comes
                    packaged with the latest RainbowKit and its dependencies for web3 interaction. We've also generated a bunch of hooks that'll be useful for
                    interacting with Ponder and your onchain contracts.
                </p>
            </main>
        </div>
    );
}

export default App;
