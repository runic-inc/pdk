const tableRegistry = new Map<string, any>();

export function onchainTable(tableName: string, tableDefinition: (t: TableBuilder) => Record<string, ChainableTableFieldDefinition>) {
    // If the table is already registered, return it
    if (tableRegistry.has(tableName)) {
        return tableRegistry.get(tableName);
    }

    const createChainableTableFieldDefinition = (type: FieldType): ChainableTableFieldDefinition => {
        const fieldDef: FieldDefinition = { type, isOptional: true };
        const chainable: ChainableTableFieldDefinition = {
            notNull: () => {
                fieldDef.isOptional = false;
                return chainable;
            },
            _build: () => fieldDef,
        };
        return chainable;
    };

    const mockTableBuilder: TableBuilder = {
        text: () => createChainableTableFieldDefinition('string'),
        evmHex: () => createChainableTableFieldDefinition('hex'),
        evmBigint: () => createChainableTableFieldDefinition('bigint'),
        integer: () => createChainableTableFieldDefinition('int'),
    };

    const columns = tableDefinition(mockTableBuilder);
    const columnDefinitions: Record<string, FieldDefinition> = {};

    for (const [key, value] of Object.entries(columns)) {
        columnDefinitions[key] = value._build();
    }

    // Create a base proxy handler that returns column names
    const baseHandler = {
        get: function (target: any, prop: string) {
            return prop;
        },
    };

    // Create a base proxy first and register it
    const baseProxy = new Proxy({}, baseHandler);
    tableRegistry.set(tableName, baseProxy);

    // Create the full table object
    const tableObject = {
        type: 'table' as const,
        _tableName: tableName,
        _columns: Object.keys(columnDefinitions),
        _schema: columnDefinitions,
    };

    // Create the final handler
    const handler = {
        get: function (target: any, prop: string) {
            if (prop in tableObject) {
                return tableObject[prop as keyof typeof tableObject];
            }
            if (Object.keys(columnDefinitions).includes(prop)) {
                return prop;
            }
            return prop;
        },
    };

    // Replace the base proxy with the full implementation
    const table = new Proxy(tableObject, handler);
    tableRegistry.set(tableName, table);
    return table;
}

export function relations(table: any, relationDefinition: (builders: RelationBuilder) => Record<string, Relation>) {
    const relationBuilder: RelationBuilder = {
        one: (relatedTable: any, config: Omit<Relation, 'type' | 'relatedTable'>): Relation => ({
            type: 'one',
            relatedTable: typeof relatedTable === 'string' ? relatedTable : relatedTable._tableName,
            fields: config.fields?.map((f) => (typeof f === 'string' ? f : f.toString())) || [],
            references: config.references?.map((r) => (typeof r === 'string' ? r : r.toString())) || [],
            relationName: config.relationName,
        }),
        many: (relatedTable: any, config: Partial<Omit<Relation, 'type' | 'relatedTable'>> = {}): Relation => ({
            type: 'many',
            relatedTable: typeof relatedTable === 'string' ? relatedTable : relatedTable._tableName,
            fields: config.fields?.map((f) => (typeof f === 'string' ? f : f.toString())) || [],
            references: config.references?.map((r) => (typeof r === 'string' ? r : r.toString())) || [],
            relationName: config.relationName,
        }),
    };

    let cachedRelations: Record<string, Relation> | null = null;

    const relationObject = {
        type: 'relations' as const,
        _tableName: table._tableName,
        get _relations() {
            if (!cachedRelations) {
                cachedRelations = relationDefinition(relationBuilder);
            }
            return cachedRelations;
        },
    };

    return new Proxy(relationObject, {
        get: function (target, prop) {
            if (prop === 'then') return undefined;
            if (prop in target) {
                return target[prop as keyof typeof target];
            }
            if (!cachedRelations) {
                cachedRelations = relationDefinition(relationBuilder);
            }
            return cachedRelations[prop as string];
        },
    });
}

type FieldType = 'bigint' | 'int' | 'hex' | 'boolean' | 'string' | 'many' | 'one';
export type FieldDefinition = {
    type: FieldType;
    reference?: string;
    isOptional?: boolean;
    relatedModel?: string;
    joinField?: string;
};

type ChainableTableFieldDefinition = {
    notNull: () => ChainableTableFieldDefinition;
    _build: () => FieldDefinition;
};

interface TableBuilder {
    text: () => ChainableTableFieldDefinition;
    evmHex: () => ChainableTableFieldDefinition;
    evmBigint: () => ChainableTableFieldDefinition;
    integer: () => ChainableTableFieldDefinition;
}

type Relation = {
    fields: any[];
    references?: any[];
    relationName?: string;
    relatedTable: any;
    type: 'one' | 'many';
};

type RelationBuilder = {
    one: (relatedTable: any, config: Omit<Relation, 'type' | 'relatedTable'>) => Relation;
    many: (relatedTable: any, config?: Partial<Omit<Relation, 'type' | 'relatedTable'>>) => Relation;
};

export type TableDefinition = {
    type: 'table';
    _tableName: string;
    _columns: string[];
    _schema: Record<string, FieldDefinition>;
};
export type TableRelations = {
    type: 'relations';
    _tableName: string;
    _relations: Record<string, Relation>;
};
export type SchemaModule = {
    [K in string]: TableDefinition | TableRelations;
};
