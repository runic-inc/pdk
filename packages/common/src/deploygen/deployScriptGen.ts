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

        // Define the DeploymentInfo struct to include bytecode
        script += `struct DeploymentInfo {\n`;
        script += `    address deployedAddress;\n`;
        script += `    bytes32 bytecodeHash;\n`;
        script += `}\n\n`;

        // Define the DeploymentAddresses struct with extended info
        script += `struct DeploymentAddresses {\n`;
        contractNames.forEach((name) => {
            script += `    DeploymentInfo ${name};\n`;
        });
        script += `}\n\n`;

        // Main contract
        const mainContractName = projectConfig.name.replace(/\s/g, '');
        script += `contract ${mainContractName}Deploy is Script {\n`;
        script += `    function run() external returns (DeploymentAddresses memory) {\n`;

        script += `        address ownerAddress = vm.envAddress("OWNER");\n`;
        script += `        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");\n`;
        script += `        bytes32 salt = bytes32(vm.envOr("DEPLOY_SALT", uint256(0)));\n`;
        script += `        bool bytecodeOnly = vm.envOr("BYTECODE_ONLY", false);\n\n`;

        // Add Create2Deployer address constant
        script += `        address create2DeployerAddress = 0x4e59b44847b379578588920cA78FbF26c0B4956C;\n\n`;

        script += `        console.log("Deployer starting");\n`;
        script += `        console.log("owner: ", ownerAddress);\n`;
        script += `        console.log("patchwork protocol: ", ppAddress);\n`;
        script += `        console.log("deployment salt: ", vm.toString(salt));\n`;
        script += `        console.log("bytecode only mode: ", bytecodeOnly);\n\n`;

        script += `        DeploymentAddresses memory deployments;\n\n`;

        // Calculate bytecode hashes and predicted addresses for all contracts
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractKeyName = key.toLowerCase();
            const contractConfig = value as ContractConfig;
            const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);

            script += `        bytes memory ${contractKeyName}CreationCode = type(${contractName}).creationCode;\n`;
            script += `        bytes memory ${contractKeyName}CreationBytecode = abi.encodePacked(${contractKeyName}CreationCode, abi.encode(ppAddress, ownerAddress));\n`;
            script += `        bytes32 ${contractKeyName}BytecodeHash = keccak256(${contractKeyName}CreationBytecode);\n`;
            script += `        console.log("${contractName} codehash: ", Strings.toHexString(uint256(${contractKeyName}BytecodeHash)));\n\n`;
            
            // Add predicted address calculation
            script += `        address predicted${contractName}Address = vm.computeCreate2Address(\n`;
            script += `            salt,\n`;
            script += `            ${contractKeyName}BytecodeHash,\n`;
            script += `            create2DeployerAddress\n`;
            script += `        );\n`;
            script += `        console.log("Predicted ${contractName} address: ", predicted${contractName}Address);\n\n`;
            
            script += `        deployments.${key} = DeploymentInfo({\n`;
            script += `            deployedAddress: predicted${contractName}Address,\n`;
            script += `            bytecodeHash: ${contractKeyName}BytecodeHash\n`;
            script += `        });\n\n`;
        });

        script += `        if (!bytecodeOnly) {\n`;
        script += `            vm.startBroadcast();\n`;
        script += `            PatchworkProtocol pp = PatchworkProtocol(ppAddress);\n\n`;

        // Scope configuration (inside if block)
        for (const scopeConfig of projectConfig.scopes) {
            script += `            if (pp.getScopeOwner("${scopeConfig.name}") == address(0)) {\n`;
            script += `                pp.claimScope("${scopeConfig.name}");\n`;
            script += `                pp.setScopeRules("${scopeConfig.name}", false, false, true);\n`;
            script += `            }\n`;
        }

        // Deploy contracts using CREATE2 (inside if block)
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractKeyName = key.toLowerCase();
            const contractConfig = value as ContractConfig;
            const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);

            script += `            ${contractName} ${contractKeyName} = new ${contractName}{salt: salt}(ppAddress, ownerAddress);\n`;
            script += `            assert(address(${contractKeyName}) == predicted${contractName}Address); // Verify prediction\n`;
            script += `            console.log("${contractName} deployed at: ", address(${contractKeyName}));\n`;
            script += `            deployments.${key}.deployedAddress = address(${contractKeyName});\n\n`;
        });

        // Register references (inside if block)
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractName = key;
            if (projectConfig.contractRelations !== undefined) {
                for (const fragment of projectConfig.contractRelations[key]?.fragments || []) {
                    script += `            ${contractName.toLowerCase()}.registerReferenceAddress(address(${fragment.toLowerCase()}));\n`;
                }
            }
        });

        // Whitelist (inside if block)
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractName = key;
            const contractConfig = value as ContractConfig;
            const scopeName = contractConfig.scopeName;
            const scopeConfig = this.findScope(scopeName, projectConfig);
            if (scopeConfig.whitelist) {
                script += `            pp.addWhitelist("${scopeName}", address(${contractName.toLowerCase()}));\n`;
            }
        });

        script += `            vm.stopBroadcast();\n`;
        script += `        }\n\n`;

        // Return the deployment addresses and bytecode hashes
        script += `        return deployments;\n`;
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