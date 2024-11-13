import { Feature, type ProjectConfig } from '@patchworkdev/common/types';

const projectConfig: ProjectConfig = {
    name: 'myapp',
    contracts: {
        'Word': {
            scopeName: 'myapp',
            name: 'Words',
            symbol: 'WORD',
            baseURI: 'https://www.example.com/',
            schemaURI: 'https://www.example.com/schemas/word.json',
            imageURI: 'https://www.example.com/assets/word/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'word',
                    type: 'char32',
                    description: 'Word',
                },
            ],
            features: [Feature.MINTABLE],
        },
    },
    contractRelations: {},
    scopes: [
        {
            name: 'myapp',
        },
    ],
};

export default projectConfig;
