'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './utils/trpc';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_SYNC_API_URL}/trpc`,
          transformer: superjson,
          // You can pass any HTTP headers you wish here
          // async headers() {
          //     return {
          //         // authorization: getAuthCookie(),
          //     };
          // },
        }),
      ],
    }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
