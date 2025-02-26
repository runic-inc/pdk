import { useBubbleGetPaginated } from '@/generated/hooks/trpc';

export function Canvas() {
    const { data: bubbleData } = useBubbleGetPaginated({
        limit: 1,
        sortDir: 'desc',
    });

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <img
                className="p-[5px]"
                src={`http://localhost:42069/assets/images/canvases/${bubbleData?.items[0]?.tokenId}.png`}
            />
        </div>
    );
}
