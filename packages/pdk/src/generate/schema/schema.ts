import { ProjectConfig } from '@patchworkdev/common';
import * as _ from 'lodash';
import { getFragmentRelationships } from '../../common/helpers/config';
import { formatAndSaveFile } from '../../common/helpers/file';
import { logger } from '../../common/helpers/logger';

type Table = {
    fields: {
        key: string;
        value: string;
    }[];
    relations: Record<
        string,
        | {
              type: 'one';
              name: string;
              table: string;
              fields: string[];
              references: string[];
          }
        | {
              type: 'many';
              name: string;
              table: string;
              relationName: string;
          }
    >;
};
type TableStructure = Record<string, Table>;

type EnumStructure = Record<string, string[]>;

export async function generateSchemaFile(projectConfig: ProjectConfig, outputFile: string): Promise<void> {
    logger.debug(`Attempting to generate ponder schema at ${outputFile}`);
    const coreEnums = coreEnumStructure();
    const coreTables = coreTableStructure();
    const contractTables = getUserContractTableStructure(projectConfig);

    const schemaFile = renderSchemaFile(coreEnums, {
        ...coreTables,
        ...contractTables,
    });
    await formatAndSaveFile(outputFile, schemaFile);
}

function coreEnumStructure(): EnumStructure {
    const enums: Record<string, string[]> = {
        PatchType: ['PATCH', 'ERC1155', 'ACCOUNT'],
        LogType: ['ADD', 'REMOVE'],
        FeeChangeType: ['PROPOSE', 'COMMIT'],
        AssignType: ['ASSIGN', 'UNASSIGN'],
        SchemaTypes: [
            'BOOLEAN',
            'INT8',
            'INT16',
            'INT32',
            'INT64',
            'INT128',
            'INT256',
            'UINT8',
            'UINT16',
            'UINT32',
            'UINT64',
            'UINT128',
            'UINT256',
            'CHAR8',
            'CHAR16',
            'CHAR32',
            'CHAR64',
            'LITEREF',
            'ADDRESS',
            'STRING',
        ],
    };
    return enums;
}
function coreTableStructure(): TableStructure {
    const tables: TableStructure = {
        Chain: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'name', value: 'p.text().notNull()' },
                { key: 'namespace', value: 'p.text().notNull()' },
                { key: 'patchworkAddress', value: 'p.hex().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
            ],
            relations: {
                block: {
                    type: 'many',
                    table: 'block',
                    name: 'block',
                    relationName: 'chainId',
                },
            },
        },
        Block: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'extraData', value: 'p.hex().notNull()' },
                { key: 'number', value: 'p.bigint().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
                { key: 'chainId', value: 'p.text().notNull()' },
            ],
            relations: {
                chain: {
                    type: 'one',
                    name: 'chain',
                    table: 'chain',
                    fields: ['chainId'],
                    references: ['id'],
                },
            },
        },
        Tx: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'blockId', value: 'p.text().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
                { key: 'fromId', value: 'p.text().notNull()' },
                { key: 'nonce', value: 'p.integer().notNull()' },
                { key: 'toId', value: 'p.text()' },
                { key: 'txIndex', value: 'p.integer().notNull()' },
                { key: 'value', value: 'p.bigint().notNull()' },
                { key: 'chainId', value: 'p.text().notNull()' },
            ],
            relations: {
                block: {
                    type: 'one',
                    name: 'block',
                    table: 'block',
                    fields: ['blockId'],
                    references: ['id'],
                },
                from: {
                    type: 'one',
                    name: 'from',
                    table: 'address',
                    fields: ['fromId'],
                    references: ['id'],
                },
                to: {
                    type: 'one',
                    name: 'to',
                    table: 'address',
                    fields: ['toId'],
                    references: ['id'],
                },
                chain: {
                    type: 'one',
                    name: 'chain',
                    table: 'chain',
                    fields: ['chainId'],
                    references: ['id'],
                },
            },
        },
        GlobalAddress: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'address', value: 'p.hex().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
            ],
            relations: {
                address: {
                    type: 'many',
                    name: 'address',
                    table: 'address',
                    relationName: 'addressId',
                },
            },
        },
        Address: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'addressId', value: 'p.text().notNull()' },
                { key: 'chainId', value: 'p.text().notNull()' },
                { key: 'type', value: 'p.text().notNull()' },
                { key: 'searchable', value: 'p.text()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
            ],
            relations: {
                address: {
                    type: 'one',
                    name: 'address',
                    table: 'globalAddress',
                    fields: ['addressId'],
                    references: ['id'],
                },
                chain: {
                    type: 'one',
                    name: 'chain',
                    table: 'chain',
                    fields: ['chainId'],
                    references: ['id'],
                },
                txsFrom: {
                    type: 'many',
                    name: 'txsFrom',
                    table: 'tx',
                    relationName: 'fromId',
                },
                txsTo: {
                    type: 'many',
                    name: 'txsTo',
                    table: 'tx',
                    relationName: 'toId',
                },
            },
        },
        Scope: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'name', value: 'p.text().notNull()' },
                { key: 'addressId', value: 'p.text().notNull()' },
                { key: 'txId', value: 'p.text().notNull()' },
                { key: 'chainId', value: 'p.text().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
            ],
            relations: {
                address: {
                    type: 'one',
                    name: 'address',
                    table: 'address',
                    fields: ['addressId'],
                    references: ['id'],
                },
                tx: {
                    type: 'one',
                    name: 'tx',
                    table: 'tx',
                    fields: ['txId'],
                    references: ['id'],
                },
                chain: {
                    type: 'one',
                    name: 'chain',
                    table: 'chain',
                    fields: ['chainId'],
                    references: ['id'],
                },
            },
        },
        Contract: {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'name', value: 'p.text().notNull()' },
                { key: 'symbol', value: 'p.text().notNull()' },
                { key: 'chainId', value: 'p.text().notNull()' },
                { key: 'address', value: 'p.hex().notNull()' },
                { key: 'baseURI', value: 'p.text().notNull()' },
                { key: 'schemaURI', value: 'p.text().notNull()' },
                { key: 'imageURI', value: 'p.text().notNull()' },
                { key: 'timestamp', value: 'p.bigint().notNull()' },
            ],
            relations: {
                chain: {
                    type: 'one',
                    name: 'chain',
                    table: 'chain',
                    fields: ['chainId'],
                    references: ['id'],
                },
            },
        },
    };
    return tables;
}

