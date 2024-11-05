"use client";

import { getConfig } from "@/generated/utils/wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { type State, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { trpc } from "../generated/utils/trpc";

export default function ClientLayout({
	children,
	apiUrl,
	initialState,
}: Readonly<{
	children: React.ReactNode;
	apiUrl: string;
	initialState?: State;
}>) {
	const [wagmiConfig] = useState(() => getConfig());
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

	return (
		<WagmiProvider config={wagmiConfig} initialState={initialState}>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<OnchainKitProvider
						apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
						chain={base}
					>
						{children}
					</OnchainKitProvider>
				</QueryClientProvider>
			</trpc.Provider>
		</WagmiProvider>
	);
}
