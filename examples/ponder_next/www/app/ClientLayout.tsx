'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from '../generated/utils/trpc';

export default function ClientLayout({
    children,
    apiUrl,
}: Readonly<{
    children: React.ReactNode;
    apiUrl: string;
}>) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${apiUrl}/trpc`,
                    transformer: superjson,
                }),
            ],
        }),
    );

    return <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>;
}
