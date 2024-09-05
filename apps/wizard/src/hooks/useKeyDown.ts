import { useEffect, useRef } from 'react';

export const useKeyDown = (callback: () => void, keys: (string | string[])[], elementSelector?: string) => {
    const keysPressed = useRef(new Set<string>());

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (elementSelector && document.activeElement !== document.querySelector(elementSelector)) {
                return;
            }

            keysPressed.current.add(event.key);

            const keysMatch = keys.every((key) => {
                return !Array.isArray(key) ? keysPressed.current.has(key) : key.some((k) => keysPressed.current.has(k));
            });
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
