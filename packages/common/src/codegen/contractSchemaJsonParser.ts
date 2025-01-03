import { ContractConfig, Feature, FieldConfig } from "../types";

/**
 * Parse raw JSON object to a ContractConfig which can be fed to a ContractSchemaImpl
 */
export function parseJson(jsonData: any): ContractConfig {
    let contractConfig: ContractConfig = {
        scopeName: jsonData.scopeName,
        name: jsonData.name,
        symbol: jsonData.symbol,
        baseURI: jsonData.baseURI,
        schemaURI: jsonData.schemaURI,
        imageURI: jsonData.imageURI,
        fields: parseFieldEntries(jsonData),
        features: parseFeatures(jsonData),
        fragments: parseFragments(jsonData),
    };
    return contractConfig;
}

function parseFeatures(jsonData: any): Feature[] {
    let features: Feature[] = [];
    if (jsonData.features && Array.isArray(jsonData.features)) {
        features = jsonData.features.map((featureName: string) => {
            // Convert the feature name to uppercase for case-insensitive comparison
            const normalizedFeatureName = featureName.toUpperCase();
            // Find the matching enum key, considering case-insensitivity
            const matchingKey = Object.keys(Feature).find(
                (key) => Feature[key as keyof typeof Feature].toUpperCase() === normalizedFeatureName
            );
            if (!matchingKey) {
                throw new Error(`Feature not found: ${featureName}`);
            }
            return Feature[matchingKey as keyof typeof Feature];
        });
    }
    return features;
}

function parseFieldEntries(jsonData: any): FieldConfig[] {
    return jsonData.fields.map((field: any, index: number) => {
        const fieldArrayLength = field.arrayLength === undefined ? 1 : field.arrayLength;
        const entry: FieldConfig = {
            id: field.id,
            permissionId: field.permissionId,
            type: field.type,
            arrayLength: fieldArrayLength,
            visibility: "public",
            key: field.key,
            description: field.description,
            functionConfig: field.functionConfig ? field.functionConfig.toUpperCase() : undefined,
        };
        return entry;
    });
}

function parseFragments(jsonData: any): string[] {
    return jsonData.fragments ? jsonData.fragments as string[] : [];
}