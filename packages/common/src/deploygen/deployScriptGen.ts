import { ProjectConfig } from "../types";

export class DeployScriptGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        // Start building the script
        let script = `// SPDX-License-Identifier: UNLICENSED\n`;
        script += `pragma solidity ^0.8.13;\n\n`;
        script += `import "forge-std/Script.sol";\n`;
        script += `import "forge-std/console.sol";\n`;

        console.log(projectConfig.contracts.keys());
        projectConfig.contracts.forEach((value: string, key: string) => {
            script += `import "./${value.replace(".json", ".sol")}";\n`;
        });

        script += `import "@patchwork/PatchworkProtocol.sol";\n`;

        // Assuming the first contract in the config is the main deployer contract
        const mainContractName = projectConfig.name.replace(/\s/g, "");
        script += `\ncontract ${mainContractName}Deploy is Script {\n`;
        script += `    function run() external {\n`;


        script += `        address ownerAddress = vm.envAddress("OWNER");\n`;
        script += `        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");\n`
        script += `        console.log("Deployer starting");\n`;
        script += `        console.log("owner: ", ownerAddress);\n`;
        script += `        console.log("patchwork protocol: ", ppAddress);\n\n`;

        script += `        vm.startBroadcast();\n`;
        script += `        PatchworkProtocol pp = PatchworkProtocol(ppAddress);\n`;

        // Iterate through each scope in the project configuration
        for (const scopeConfig of projectConfig.scopes) {
            script += `        pp.claimScope("${scopeConfig.name}");\n`;
            script += `        pp.setScopeRules("${scopeConfig.name}", false, false, true);\n`;
        }

        // deploy each contract
        projectConfig.contracts.forEach((value: string, key: string) => {
            const contractName = key;
            script += `        ${contractName} ${contractName.toLowerCase()} = new ${contractName}(ppAddress, ownerAddress);\n`;
        });

        // register fragments
        projectConfig.contracts.forEach((value: string, key: string) => {
            const contractName = key;
            if (projectConfig.contractRelations !== undefined) {
                for (const fragment of projectConfig.contractRelations.get(key)?.fragments || []) {
                    script += `        ${contractName.toLowerCase()}.registerFragment(${fragment.toLowerCase()});\n`;
                }
            }
        });

        // whitelist
        projectConfig.contracts.forEach((value: string, key: string) => {
            const contractName = key;
            // TODO FIX - load contract config to get scope name
            // Additional logic for whitelisting if applicable
            //if (scopeConfig.whitelist) {
                script += `        pp.addWhitelist("${projectConfig.scopes[0].name}", address(${contractName.toLowerCase()}));\n`;
            //}
        });
        script += `        vm.stopBroadcast();\n`;

        script += `    }\n`;
        script += `}\n`;

        return script;
    }
}