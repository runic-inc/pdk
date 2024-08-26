import { useEffect, useRef } from 'react';

export const useKeyDown = (callback: () => void, keys: string[]) => {
    const keysPressed = useRef(new Set<string>());

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            keysPressed.current.add(event.key);

            const keysMatch = keys.every((key) => keysPressed.current.has(key));
            if (keysMatch) {
                event.preventDefault();
                callback();
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            keysPressed.current.delete(event.key);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [keys, callback]);
};
