import path from 'path';
import ts from 'typescript';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';
import { createSchemaFile, createTableFromObject, generalDBStructure } from './factories';

const camelCase = (s: string) => s
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');

export async function generateSchema(configPath: string) {
    const abiDir = path.join(path.dirname(configPath), "", "abis");
    const ponderSchema = path.join(path.dirname(configPath), "ponder.schema.ts");
    const abis = await importABIFiles(abiDir);
    const projectConfig = await importPatchworkConfig(configPath);

    if (!projectConfig) {
        console.error('Error importing ProjectConfig');
        return;
    }

    const generalDB = generalDBStructure();
    const fragmentRelationships = getFragmentRelationships(projectConfig);

    // Create Contract table
    const contractTable = createTableFromObject('Contract', [
        { key: "id", value: "p.string()" },
        { key: "name", value: "p.string()" },
        { key: "symbol", value: "p.string()" },
        { key: "chainId", value: "p.string().references('Chain.id')" },
        { key: "address", value: "p.hex()" },
        { key: "baseURI", value: "p.string()" },
        { key: "schemaURI", value: "p.string()" },
        { key: "imageURI", value: "p.string()" },
        { key: "timestamp", value: "p.bigint()" },
    ]);

    const contractDBEntities = [contractTable];
    const additionalTables: ts.PropertyAssignment[] = [];

    Object.entries(projectConfig.contracts).forEach(([contractName, contractConfig]) => {
        if (typeof contractConfig === 'string') return;

        const fields = [
            { key: "id", value: "p.string()" },
            { key: "owner", value: "p.hex()" },
            { key: "tokenId", value: "p.bigint()" },
            { key: "mintTxId", value: "p.string().references('Tx.id')" },
            { key: "burnTxId", value: "p.string().references('Tx.id').optional()" },
            { key: "mintTx", value: "p.one('mintTxId')" },
            { key: "burnTx", value: "p.one('burnTxId')" },
            { key: "contractId", value: "p.string().references('Contract.id')" },
        ];

        contractConfig.fields.forEach((field) => {
            if (field.type === 'literef' || field.arrayLength) {
                // Create a separate table for literef or array fields
                const refTableName = `${contractName}${camelCase(field.key)}`;
                fields.push({ key: field.key, value: `p.many('${refTableName}.${camelCase(contractName)}Id')` });

                const refFields = [
                    { key: "id", value: "p.string()" },
                    { key: `${camelCase(contractName)}Id`, value: `p.string().references('${contractName}.id')` },
                    { key: "value", value: getFieldType(field.type) },
                    { key: "timestamp", value: "p.bigint()" },
                ];

                additionalTables.push(createTableFromObject(refTableName, refFields));
            } else {
                fields.push({ key: field.key, value: `${getFieldType(field.type)}.optional()` });
            }
        });

        if (fragmentRelationships[contractName]) {
            fragmentRelationships[contractName].forEach((relation) => {
                fields.push({ key: camelCase(`${relation}Id`), value: `p.string().references('${relation}.id').optional()` });
            });
        }

        if (projectConfig.contractRelations[contractName]?.fragments.length > 0) {
            projectConfig.contractRelations[contractName].fragments.forEach((fragment) => {
                fields.push({ key: camelCase(`${fragment}`), value: `p.many('${fragment}.${camelCase(contractName)}Id')` });
            });
        }

        fields.push({ key: "timestamp", value: "p.bigint()" });

        contractDBEntities.push(createTableFromObject(contractName, fields));
    });

    await createSchemaFile([...generalDB, ...contractDBEntities, ...additionalTables], ponderSchema);
}

function getFieldType(type: string): string {
    switch (type) {
        case 'boolean': return "p.boolean()";
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32': return "p.int()";
        case 'int64':
        case 'int128':
        case 'int256':
        case 'uint64':
        case 'uint128':
        case 'uint256': return "p.bigint()";
        case 'address': return "p.hex()";
        case 'char8':
        case 'char16':
        case 'char32':
        case 'char64':
        case 'string': return "p.string()";
        default: return "p.string()";
    }
}