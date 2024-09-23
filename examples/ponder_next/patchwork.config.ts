import { Feature, ProjectConfig } from "@patchworkdev/common";

export const config: ProjectConfig = {
    name: "canvas",
    contracts: {
        "Canvas": {
            scopeName: "canvas",
            name: "Canvas",
            symbol: "CANVAS",
            baseURI: "https://canvas.patchwork.dev/",
            schemaURI: "https://canvas.patchwork.dev/schemas/canvas.json",
            imageURI: "https://canvas.patchwork.dev/assets/canvas/{tokenID}",
            fields: [
                {
                    // 0, 0, FieldType.CHAR32, 1, FieldVisibility.PUBLIC, 0, 0, "name"
                    id: 0,
                    key: "name",
                    type: "CHAR32",
                },
                {
                    //1, 0, FieldType.LITEREF, 0, FieldVisibility.PUBLIC, 0, 0, "bubbleRefs"
                    id: 1,
                    key: "bubbleRefs",
                    type: "LITEREF",
                },
            ],
            features: [
                Feature.MINTABLE,
            ],
        },
        "Bubble": {
            scopeName: "canvas",
            name: "Bubble",
            symbol: "BUBBLE",
            baseURI: "https://canvas.patchwork.dev/",
            schemaURI: "https://canvas.patchwork.dev/schemas/bubble.json",
            imageURI: "https://canvas.patchwork.dev/assets/bubble/{tokenID}",
            fields: [
                {
                    // 0, 0, FieldType.UINT256, 1, FieldVisibility.PUBLIC, 0, 0, "sequence"
                    id: 0,
                    key: "sequence",
                    type: "UINT256",

                },
                {
                    // 1, 0, FieldType.CHAR8, 4, FieldVisibility.PUBLIC, 1, 0, "decorations"
                    id: 0,
                    key: "decorations",
                    type: "CHAR8",

                },
                {
                    // 2, 0, FieldType.ADDRESS, 1, FieldVisibility.PUBLIC, 2, 0, "minter"
                    id: 0,
                    key: "minter",
                    type: "ADDRESS",

                }
            ],
            features: [
                Feature.MINTABLE,
            ],
        },
    },
    contractRelations: {
        "Canvas": {
            fragments: ["Bubble"]
        }
    }
    ,
    scopes: [{
        name: "Canvas",
    }]
};