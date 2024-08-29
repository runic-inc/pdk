import { ContractSchemaImpl } from '@/codegen/contractSchema';
import { UserContractGen } from '@/codegen/userContractGen';
import { MainContractGen } from '@/codegen/mainContractGen';
import { JSONSchemaGen } from '@/codegen/jsonSchemaGen';
import { cleanAndCapitalizeFirstLetter } from '@/codegen/utils';
import JSZip from 'jszip';

export class ProjectSaver {
  static async saveProject(contractConfig: ContractSchemaImpl): Promise<void> {
    const userContract = new UserContractGen().gen(contractConfig);
    const abstractContract = new MainContractGen().gen(contractConfig);
    const jsonSchema = new JSONSchemaGen().gen(contractConfig);

    const baseName = cleanAndCapitalizeFirstLetter(contractConfig.name || 'Contract');
    const userContractName = `${baseName}.sol`;
    const abstractContractName = `${baseName}Generate.sol`;
    const jsonSchemaName = `${baseName}Schema.json`;

    const zip = new JSZip();
    zip.file(userContractName, userContract);
    zip.file(abstractContractName, abstractContract);

    // Ensure jsonSchema is an object, not a string
    const jsonSchemaContent = typeof jsonSchema === 'string' ? JSON.parse(jsonSchema) : jsonSchema;
    zip.file(jsonSchemaName, JSON.stringify(jsonSchemaContent, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const fileName = `${baseName}_contracts.zip`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}