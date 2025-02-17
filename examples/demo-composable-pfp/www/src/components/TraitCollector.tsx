import { RefObject } from 'react';

interface TraitCollectorProps {
    ref: RefObject<HTMLDivElement>;
    targeted: boolean;
    droppedItems: number[];
}

export function TraitCollector({
    ref,
    targeted,
    droppedItems,
}: TraitCollectorProps) {
    return (
        <div
            className={`rounded-full w-60 -mt-24 mb-4 p-2 border border-black bg-white aspect-square shadow-lg shadow-gray-200 transition-all duration-200 ${targeted ? ' scale-105 shadow-gray-300 ring-1 ring-black' : 'ring-1 ring-black/0'}`}
            ref={ref}
        >
            {!droppedItems.length ? (
                <div className='flex items-center justify-center h-full w-full rounded-full border border-dashed text-xl text-gray-400 font-light text-center'>
                    Hey.
                    <br />
                    Drop some traits...
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}
