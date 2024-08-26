import { ContractConfig, Feature, FunctionConfig } from '../../types';

// TODO support field functionConfig
const config: ContractConfig = {
    "_uid": "testarrays",
    "scopeName": "test",
    "name": "Arrays",
    "symbol": "ARRAYS",
    "baseURI": "https://mything/my/",
    "schemaURI": "https://mything/my-metadata.json",
    "imageURI": "https://mything/my/{tokenID}.png",
    "fields": [
        {
            "id": 1,
            "key": "names",
            "fieldType": "char8",
            "arrayLength": 4,
            "description": "Names"
        },
        {
            "id": 2,
            "key": "u16array",
            "fieldType": "uint16",
            "arrayLength": 32,
            "description": "Uint16 array"
        },
        {
            "id": 3,
            "key": "fieldu128a",
            "fieldType": "uint128",
            "description": "Some Uint128",
            "permissionId": 1,
            "functionConfig": FunctionConfig.STORE,
        },
        {
            "id": 4,
            "key": "fieldu128b",
            "fieldType": "uint128",
            "description": "Some Uint128",
            "permissionId": 2,
            "functionConfig": FunctionConfig.ALL,
        },
        {
            "id": 5,
            "key": "fieldu32",
            "fieldType": "uint32",
            "description": "Some Uint32",
            "permissionId": 3,
            "functionConfig": FunctionConfig.NONE,
        },
        {
            "id": 6,
            "key": "c8",
            "fieldType": "char8",
            "description": "c8",
            "functionConfig": FunctionConfig.LOAD,
        }
    ]
}

export default config;