import {
    RainbowKitProvider,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type ReactNode, useState } from "react";
import superjson from "superjson";
import { WagmiProvider } from "wagmi";
import { baseSepolia, } from 'wagmi/chains';
import patchworkConfig from "../../../../patchwork.config";
import type { AppRouter } from "../../../../ponder/src/api";

const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();

const config = getDefaultConfig({
    appName: patchworkConfig.name,
    projectId: import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECTID,
    chains: [baseSepolia],
    ssr: true,
  });


function Providers(props: {
	children: ReactNode;
}) {
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

	return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>
                        {props.children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
		</trpc.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Providers, trpc };

