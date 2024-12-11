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
        const mainContractName = projectConfig.name.replace(/\s/g, '');

        let script = this.generateHeader(contractNames, contractsDir, projectConfig);
        script += this.generateContractDefinition(mainContractName);
        script += this.generateStateVariables();
        script += this.generateRunFunction();
        script += this.generateHelperFunctions(projectConfig);
        script += this.generateDeploymentFunction(projectConfig);
        script += this.generateSetupFunction(projectConfig);
        script += "}\n"; // Close contract

        return script;
    }

    private generateHeader(contractNames: string[], contractsDir: string, projectConfig: ProjectConfig): string {
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

        // Define structs
        script += `struct DeploymentInfo {\n`;
        script += `    address deployedAddress;\n`;
        script += `    bytes32 bytecodeHash;\n`;
        script += `}\n\n`;

        script += `struct DeploymentAddresses {\n`;
        contractNames.forEach((name) => {
            script += `    DeploymentInfo ${name};\n`;
        });
        script += `}\n\n`;

        return script;
    }

    private generateContractDefinition(mainContractName: string): string {
        return `contract ${mainContractName}Deploy is Script {\n`;
    }

    private generateStateVariables(): string {
        let script = `    address private ownerAddress;\n`;
        script += `    address private ppAddress;\n`;
        script += `    bytes32 private salt;\n`;
        script += `    address private constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;\n\n`;
        return script;
    }

    private generateRunFunction(): string {
        let script = `    function run() external returns (DeploymentAddresses memory) {\n`;
        script += `        ownerAddress = vm.envAddress("OWNER");\n`;
        script += `        ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");\n`;
        script += `        salt = bytes32(vm.envOr("DEPLOY_SALT", uint256(0)));\n`;
        script += `        bool tryDeploy = vm.envOr("TRY_DEPLOY", false);\n\n`;
        script += `        logDeploymentInfo();\n\n`;
        script += `        DeploymentAddresses memory deployments;\n\n`;
        
        // We'll generate individual prepare calls for each contract
        script += `        deployments = prepareDeployments();\n\n`;
        script += `        if (tryDeploy) {\n`;
        script += `            performDeployment(deployments);\n`;
        script += `        }\n\n`;
        script += `        return deployments;\n`;
        script += `    }\n\n`;
        return script;
    }

    private generateHelperFunctions(projectConfig: ProjectConfig): string {
        let script = `    function logDeploymentInfo() private view {\n`;
        script += `        console.log("Deployer starting");\n`;
        script += `        console.log("owner: ", ownerAddress);\n`;
        script += `        console.log("patchwork protocol: ", ppAddress);\n`;
        script += `        console.log("deployment salt: ", vm.toString(salt));\n`;
        script += `    }\n\n`;

        // Generate prepareDeployments function
        script += `    function prepareDeployments() private view returns (DeploymentAddresses memory) {\n`;
        script += `        DeploymentAddresses memory deployments;\n\n`;
        
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractKeyName = key.toLowerCase();
            const contractConfig = value as ContractConfig;
            const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);

            script += `        bytes memory ${contractKeyName}CreationCode = type(${contractName}).creationCode;\n`;
            script += `        bytes memory ${contractKeyName}CreationBytecode = abi.encodePacked(${contractKeyName}CreationCode, abi.encode(ppAddress, ownerAddress));\n`;
            script += `        bytes32 ${contractKeyName}BytecodeHash = keccak256(${contractKeyName}CreationBytecode);\n`;
            script += `        console.log("${contractName} codehash: ", Strings.toHexString(uint256(${contractKeyName}BytecodeHash)));\n\n`;
            
            script += `        address predicted${contractName}Address = vm.computeCreate2Address(\n`;
            script += `            salt,\n`;
            script += `            ${contractKeyName}BytecodeHash,\n`;
            script += `            CREATE2_DEPLOYER\n`;
            script += `        );\n`;
            script += `        console.log("Predicted ${contractName} address: ", predicted${contractName}Address);\n\n`;
            
            script += `        deployments.${key} = DeploymentInfo({\n`;
            script += `            deployedAddress: predicted${contractName}Address,\n`;
            script += `            bytecodeHash: ${contractKeyName}BytecodeHash\n`;
            script += `        });\n\n`;
        });

        script += `        return deployments;\n`;
        script += `    }\n\n`;

        return script;
    }

    private generateDeploymentFunction(projectConfig: ProjectConfig): string {
        let script = `    function performDeployment(DeploymentAddresses memory deployments) private {\n`;
        script += `        vm.startBroadcast();\n\n`;
        script += `        setupPatchworkProtocol();\n\n`;
    
        // Deploy contracts
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractKeyName = key.toLowerCase();
            const contractConfig = value as ContractConfig;
            const contractName = cleanAndCapitalizeFirstLetter(contractConfig.name);
    
            script += `        ${contractName} ${contractKeyName} = new ${contractName}{salt: salt}(ppAddress, ownerAddress);\n`;
            script += `        assert(address(${contractKeyName}) == deployments.${key}.deployedAddress);\n`;
            script += `        console.log("${contractName} deployed at: ", address(${contractKeyName}));\n`;
            script += `        deployments.${key}.deployedAddress = address(${contractKeyName});\n\n`;
        });
    
        // Register references
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const contractName = key;
            if (typeof value !== 'string') {
                for (const fragment of value.fragments || []) {
                    script += `        ${contractName.toLowerCase()}.registerReferenceAddress(address(${fragment.toLowerCase()}));\n`;
                }
            }
        });
    
        // Check if we need whitelist operations
        const hasWhitelistOperations = Object.values(projectConfig.contracts).some(value => {
            const contractConfig = value as ContractConfig;
            const scopeConfig = this.findScope(contractConfig.scopeName, projectConfig);
            return scopeConfig.whitelist;
        });
    
        // Only add pp declaration if we have whitelist operations
        if (hasWhitelistOperations) {
            script += `        PatchworkProtocol pp = PatchworkProtocol(ppAddress);\n`;
            
            // Whitelist operations
            Object.entries(projectConfig.contracts).forEach(([key, value]) => {
                const contractName = key;
                const contractConfig = value as ContractConfig;
                const scopeName = contractConfig.scopeName;
                const scopeConfig = this.findScope(scopeName, projectConfig);
                if (scopeConfig.whitelist) {
                    script += `        pp.addWhitelist("${scopeName}", address(${contractName.toLowerCase()}));\n`;
                }
            });
        }
    
        script += `\n        vm.stopBroadcast();\n`;
        script += `    }\n\n`;
    
        return script;
    }

    private generateSetupFunction(projectConfig: ProjectConfig): string {
        let script = `    function setupPatchworkProtocol() private {\n`;
        script += `        PatchworkProtocol pp = PatchworkProtocol(ppAddress);\n`;
        
        for (const scopeConfig of projectConfig.scopes) {
            script += `        if (pp.getScopeOwner("${scopeConfig.name}") == address(0)) {\n`;
            script += `            pp.claimScope("${scopeConfig.name}");\n`;
            script += `            pp.setScopeRules("${scopeConfig.name}", ${scopeConfig.userPatch}, ${scopeConfig.userAssign}, ${scopeConfig.whitelist});\n`;
            script += `        }\n`;
        }
        
        script += `    }\n\n`;
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