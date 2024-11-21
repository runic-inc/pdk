import type { AppRouter } from '#/ponder/src/api';
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
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: import.meta.env.VITE_PUBLIC_PONDER_URL,
                }),
            ],
        }),
    );

    return trpcClient;
}

export { trpc, useTrpcClient };
