import projectConfig from '#/patchwork.config';
import { trpc, useTrpcClient } from '@/generated/lib/trpc';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

/**
 * React Query is used by both tRPC and by Wagmi/wallet libraries.
 */
const queryClient = new QueryClient();

/**
 * Wagmi config.
 * Update this to match your needs!
 */
const config = getDefaultConfig({
    appName: projectConfig.name,
    projectId: import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECTID, // Don't forget to update your env!
    chains: [projectConfig.networks![import.meta.env.VITE_NETWORK].chain],
    ssr: true,
});

/**
 * Feel free to add any other providers you need to this component (tooltip providers, etc.)
 */
function Providers(props: { children: ReactNode }) {
    const trpcClient = useTrpcClient();
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>{props.children}</RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </trpc.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Providers };