function getUserContractTableStructure(projectConfig: ProjectConfig): TableStructure {
    const fragmentRelationships = getFragmentRelationships(projectConfig);
    const tables: TableStructure = {};

    Object.entries(projectConfig.contracts).forEach(([contractName, contractConfig]) => {
        if (typeof contractConfig === 'string') return;

        const table: Table = {
            fields: [
                { key: 'id', value: 'p.text().notNull()' },
                { key: 'owner', value: 'p.hex().notNull()' },
                { key: 'tokenId', value: 'p.bigint().notNull()' },
                { key: 'mintTxId', value: 'p.text().notNull()' },
                { key: 'burnTxId', value: 'p.text()' },
                { key: 'contractId', value: 'p.text().notNull()' },
            ],
            relations: {
                mintTx: {
                    type: 'one',
                    name: 'mintTx',
                    table: 'tx',
                    fields: ['mintTxId'],
                    references: ['id'],
                },
                burnTx: {
                    type: 'one',
                    name: 'burnTx',
                    table: 'tx',
                    fields: ['burnTxId'],
                    references: ['id'],
                },
                contract: {
                    type: 'one',
                    name: 'contract',
                    table: 'contract',
                    fields: ['contractId'],
                    references: ['id'],
                },
            },
        };

        contractConfig.fields.forEach((field) => {
            if (field.type === 'literef' || field.arrayLength) {
                // Create a separate table for literef or array fields
                const refTableName = `${contractName}${_.camelCase(field.key)}`;

                const refTable: Table = {
                    fields: [
                        { key: 'id', value: 'p.text().notNull()' },
                        { key: `${_.camelCase(contractName)}Id`, value: `p.text().notNull()` },
                        { key: 'value', value: `${getFieldType(field.type)}.notNull()` },
                        { key: 'timestamp', value: 'p.bigint().notNull()' },
                    ],
                    relations: {},
                };
                refTable.relations[_.camelCase(contractName)] = {
                    type: 'one',
                    name: 'contract',
                    table: _.camelCase(contractName),
                    fields: [`${_.camelCase(contractName)}Id`],
                    references: ['id'],
                };

                table.relations[field.key] = {
                    type: 'many',
                    name: field.key,
                    table: _.camelCase(refTableName),
                    relationName: `${_.camelCase(contractName)}`,
                };

                tables[refTableName] = refTable;
            } else {
                table.fields.push({
                    key: field.key,
                    value: `${getFieldType(field.type)}`,
                });
            }
        });

        if (fragmentRelationships[contractName]) {
            fragmentRelationships[contractName].forEach((relation) => {
                table.fields.push({
                    key: _.camelCase(`${relation}Id`),
                    value: `p.text()`,
                });
                table.relations[_.camelCase(relation)] = {
                    type: 'one',
                    name: _.camelCase(relation),
                    table: _.camelCase(relation),
                    fields: [`${_.camelCase(relation)}Id`],
                    references: ['id'],
                };
            });
        }

        contractConfig.fragments?.forEach((fragment) => {
            table.relations[_.camelCase(fragment)] = {
                type: 'many',
                name: _.camelCase(fragment),
                table: _.camelCase(fragment),
                relationName: `${_.camelCase(contractName)}Id`,
            };
        });

        table.fields.push({ key: 'timestamp', value: 'p.bigint()' });
        tables[contractName] = table;
    });
    return tables;
}

