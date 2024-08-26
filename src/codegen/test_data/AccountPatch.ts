import { ContractConfig, Feature, FunctionConfig } from '../../types';

const config: ContractConfig = {
    "_uid": 'testabc',
    "scopeName": "test",
    "name": "AccountPatch",
    "symbol": "AP",
    "baseURI": "https://mything/my/",
    "schemaURI": "https://mything/my-metadata.json",
    "imageURI": "https://mything/my/{tokenID}.png",
    "features": [Feature.ACCOUNTPATCH],
    "fields": [
        {
            "id": 1,
            "key": "name",
            "fieldType": "char32",
            "description": "Name",
            "functionConfig": FunctionConfig.ALL,
        }
    ]
}

export default config;