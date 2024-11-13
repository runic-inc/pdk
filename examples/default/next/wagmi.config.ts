import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
	out: "generated/hooks/wagmi.ts",
	plugins: [
		foundry({
			project: "../contracts",
		}),
	],
});
