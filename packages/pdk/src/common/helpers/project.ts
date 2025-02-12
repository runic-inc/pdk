import { NetworkConfig, PluginConfig, ProjectConfig } from '@patchworkdev/common/types';
import { anvil, base, baseSepolia, Chain } from 'viem/chains';
import { ponder, react } from '../../plugins';
import { Network, PatchworkProject, PDKPlugin } from '../../types';

export function importProjectConfig(config: ProjectConfig): PatchworkProject {
    const plugins: PDKPlugin[] = config.plugins?.map((pluginConfig) => loadPlugin(pluginConfig)) || [];
    const networks: Record<'local' | 'testnet' | 'mainnet', Network> = {
        local: {
            chain: anvil,
            rpc: 'http://anvil:8545',
        },
        testnet: {
            chain: baseSepolia,
            rpc: 'http://anvil:8545',
        },
        mainnet: {
            chain: base,
            rpc: 'http://anvil:8545',
        },
    };
    // Will return sane defaults if nothing specified
    if (config.networks) {
        for (const [key, networkConfig] of Object.entries(config.networks)) {
            if (key !== 'local' && key !== 'testnet' && key !== 'mainnet') {
                throw new Error(`Invalid network key: ${key}. Must be one of 'local', 'testnet', or 'mainnet'`);
            }
            networks[key] = loadNetwork(networkConfig);
        }
    }
    const project: PatchworkProject = {
        name: config.name,
        scopes: config.scopes,
        contracts: config.contracts,
        networks: networks,
        plugins: plugins,
    };

    validatePatchworkProject(project);

    return project;
}

export function exportProjectConfig(config: PatchworkProject): ProjectConfig {
    const plugins: PluginConfig[] = config.plugins.map((plugin) => {
        return { name: plugin.name, props: plugin.configProps };
    });

    const networks: Record<'local' | 'testnet' | 'mainnet', NetworkConfig> = {
        local: { chain: config.networks?.local.chain.name || '', rpc: config.networks?.local.rpc || '' },
        testnet: { chain: config.networks?.testnet.chain.name || '', rpc: config.networks?.testnet.rpc || '' },
        mainnet: { chain: config.networks?.mainnet.chain.name || '', rpc: config.networks?.mainnet.rpc || '' },
    };

    return {
        name: config.name,
        scopes: config.scopes,
        contracts: config.contracts,
        networks: networks,
        plugins: plugins,
    };
}

function loadPlugin(config: PluginConfig): PDKPlugin {
    // TODO create a way to dynamically import plugins
    const pluginsMap: { [key: string]: PDKPlugin } = {
        ponder: ponder(config.props),
        react: react(config.props),
    };

    const plugin = pluginsMap[config.name];
    if (!plugin) {
        throw new Error(`Plugin ${config.name} not found`);
    }
    return plugin;
}

function loadNetwork(config: NetworkConfig): any {
    // TODO update with all supported chains
    const chainMap: { [key: string]: Chain } = {
        anvil: anvil,
        base: base,
        baseSepolia: baseSepolia,
    };

    const chain = chainMap[config.chain];
    if (!chain) {
        throw new Error(`Chain ${config.chain} not found`);
    }
    return { chain: chain, rpc: config.rpc };
}

const RESERVED_WORDS = ['metadata'];

function validatePatchworkProject(project: PatchworkProject): void {
    Object.entries(project.contracts).forEach(([contractKey, contractConfig]) => {
        // Skip validation if the contract configuration is just a string reference.
        if (typeof contractConfig !== 'object') return;

        // Validate reserved words for field keys.
        contractConfig.fields.forEach((field) => {
            RESERVED_WORDS.forEach((reserved) => {
                if (field.key === reserved) {
                    throw new Error(
                        `Invalid field key "${field.key}" in contract "${contractConfig.name}": field keys cannot be exactly the reserved word "${reserved}".`,
                    );
                }
            });
        });

        // Validate field IDs: must have no duplicates, start at 0, and have no gaps.
        const fieldIds = contractConfig.fields.map((field) => field.id);
        const uniqueIds = new Set(fieldIds);
        if (uniqueIds.size !== fieldIds.length) {
            throw new Error(`Duplicate field IDs found in contract "${contractConfig.name}".`);
        }

        // The fields don't need to be in order, so sort and check the sequence.
        const sortedIds = [...uniqueIds].sort((a, b) => a - b);
        for (let i = 0; i < sortedIds.length; i++) {
            if (sortedIds[i] !== i) {
                // If the smallest id isn't 0, or any gap exists, report an error.
                const errMsg =
                    sortedIds[0] !== 0
                        ? `Field IDs for contract "${contractConfig.name}" must start at 0.`
                        : `Field IDs for contract "${contractConfig.name}" must be sequential with no gaps.`;
                throw new Error(errMsg);
            }
        }
    });
}
