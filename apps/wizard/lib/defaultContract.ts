import { Feature } from '@/types';
import { nanoid } from 'nanoid';
import { UContractConfig } from '../types';

export default {
    _uid: nanoid(),
    scopeName: 'MyScope',
    name: 'My New Contract',
    symbol: 'MINE',
    baseURI: 'https://mything/my/',
    schemaURI: 'https://mything/my-metadata.json',
    imageURI: 'https://mything/my/{tokenID}.png',
    fields: [],
    features: [Feature.MINTABLE],
} satisfies UContractConfig;
