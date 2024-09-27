type FieldType = 'bigint' | 'int' | 'hex' | 'boolean' | 'string' | 'many' | 'one';
type FieldDefinition = {
    type: FieldType;
    reference?: string;
    isOptional?: boolean;
    relatedModel?: string;
    joinField?: string;
}

interface SchemaBuilder {
    createTable: (schema: Record<string, FieldDefinition | ChainableFieldDefinition>) => Entity;
    createEnum: (values: string[]) => Entity;
    bigint: () => ChainableFieldDefinition;
    int: () => ChainableFieldDefinition;
    hex: () => ChainableFieldDefinition;
    boolean: () => ChainableFieldDefinition;
    string: () => ChainableFieldDefinition;
    many: (relatedModel: string) => FieldDefinition;
    one: (joinField: string) => FieldDefinition;
}

interface ChainableFieldDefinition {
    references: (reference: string) => ChainableFieldDefinition;
    optional: () => ChainableFieldDefinition;
    _build: () => FieldDefinition;
}

type TableDefinition = Record<string, FieldDefinition>;
export type Entity = {
    type: 'table' | 'enum';
    tableDefinition?: TableDefinition;
    enumValues?: string[];
}
export type Schema = Record<string, Entity>;

export function createSchema(schemaDefinition: (p: SchemaBuilder) => Schema) {
    const createChainableFieldDefinition = (type: FieldType): ChainableFieldDefinition => {
        const fieldDef: FieldDefinition = { type };
        const chainable: ChainableFieldDefinition = {
            references: (reference: string) => {
                fieldDef.reference = reference;
                return chainable;
            },
            optional: () => {
                fieldDef.isOptional = true;
                return chainable;
            },
            _build: () => fieldDef
        };
        return chainable;
    };

    const mockSchemaBuilder: SchemaBuilder = {
        createTable: (schema: Record<string, FieldDefinition | ChainableFieldDefinition>) => {
            const resolvedSchema: TableDefinition = {};
            for (const [key, value] of Object.entries(schema)) {
                if ('_build' in value) {
                    resolvedSchema[key] = value._build();
                } else {
                    resolvedSchema[key] = value;
                }
            }
            return {
                type: 'table',
                tableDefinition: resolvedSchema,
            };
        },
        createEnum: (values: string[]) => {
            return {
                type: 'enum',
                enumValues: values,
            };
        },
        bigint: () => createChainableFieldDefinition('bigint'),
        int: () => createChainableFieldDefinition('int'),
        hex: () => createChainableFieldDefinition('hex'),
        boolean: () => createChainableFieldDefinition('boolean'),
        string: () => createChainableFieldDefinition('string'),
        many: (relatedModel) => {
            return {
                type: 'many',
                relatedModel
            }
        },
        one: (joinField) => {
            return {
                type: 'one',
                joinField
            }
        }
    };

    const result = schemaDefinition(mockSchemaBuilder);
    return result;
}