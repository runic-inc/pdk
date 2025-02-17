import { useCallback, useState } from 'react';

interface UseDropDetectionProps {
    onDrop?: (itemId: number) => void;
}

export function useDropDetection({ onDrop }: UseDropDetectionProps = {}) {
    const [itemOverDropZone, setItemOverDropZone] = useState<
        Record<string, boolean>
    >({});
    const [droppedItems, setDroppedItems] = useState<number[]>([]);

    const handleDragEnd = useCallback(
        (id: number) => {
            if (itemOverDropZone[id]) {
                setDroppedItems((prev) => {
                    if (!prev.includes(id)) {
                        onDrop?.(id);
                        return [...prev, id];
                    }
                    return prev;
                });
            }
        },
        [itemOverDropZone, onDrop],
    );

    const handlePositionUpdate = useCallback((id: number, isOver: boolean) => {
        setItemOverDropZone((prev) => {
            if (prev[id] === isOver) return prev;
            return { ...prev, [id]: isOver };
        });
    }, []);

    return {
        itemOverDropZone,
        droppedItems,
        handleDragEnd,
        handlePositionUpdate,
    };
}
