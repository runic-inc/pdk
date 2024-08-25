import { ContractConfig, Feature } from '@/types';
import { nanoid } from 'nanoid';

export default {
    _uid: nanoid(10),
    scopeName: 'MyScope',
    name: 'My New Contract',
    symbol: 'MINE',
    baseURI: 'https://mything/my/',
    schemaURI: 'https://mything/my-metadata.json',
    imageURI: 'https://mything/my/{tokenID}.png',
    fields: [],
    features: [Feature.MINTABLE],
} satisfies ContractConfig;
