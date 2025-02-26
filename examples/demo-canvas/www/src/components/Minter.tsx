import { useCanvasGetPaginated } from '@/generated/hooks/trpc';
import { useWriteBubbleMint } from '@/generated/hooks/wagmi';
import { twMerge } from 'tailwind-merge';
import { pad } from 'viem';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

export function Minter() {
    const { address } = useAccount();
    const {
        writeContract,
        isPending,
        error,
        data: hash,
    } = useWriteBubbleMint();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });
    const { data: canvasData, isLoading } = useCanvasGetPaginated(
        { limit: 1, sortDir: 'asc' },
        { enabled: true, refetchOnWindowFocus: false, refetchInterval: false },
    );

    const handleMint = async () => {
        const tokenId = pad(
            canvasData?.items[0]?.tokenId.toString() as `0x${string}`,
        ) as string;
        const contractAddress = canvasData?.items[0]
            ?.contractId as `0x${string}`;
        const mintData = `${contractAddress}${tokenId.replace('0x', '')}`;

        writeContract({
            args: [address as `0x${string}`, mintData as `0x${string}`],
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <button
                className={twMerge(
                    'rounded-xl w-full py-2.5 font-bold bg-black text-white',
                    (isPending || isLoading || isConfirming) &&
                        'opacity-50 bg-gray-500 pointer-events-none',
                )}
                onClick={handleMint}>
                {isPending ? 'Minting...' : 'Mint a Bubble'}
            </button>
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error ? error.message : ''}
        </div>
    );
}
