interface SchemaBuilder {
  createTable: (schema: Record<string, FieldType>) => TableDefinition;
  bigint: () => FieldType;
  int: () => FieldType;
  hex: () => FieldType;
  boolean: () => FieldType;
}

interface TableDefinition {
  [key: string]: FieldType;
}

type FieldType = "bigint" | "int" | "hex" | "boolean" | "string" | string;

export function createSchema(
  schemaDefinition: (p: SchemaBuilder) => Record<string, TableDefinition>
) {
  const mockSchemaBuilder: SchemaBuilder = {
    createTable: (schema: Record<string, FieldType>) => {
      return schema;
    },
    bigint: () => "bigint",
    int: () => "int",
    hex: () => "hex",
    boolean: () => "boolean",
    string: () => "string",
  };

  const result = schemaDefinition(mockSchemaBuilder);
  return result;
}
