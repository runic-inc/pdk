import { Effect } from 'effect';
import { UnknownException } from 'effect/Cause';

export type PatchworkEventBus = {
    emit: (event: string, payload: unknown) => Promise<void>;
    after: (event: string, handler: (payload: unknown) => Promise<void>) => void;
};

export const initPatchworkEventBus = (): PatchworkEventBus => {
    const handlers: Record<string, Array<(payload: unknown) => Effect.Effect<void, UnknownException>>> = {};

    return {
        emit: async (event, payload) => {
            const eventHandlers = handlers[event] || [];
            await Promise.all(eventHandlers.map((handler) => Effect.runPromise(handler(payload))));
        },

        after: (event, handler) => {
            if (!handlers[event]) handlers[event] = [];
            const wrappedHandler = (payload: unknown) => Effect.tryPromise(() => handler(payload));
            handlers[event].push(wrappedHandler);
        },
    };
};

export const patchwork = initPatchworkEventBus();
