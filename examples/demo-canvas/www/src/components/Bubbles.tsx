import { useBubbleGetPaginated } from "@/generated/hooks/trpc";
import { useAccount } from 'wagmi';

export function Bubbles() {

    const { address } = useAccount();

    const { data: bubbleData } = useBubbleGetPaginated({ sortDir: 'desc', owner: address });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-center">Your Bubble NFTs</h1>
            <div className="flex flex-wrap items-start justify-start w-full h-full gap-2 p-4">
                {bubbleData?.items.map((bubble) => (
                    <div key={bubble.id} className="w-[120px] h-[160px] flex flex-col items-center">
                        <div className="w-[120px] h-[120px] flex items-center justify-center">
                            <img
                                className="w-full h-full object-contain p-[5px]"
                                src={`http://localhost:42069/assets/images/bubbles/${bubble.tokenId}.png`}
                            />
                        </div>
                        <p className="text-sm mt-2">Token ID: {bubble.tokenId.toString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}