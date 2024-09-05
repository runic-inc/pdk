import { ContractSchemaImpl } from '@patchworkdev/common/codegen/contractSchema';
import { JSONSchemaGen } from '@patchworkdev/common/codegen/jsonSchemaGen';
import { MainContractGen } from '@patchworkdev/common/codegen/mainContractGen';
import { UserContractGen } from '@patchworkdev/common/codegen/userContractGen';
import { cleanAndCapitalizeFirstLetter } from '@patchworkdev/common/codegen/utils';
import { ContractConfig } from '@patchworkdev/common/types';
import JSZip from 'jszip';
import useStore from '../store';

export class ProjectSaver {
    static async saveContract(contractUID: string): Promise<void> {
        const zip = new JSZip();
        const config = useStore.getState().contractsConfig[contractUID];
        await this.prepareContract(config, zip);
        await this.deliverZip(zip);
    }

    static async saveProject(): Promise<void> {
        const zip = new JSZip();
        const contractConfigs = Object.values(useStore.getState().contractsConfig);
        contractConfigs.forEach(async (config) => {
            await this.prepareContract(config, zip);
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
