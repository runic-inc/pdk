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

function isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
}

// Checks if string is an Ethereum address
function isEthereumAddress(str: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(str);
}

export function validatePatchworkProject(project: PatchworkProject): void {
    // Get all valid contract keys
    const contractKeys = Object.keys(project.contracts);

    // Validate project name is alphanumeric
    if (!isAlphanumeric(project.name)) {
        throw new Error(`Invalid project name "${project.name}": project name must contain only alphanumeric characters`);
    }

    // Validate scope references to contracts
    project.scopes.forEach((scope) => {
        // Validate bankers
        if (scope.bankers) {
            scope.bankers.forEach((banker) => {
                if (!isEthereumAddress(banker) && !contractKeys.includes(banker)) {
                    throw new Error(`Invalid banker reference "${banker}" in scope "${scope.name}": must be an Ethereum address or a valid contract key`);
                }
            });
        }

        // Validate operators
        if (scope.operators) {
            scope.operators.forEach((operator) => {
                if (!isEthereumAddress(operator) && !contractKeys.includes(operator)) {
                    throw new Error(`Invalid operator reference "${operator}" in scope "${scope.name}": must be an Ethereum address or a valid contract key`);
                }
            });
        }
    });

    // Validate contracts
    Object.entries(project.contracts).forEach(([contractKey, contractConfig]) => {
        // Skip validation for string references
        if (typeof contractConfig !== 'object') return;

        // Validate contract name is alphanumeric
        if (!isAlphanumeric(contractConfig.name)) {
            throw new Error(`Invalid contract name "${contractConfig.name}": contract name must contain only alphanumeric characters`);
        }

        // Validate contract key matches contract name
        if (contractKey !== contractConfig.name) {
            throw new Error(
                `Contract key mismatch: the key "${contractKey}" must match the contract name "${contractConfig.name}". Please update either the contract key or the name field to match.`,
            );
        }

        // Validate fragments
        if (contractConfig.fragments) {
            contractConfig.fragments.forEach((fragment) => {
                if (!contractKeys.includes(fragment)) {
                    throw new Error(`Invalid fragment reference "${fragment}" in contract "${contractConfig.name}": must be a valid contract key`);
                }
            });
        }

        // Validate that no field key is exactly a reserved word
        contractConfig.fields.forEach((field) => {
            RESERVED_WORDS.forEach((reserved) => {
                if (field.key === reserved) {
                    throw new Error(
                        `Invalid field key "${field.key}" in contract "${contractConfig.name}": field keys cannot be exactly the reserved word "${reserved}".`,
                    );
                }
            });
        });

        // Validate duplicate field keys
        const keys = contractConfig.fields.map((field) => field.key);
        const uniqueKeys = new Set(keys);
        if (uniqueKeys.size !== keys.length) {
            throw new Error(`Duplicate field keys found in contract "${contractConfig.name}".`);
        }

        // Validate duplicate field IDs
        const fieldIds = contractConfig.fields.map((field) => field.id);
        const uniqueIds = new Set(fieldIds);
        if (uniqueIds.size !== fieldIds.length) {
            throw new Error(`Duplicate field IDs found in contract "${contractConfig.name}".`);
        }
    });
}
