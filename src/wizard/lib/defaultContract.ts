import { ContractConfig, Feature } from '@/types';

export default {
    scopeName: 'MyScope',
    name: 'My New Contract',
    symbol: 'MINE',
    baseURI: 'https://mything/my/',
    schemaURI: 'https://mything/my-metadata.json',
    imageURI: 'https://mything/my/{tokenID}.png',
    fields: [],
    features: [Feature.MINTABLE],
} satisfies ContractConfig;
