import { trpc, useTrpcClient } from '@/generated/lib/trpc';
import {
	RainbowKitProvider,
	getDefaultConfig,
	lightTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { anvil } from 'viem/chains';
import { WagmiProvider } from 'wagmi';

/**
 * Wagmi config.
 * Update this to match your needs!
 */
const config = getDefaultConfig({
	appName: 'PFP',
	projectId: import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECTID, // Don't forget to update your env!
	chains: [anvil],
	ssr: true,
});

/**
 * Feel free to add any other providers you need to this component (tooltip providers, etc.)
 */
function Providers(props: { children: ReactNode }) {
	const { trpcClient, queryClient } = useTrpcClient();
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider
						theme={lightTheme({
							accentColor: '#000000',
						})}
					>
						{props.children}
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</trpc.Provider>
	);
}

export { Providers };
