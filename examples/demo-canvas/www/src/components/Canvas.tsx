import { useCanvasGetPaginated, useBubbleGetPaginated } from "@/generated/hooks/trpc";


export function Canvas() {
    const { data: canvasData } = useCanvasGetPaginated({ limit: 1, sortDir: "desc" });
    const { data: bubbleData } = useBubbleGetPaginated({ limit: 1, sortDir: "desc" });

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            canvas {canvasData?.items[0]?.id}<br />
            bubble {bubbleData?.items[0]?.id}<br />
        </div>
    );
}