function getFieldType(type: string): string {
    switch (type) {
        case 'boolean':
            return 'p.boolean()';
        case 'int8':
        case 'int16':
        case 'int32':
        case 'uint8':
        case 'uint16':
        case 'uint32':
            return 'p.integer()';
        case 'int64':
        case 'int128':
        case 'int256':
        case 'uint64':
        case 'uint128':
        case 'uint256':
            return 'p.bigint()';
        case 'address':
            return 'p.hex()';
        case 'char8':
        case 'char16':
        case 'char32':
        case 'char64':
        case 'string':
            return 'p.text()';
        default:
            return 'p.text()';
    }
}

function renderSchemaFile(enums: EnumStructure, tables: TableStructure): string {
    const output = [];
    output.push(`import { index, onchainTable, relations } from "@ponder/core";`);
    Object.entries(tables).forEach(([tableName, table]) => {
        output.push(`export const ${_.camelCase(tableName)} = onchainTable('${_.snakeCase(tableName)}', (p) => ({
            ${table.fields.map((field) => `${field.key}: ${field.value}`).join(',\n')}
        }));\n`);

        const includes: Set<string> = new Set();
        for (const [relationName, relation] of Object.entries(table.relations)) {
            includes.add(relation.type);
        }
        const include = includes.size > 0 ? `${[...includes].join(',')}` : '';

        if (Object.keys(table.relations).length > 0) {
            output.push(`export const ${_.camelCase(tableName)}Relations = relations(${_.camelCase(tableName)}, ({${include}}) => ({
                ${Object.entries(table.relations).map(([relationName, relation]) => {
                    if (relation.type === 'one') {
                        return `${relation.name}: ${relation.type}(${relation.table},{
                            fields:[${relation.fields.map((field) => `${_.camelCase(tableName)}.${field}`).join(',')}],
                            references:[${relation.references.map((field) => `${_.camelCase(relation.table)}.${field}`).join(',')}]
                    })
                    `;
                    } else {
                        return `${relation.name}: ${relation.type}(${relation.table},{
                            relationName:'${relation.name}',
                           
                    })
                    `;
                    }
                })}
            }));\n`);
        }
    });
    return output.join('\n');
}
