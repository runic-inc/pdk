import { twMerge } from 'tailwind-merge';
import { useWriteBubbleMint } from "@/generated/hooks/wagmi";
import { useCanvasGetPaginated, useBubbleGetPaginated } from "@/generated/hooks/trpc";


export function Minter() {
    // Wagmi hook to call Forge (aka mint) on the Character contract
    const { writeContract, isPending, isSuccess } = useWriteBubbleMint();
    const { data: canvasData } = useCanvasGetPaginated({ limit: 1, sortDir: "asc" });
    const { data: bubbleData } = useBubbleGetPaginated({ limit: 1, sortDir: "desc" });

    const handleMint = () => {
        console.log("we handling a mint yo", canvasData?.items[0]?.contractId, canvasData?.items[0]?.tokenId);
        writeContract({
            args: [canvasData?.items[0]?.contractId as `0x${string}`, canvasData?.items[0]?.tokenId.toString() as `0x${string}`]
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <button
                className={twMerge(
                    'rounded-xl w-full py-2.5 font-bold bg-black text-white',
                    (isPending &&
                        'opacity-50 bg-gray-500 pointer-events-none'))}
                onClick={handleMint}
            >
                {isPending ? 'Minting...' : 'Mint a Bubble'}
            </button>
        </div>
    );
}