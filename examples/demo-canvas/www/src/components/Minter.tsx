import { useBubbleGetPaginated, useCanvasGetPaginated } from '@/generated/hooks/trpc';
import { useWriteBubbleMint } from '@/generated/hooks/wagmi';
import { twMerge } from 'tailwind-merge';
import { pad } from 'viem';
import { useAccount } from 'wagmi';

export function Minter() {
    const { address } = useAccount();
    const { writeContract, isPending, isSuccess, error } = useWriteBubbleMint();
    const { data: canvasData, isLoading } = useCanvasGetPaginated({ limit: 1, sortDir: 'asc' });
    const { data: bubbleData } = useBubbleGetPaginated({ limit: 1, sortDir: 'desc' });

    const handleMint = () => {
        console.log('canvas data', canvasData);
        console.log('we handling a mint yo', canvasData?.items[0]?.contractId, canvasData?.items[0]?.tokenId);
        const tokenId = pad(canvasData?.items[0]?.tokenId.toString() as `0x${string}`) as string;
        const contractAddress = canvasData?.items[0]?.contractId as `0x${string}`;
        const mintData = `${contractAddress}${tokenId.replace('0x', '')}`;
        console.log('mint data', mintData);
        writeContract({
            args: [address as `0x${string}`, mintData as `0x${string}`],
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <button
                className={twMerge(
                    'rounded-xl w-full py-2.5 font-bold bg-black text-white',
                    (isPending || isLoading) && 'opacity-50 bg-gray-500 pointer-events-none',
                )}
                onClick={handleMint}
            >
                {isPending ? 'Minting...' : 'Mint a Bubble'}
            </button>
            {error ? error.message : ''}
        </div>
    );
}
