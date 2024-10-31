import { cleanAndCapitalizeFirstLetter } from '../codegen/utils';
import { ContractConfig, ProjectConfig, ScopeConfig } from '../types';

export class DeployScriptGen {
    constructor() {}

    gen(projectConfig: ProjectConfig, contractsDir: string | undefined): string {
        if (contractsDir === undefined) {
            contractsDir = './';
        } else {
            contractsDir = contractsDir + '/';
        }

        const contractNames = Object.keys(projectConfig.contracts);

        // Start building the script
        let script = `// SPDX-License-Identifier: UNLICENSED\n`;
        script += `pragma solidity ^0.8.13;\n\n`;
        script += `import "forge-std/Script.sol";\n`;
        script += `import "forge-std/console.sol";\n`;

        // Import contracts
        Object.values(projectConfig.contracts).forEach((value: string | ContractConfig) => {
            if (typeof value === 'string') {
                throw new Error('DeployScriptGen requires fully loaded contract config');
            } else {
                const contractConfig = value as ContractConfig;
                const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);
                script += `import "${contractsDir}${contractName}.sol";\n`;
            }
        });
        script += `import "@patchwork/PatchworkProtocol.sol";\n\n`;

        // Define the DeploymentAddresses struct
        script += `struct DeploymentAddresses {\n`;
        contractNames.forEach((name) => {
            script += `    address ${name};\n`;
        });
        script += `}\n\n`;

        // Main contract
        const mainContractName = projectConfig.name.replace(/\s/g, '');
        script += `contract ${mainContractName}Deploy is Script {\n`;
        script += `    function run() external returns (DeploymentAddresses memory) {\n`;

        script += `        address ownerAddress = vm.envAddress("OWNER");\n`;
        script += `        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");\n`;
        script += `        console.log("Deployer starting");\n`;
        script += `        console.log("owner: ", ownerAddress);\n`;
        script += `        console.log("patchwork protocol: ", ppAddress);\n\n`;

        script += `        vm.startBroadcast();\n`;
        script += `        PatchworkProtocol pp = PatchworkProtocol(ppAddress);\n`;

        // Scope configuration
        for (const scopeConfig of projectConfig.scopes) {
            script += `        if (pp.getScopeOwner("${scopeConfig.name}") == address(0)) {\n`;
            script += `            pp.claimScope("${scopeConfig.name}");\n`;
            script += `            pp.setScopeRules("${scopeConfig.name}", false, false, true);\n`;
            script += `        }\n`;
        }

        // Deploy contracts
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractKeyName = key.toLowerCase();
            const contractConfig = value as ContractConfig;
            const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);
            script += `        ${contractName} ${contractKeyName} = new ${contractName}(ppAddress, ownerAddress);\n`;
        });

        // Register references
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractName = key;
            if (projectConfig.contractRelations !== undefined) {
                for (const fragment of projectConfig.contractRelations[key]?.fragments || []) {
                    script += `        ${contractName.toLowerCase()}.registerReferenceAddress(address(${fragment.toLowerCase()}));\n`;
                }
            }
        });

        // Whitelist
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractName = key;
            const contractConfig = value as ContractConfig;
            const scopeName = contractConfig.scopeName;
            const scopeConfig = this.findScope(scopeName, projectConfig);
            if (scopeConfig.whitelist) {
                script += `        pp.addWhitelist("${scopeName}", address(${contractName.toLowerCase()}));\n`;
            }
        });

        script += `        vm.stopBroadcast();\n\n`;

        // Return the deployment addresses
        script += `        return DeploymentAddresses({\n`;
        contractNames.forEach((name, index) => {
            const isLast = index === contractNames.length - 1;
            script += `            ${name}: address(${name.toLowerCase()})${isLast ? '' : ','}\n`;
        });
        script += `        });\n`;

        script += `    }\n`;
        script += `}\n`;

        return script;
    }

    findScope(scopeName: string, projectConfig: ProjectConfig): ScopeConfig {
        for (const scopeConfig of projectConfig.scopes) {
            if (scopeConfig.name === scopeName) {
                return scopeConfig;
            }
        }
        throw new Error(`Scope ${scopeName} not found in project config`);
    }
}
