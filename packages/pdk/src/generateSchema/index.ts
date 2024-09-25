import path from 'path';
import ts from 'typescript';
import { importABIFiles, importPatchworkConfig } from '../helpers/config';
import { createSchemaFile, createTableFromAbiEvent, createTableFromObject, generalDBStructure } from './factories';

// using this simple function first rather than installing lodash or change-case.
const camelCase = (s: string) => s
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');

export async function generateSchema(configPath: string) {

    const abiDir = path.join(path.dirname(configPath), "", "abis");
    const ponderSchema = path.join(path.dirname(configPath), "ponder.schema.ts");

    const abiObjects = await importABIFiles(abiDir);
    const projectConfig = await importPatchworkConfig(configPath);
    console.log('projectConfig', projectConfig);
    if (!projectConfig) {
        console.error('Error importing ProjectConfig');
        return;
    }

    // begin process config

    // create entities table to store info about our models.
    // create contracts table to store info about our contracts.
    // can we combine entities and contracts into one table?
    const generalDB = generalDBStructure();

    // entity db model - needs relationships to other entities
    // metadata schema
    // on setup event handler - we want to add info about the entities to the entities table
    // on setup event handler - we want to add info about the contracts to the contracts table

    // need to get the fragments relationships to the assigned contracts
    const fragmentRelationships: Record<string, string[]> = {} as Record<string, string[]>;
    Object.entries(projectConfig.contractRelations).forEach(([contractName, { fragments }]) => {
        fragments.forEach((fragment) => {
            if (!fragmentRelationships[fragment]) {
                fragmentRelationships[fragment] = [];
            }
            fragmentRelationships[fragment].push(contractName);
        });
    });

    console.log('projectConfig.contracts', projectConfig.contracts);
    const contractDBEntities = Object.entries(projectConfig.contracts).map(([contractName, contractConfig]) => {
        if (typeof contractConfig === 'string') return undefined;

        console.log('contractName', contractName);
        console.log('contractConfig', contractConfig);
        console.log('relations ', projectConfig.contractRelations)

        // start with fields that all entities have
        const fields = [
            { key: "id", value: "p.string()" }, // should be contract_tokenid
            { key: "owner", value: "p.hex()" },
            { key: "tokenId", value: "p.bigint()" },
            { key: "mintTxId", value: "p.string().references('Tx.id')" },
            { key: "burnTxId", value: "p.string().references('Tx.id').optional()" },
            { key: "mintTx", value: "p.one('mintTxId')" },
            { key: "burnTx", value: "p.one('burnTxId')" },
        ];

        // is this a fragment
        if (fragmentRelationships[contractName]) {
            fragmentRelationships[contractName].forEach((relation) => {
                fields.push({ key: camelCase(`${relation}Id`), value: `p.string().references('${relation}.id')` });
            });
        }
        // does this contract allow fragments to be assigned to it
        if (projectConfig.contractRelations[contractName]?.fragments.length > 0) {
            projectConfig.contractRelations[contractName].fragments.forEach((fragment) => {
                fields.push({ key: camelCase(`${fragment}`), value: `p.many('${fragment}.${camelCase(contractName)}Id')` });
            });
        }

        return createTableFromObject(contractName, fields);
    }).filter((x) => x !== undefined) as ts.PropertyAssignment[];

    // end process config

    // we don't use the raw abi events to generate the schema at the moment. Leaving in for future reference.
    const tables: ts.PropertyAssignment[] = [];
    for (const abiObject of abiObjects) {
        abiObject.abi.forEach((abiItem) => {
            if (abiItem.type === 'event') {
                tables.push(createTableFromAbiEvent(abiObject.name, abiItem));
            }
        });
    }
    await createSchemaFile([...generalDB, ...contractDBEntities], ponderSchema);
}