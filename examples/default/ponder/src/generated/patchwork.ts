import { EventNames, IndexingFunctionArgs } from '@/generated';
import { Effect } from 'effect';
import { UnknownException } from 'effect/Cause';

export type PatchworkEventBus = {
    emit: <T extends EventNames>(event: T, payload: IndexingFunctionArgs<T>) => Promise<void>;
    after: <T extends EventNames>(event: T, handler: (payload: IndexingFunctionArgs<T>) => Promise<void>) => void;
};

export const initPatchworkEventBus = (): PatchworkEventBus => {
    const handlers: {
        [T in EventNames]?: Array<(payload: IndexingFunctionArgs<T>) => Effect.Effect<void, UnknownException>>;
    } = {};

    return {
        emit: async <T extends EventNames>(event: T, payload: IndexingFunctionArgs<T>) => {
            const eventHandlers = handlers[event] || [];
            await Promise.all(eventHandlers.map((handler) => Effect.runPromise(handler(payload))));
        },

        after: <T extends EventNames>(event: T, handler: (payload: IndexingFunctionArgs<T>) => Promise<void>) => {
            if (!handlers[event]) handlers[event] = [];
            const wrappedHandler = (payload: IndexingFunctionArgs<T>) => Effect.tryPromise(() => handler(payload));
            handlers[event].push(wrappedHandler);
        },
    };
};

export const patchwork = initPatchworkEventBus();
