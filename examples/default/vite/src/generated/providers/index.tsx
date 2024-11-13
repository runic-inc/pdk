import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { base } from "@reown/appkit/networks";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import superjson from "superjson";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import type { AppRouter } from "../../../../ponder/src/api";
import { createTRPCReact } from "@trpc/react-query";

const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECTID;
const networks = [base];
const metadata = {
	name: "My App",
	description: "AppKit Example",
	url: "https://example.com",
	icons: ["https://example.com/icon.png"],
};
const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
	ssr: false,
});

createAppKit({
	adapters: [wagmiAdapter],
	networks,
	projectId,
	metadata,
	features: {
		email: false,
		socials: false,
	},
	themeVariables: {
		"--w3m-accent": "#000000",
	},
});

function Providers(props: {
	children: ReactNode;
	initialState?: State;
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
			<WagmiProvider config={wagmiAdapter.wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					{props.children}
				</QueryClientProvider>
			</WagmiProvider>
		</trpc.Provider>
	);
}

export { trpc, Providers };
