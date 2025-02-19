/*
 * Directive needed to correctly infer all of our tRPC response types
 */
/// <reference types="../../../../ponder/ponder-env.d.ts" />

import type { AppRouter } from '#/ponder/src/api';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';

/*
 * tRPC is used to communicate with Ponder with end-to-end type safety
 */
const trpc = createTRPCReact<AppRouter>();

/*
 * Convenience hook to create a tRPC client
 */
function useTrpcClient() {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchInterval: 2000,
                        refetchOnWindowFocus: true,
                        refetchOnReconnect: true,
                        staleTime: 0,
                        gcTime: 1000 * 60 * 30,
                    },
                },
            }),
    );

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: import.meta.env.VITE_PUBLIC_PONDER_URL + '/trpc',
                }),
            ],
        }),
    );

    return { trpcClient, queryClient };
}

export { trpc, useTrpcClient };
