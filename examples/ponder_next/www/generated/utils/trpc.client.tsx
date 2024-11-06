'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { type AppRouter } from '../../sync/src/api';
import { getQueryClient } from './queryclient';

const trpc = createTRPCReact<AppRouter>();

function TRPCProvider(
    { children }: Readonly<{
        children: React.ReactNode;
    }>,
) {
    const queryClient = getQueryClient();
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                transformer: superjson,
                url: `/api/trpc`,
            }),
        ],
    }));

    return (
        <>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </trpc.Provider>
        </>
    );
}

export { trpc, TRPCProvider };
