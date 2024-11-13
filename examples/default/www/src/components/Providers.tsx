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
import patchworkConfig from "../../../patchwork.config";
import type { AppRouter } from "../../../ponder/src/api";

/**
 * tRPC is used to communicate with Ponder with end-to-end type safety.
 */
const trpc = createTRPCReact<AppRouter>();

/**
 * React Query is used by both tRPC and by Wagmi/wallet libraries.
 */
const queryClient = new QueryClient();

/**
 * Wagmi config.
 * Update this to match your needs!
 */
const config = getDefaultConfig({
    appName: patchworkConfig.name,
    projectId: import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECTID, // Don't forget to update your env!
    chains: [patchworkConfig.networks[import.meta.env.VITE_NETWORK].chain],
    ssr: true,
  });
  
/**
 * Feel free to add any other providers you need to this component (tooltip providers, etc.)
 */
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
