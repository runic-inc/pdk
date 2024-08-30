import { ContractSchemaImpl } from '@patchworkdev/common/codegen/contractSchema';
import { MainContractGen } from '@patchworkdev/common/codegen/mainContractGen';
import { UserContractGen } from '@patchworkdev/common/codegen/userContractGen';
import { ContractConfig } from '@patchworkdev/common/types';
import useStore from '../store';

export class RemixExporter {
    private static readonly PATCHWORK_BASE_URL = 'https://github.com/runic-inc/patchwork/blob/main/src/';

    private static readonly remappings = {
        '@patchwork/': 'lib/patchwork/src/',
    };

    static prepareForRemix(contractConfig: ContractSchemaImpl): string {
        const userContract = new UserContractGen().gen(contractConfig);
        const abstractContract = new MainContractGen().gen(contractConfig);

        const processedUserContract = this.processUserContract(userContract);
        const processedAbstractContract = this.processAbstractContract(abstractContract);

        return `${processedAbstractContract}\n\n${processedUserContract}`;
    }

    private static processUserContract(userContract: string): string {
        const lines = userContract.split('\n');
        // Remove license, pragma, and import lines
        const filteredLines = lines.filter(
            (line) => !line.includes('SPDX-License-Identifier') && !line.includes('pragma solidity') && !line.includes('import'),
        );
        return filteredLines.join('\n');
    }

    private static processAbstractContract(abstractContract: string): string {
        const lines = abstractContract.split('\n');
        const processedLines = lines.map((line) => {
            if (line.includes('import')) {
                return this.replaceImport(line);
            }
            return line;
        });
        return processedLines.join('\n');
    }

    private static replaceImport(line: string): string {
        const importMatch = line.match(/"(.+)"/);
        if (!importMatch) return line;

        const importPath = importMatch[1];
        let newPath = importPath;

        for (const [prefix, replacement] of Object.entries(this.remappings)) {
            if (importPath.startsWith(prefix)) {
                newPath = importPath.replace(prefix, replacement);
                break;
            }
        }

        // Replace patchwork local paths with GitHub URLs
        if (newPath.startsWith('lib/patchwork/src/')) {
            newPath = newPath.replace('lib/patchwork/src/', this.PATCHWORK_BASE_URL);
        }
        return line.replace(importMatch[0], `"${newPath}"`);
    }

    static getRemixUrl(contractConfig: ContractSchemaImpl): string {
        const combinedContract = this.prepareForRemix(contractConfig);
        const base64EncodedCode = btoa(combinedContract);
        return `https://remix.ethereum.org/#code=${base64EncodedCode}`;
    }

    static getRemixUrlByUID(uid: string): string | Error {
        const config = useStore.getState().contractsConfig.find((contract) => contract._uid === uid);
        if (!config) return Error('Contract not found');
        return this.getRemixUrl(new ContractSchemaImpl(config as ContractConfig));
    }
}
