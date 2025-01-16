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

    return {
        name: config.name,
        scopes: config.scopes,
        contracts: config.contracts,
        networks: networks,
        plugins: plugins,
    };
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
