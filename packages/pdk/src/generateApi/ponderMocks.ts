// ponderMocks.ts

interface SchemaBuilder {
    createTable: (schema: Record<string, FieldType>) => TableDefinition;
    bigint: () => FieldType;
    int: () => FieldType;
    hex: () => FieldType;
    boolean: () => FieldType;
    string: () => FieldType;
    // Add other data types as needed
  }
  
  interface TableDefinition {
    [key: string]: FieldType;
  }
  
  type FieldType = 'bigint' | 'int' | 'hex' | 'boolean' | 'string' | string;
  
  export function createSchema(schemaDefinition: (p: SchemaBuilder) => Record<string, TableDefinition>) {
    const mockSchemaBuilder: SchemaBuilder = {
      createTable: (schema: Record<string, FieldType>) => {
        //console.log("Creating table with schema:", schema);
        return schema;
      },
      bigint: () => 'bigint',
      int: () => 'int',
      hex: () => 'hex',
      boolean: () => 'boolean',
      string: () => 'string',
    };
  
    const result = schemaDefinition(mockSchemaBuilder);
    //console.log("Schema definition result:", result);
    return result;
  }