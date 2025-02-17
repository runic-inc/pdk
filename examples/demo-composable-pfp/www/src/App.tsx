import { useAccount } from 'wagmi';
import Header from './components/Header';
import { useWriteCharacterTraitsMintBatch } from './generated/hooks/wagmi';
import { useRef } from 'react';
import { useDropDetection } from './hooks/useDropDetection';
import { TraitCollector } from './components/TraitCollector';
import { TraitImage } from './components/TraitImage';
import { TraitBar } from './components/TraitBar';
import { traits } from '../../assets/traits';

function App() {
    const container = useRef<HTMLDivElement>(null);
    const { address } = useAccount();
    const { writeContract } = useWriteCharacterTraitsMintBatch();

    const dropZoneRef = useRef<HTMLDivElement>(null);
    const { droppedItems, handleDragEnd, handlePositionUpdate, itemOverDropZone } = useDropDetection({
        onDrop: (itemId) => {
            console.log('Item dropped:', itemId);
        },
    });

    return (
        <div id='wrapper'>
            <div className='w-full h-full relative flex flex-col items-center justify-center' ref={container}>
                <Header />

                <div className='m-auto p-4 w-80 rounded-2xl flex flex-col items-center gap-2 bg-white shadow-xl shadow-gray-200 border border-black'>
                    <TraitCollector
                        ref={dropZoneRef}
                        droppedItems={droppedItems}
                        targeted={Object.values(itemOverDropZone).some(Boolean)}
                    />

                    <TraitBar />

                    <button className='rounded-xl w-full py-2.5 font-bold bg-black text-white'>Mint this PFP</button>
                </div>

                {Object.values(traits).map((trait) => (
                    <TraitImage
                        key={trait.id}
                        item={trait}
                        onDragEnd={handleDragEnd}
                        onPositionUpdate={handlePositionUpdate}
                        dropZoneRef={dropZoneRef}
                        containerRef={container}
                    />
                ))}

                <button
                    className='rounded text-white bg-blue-500 font-medium px-2 py-1 hiddenn'
                    onClick={() =>
                        writeContract({
                            args: [address!, address!, 4n],
                        })
                    }
                >
                    Mint traits
                </button>
            </div>
        </div>
    );
}

export default App;
