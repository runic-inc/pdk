import { ContractSchemaImpl } from '@patchworkdev/common/codegen/contractSchema';
import { JSONSchemaGen } from '@patchworkdev/common/codegen/jsonSchemaGen';
import { MainContractGen } from '@patchworkdev/common/codegen/mainContractGen';
import { UserContractGen } from '@patchworkdev/common/codegen/userContractGen';
import { cleanAndCapitalizeFirstLetter } from '@patchworkdev/common/codegen/utils';
import { JSONProjectConfigGen, TSProjectConfigGen } from '@patchworkdev/common/index';
import { ContractConfig } from '@patchworkdev/common/types';
import JSZip from 'jszip';
import useStore from '../store';
import sanitizeName from './sanitizeName';
import storeToSchema from './storeToSchema';

export class ProjectSaver {
    static async saveProjectConfig(type: string): Promise<void> {
        let generatedConfig;
        let content;
        let fileName;
        if (type === 'json') {
            generatedConfig = new JSONProjectConfigGen().gen(storeToSchema());
            content = new Blob([generatedConfig], { type: 'application/json' });
            fileName = `patchwork.config.json`;
        } else if (type === 'ts') {
            console.log('storeToSchema', storeToSchema());
            generatedConfig = new TSProjectConfigGen().gen(storeToSchema());
            content = new Blob([generatedConfig], { type: 'text/ts' });
            fileName = `patchwork.config.ts`;
        } else {
            throw new Error(`Invalid file type: ${type}`);
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    static async saveContract(contractUID: string): Promise<void> {
        const zip = new JSZip();
        const config = useStore.getState().contractsConfig[contractUID];
        const scopeConfig = useStore.getState().scopeConfig;
        await this.prepareContract(
            {
                ...config,
                scopeName: sanitizeName(scopeConfig.name),
                fragments: Array.from(config.fragments).map((fragment) => sanitizeName(useStore.getState().contractsConfig[fragment].name)),
            },
            zip,
        );
        await this.deliverZip(zip);
    }

    static async saveProject(): Promise<void> {
        const zip = new JSZip();
        const contractConfigs = Object.values(useStore.getState().contractsConfig);
        const scopeConfig = useStore.getState().scopeConfig;
        contractConfigs.forEach(async (config) => {
            await this.prepareContract(
                {
                    ...config,
                    scopeName: sanitizeName(scopeConfig.name),
                    fragments: Array.from(config.fragments).map((fragment) => sanitizeName(useStore.getState().contractsConfig[fragment].name)),
                },
                zip,
            );
        });
        await this.deliverZip(zip);
    }

    private static async deliverZip(zipInstance: JSZip) {
        const content = await zipInstance.generateAsync({ type: 'blob' });
        const fileName = `patchwork-wizard-generated.zip`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    private static async prepareContract(config: ContractConfig, zipInstance: JSZip) {
        const userContract = new UserContractGen().gen(new ContractSchemaImpl(config));
        const abstractContract = new MainContractGen().gen(new ContractSchemaImpl(config));
        const jsonSchema = new JSONSchemaGen().gen(new ContractSchemaImpl(config));
        const baseName = cleanAndCapitalizeFirstLetter(config.name || 'Contract');
        const userContractName = `${baseName}.sol`;
        const abstractContractName = `${baseName}Generate.sol`;
        const jsonSchemaName = `${baseName}Schema.json`;
        zipInstance.file(userContractName, userContract);
        zipInstance.file(abstractContractName, abstractContract);
        // Ensure jsonSchema is an object, not a string
        const jsonSchemaContent = typeof jsonSchema === 'string' ? JSON.parse(jsonSchema) : jsonSchema;
        zipInstance.file(jsonSchemaName, JSON.stringify(jsonSchemaContent, null, 2));
    }
}
