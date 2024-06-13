import { ContractConfig, ContractSchema, ContractSchemaImpl } from "./contractSchema";

describe('contractSchemas', () => {
    it(`should do defaults with no fields or features`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.scopeName).toEqual(config.scopeName);
        expect(schema.name).toEqual(config.name);
        expect(schema.symbol).toEqual(config.symbol);
        expect(schema.schemaURI).toEqual(config.schemaURI);
        expect(schema.imageURI).toEqual(config.imageURI);
    });

    it(`should leave well ordered fields in place`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [
                {id: 1, permissionId: 0, fieldType: "char32", arrayLength: 1, visibility: "public", key: "name", description: ""},
                {id: 2, permissionId: 0, fieldType: "uint128", arrayLength: 1, visibility: "public", key: "count", description: ""},
            ],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.storage.fields.length).toEqual(2);
        expect(schema.storage.slots.length).toEqual(2);
        expect(schema.storage.fields[0].key).toEqual("name");
        expect(schema.storage.fields[1].key).toEqual("count");
        expect(schema.storage.slots[0].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[0].fieldIDs).toEqual([1]);
        expect(schema.storage.slots[1].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[1].fieldIDs).toEqual([2]);
    });

    it(`should reorder fields`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [
                {id: 1, permissionId: 0, fieldType: "uint16", arrayLength: 1, visibility: "public", key: "little", description: ""},
                {id: 2, permissionId: 0, fieldType: "uint128", arrayLength: 1, visibility: "public", key: "count", description: ""},
                {id: 3, permissionId: 0, fieldType: "char32", arrayLength: 1, visibility: "public", key: "name", description: ""},
            ],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.storage.fields.length).toEqual(3);
        expect(schema.storage.slots.length).toEqual(2);
        expect(schema.storage.fields[0].key).toEqual("name");
        expect(schema.storage.fields[1].key).toEqual("count");
        expect(schema.storage.fields[2].key).toEqual("little");
        expect(schema.storage.slots[0].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[0].fieldIDs).toEqual([3]);
        expect(schema.storage.slots[1].fieldIDs.length).toEqual(2);
        expect(schema.storage.slots[1].fieldIDs).toEqual([2, 1]);
    });

    it(`should pack fields well`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [
                {id: 1, permissionId: 0, fieldType: "uint256", arrayLength: 1, visibility: "public", key: "k1", description: ""},
                {id: 2, permissionId: 0, fieldType: "uint128", arrayLength: 1, visibility: "public", key: "k2", description: ""},
                {id: 3, permissionId: 0, fieldType: "uint64", arrayLength: 1, visibility: "public", key: "k3", description: ""},
                {id: 4, permissionId: 0, fieldType: "uint32", arrayLength: 1, visibility: "public", key: "k4", description: ""},
                {id: 5, permissionId: 0, fieldType: "uint16", arrayLength: 1, visibility: "public", key: "k5", description: ""},
                {id: 6, permissionId: 0, fieldType: "uint8", arrayLength: 1, visibility: "public", key: "k6", description: ""},
                {id: 7, permissionId: 0, fieldType: "uint8", arrayLength: 1, visibility: "public", key: "k7", description: ""},
            ],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.storage.fields.length).toEqual(7);
        expect(schema.storage.slots.length).toEqual(2);
        expect(schema.storage.fields[0].key).toEqual("k1");
        expect(schema.storage.fields[1].key).toEqual("k2");
        expect(schema.storage.fields[2].key).toEqual("k3");
        expect(schema.storage.fields[3].key).toEqual("k4");
        expect(schema.storage.fields[4].key).toEqual("k5");
        expect(schema.storage.fields[5].key).toEqual("k6");
        expect(schema.storage.fields[6].key).toEqual("k7");
        expect(schema.storage.slots[0].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[0].fieldIDs).toEqual([1]);
        expect(schema.storage.slots[1].fieldIDs.length).toEqual(6);
        expect(schema.storage.slots[1].fieldIDs).toEqual([2, 3, 4, 5, 6, 7]);
    });

    it(`should start static arrays at 0 even if they fit`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [
                {id: 1, permissionId: 0, fieldType: "uint128", arrayLength: 1, visibility: "public", key: "count", description: ""},
                {id: 2, permissionId: 0, fieldType: "uint16", arrayLength: 4, visibility: "public", key: "arr", description: ""},
            ],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.storage.fields.length).toEqual(2);
        expect(schema.storage.slots.length).toEqual(2);
        expect(schema.storage.fields[0].key).toEqual("count");
        expect(schema.storage.fields[1].key).toEqual("arr");
        expect(schema.storage.slots[0].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[0].fieldIDs).toEqual([1]);
        expect(schema.storage.slots[1].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[1].fieldIDs).toEqual([2]);
    });

    it(`should arrange arrays to the end`, () => {
        let config: ContractConfig = {
            scopeName: "test",
            name: "aname",
            symbol: "SYM",
            baseURI: "https://testthing.xyz",
            schemaURI: "https://testthing.xyz",
            imageURI: "https://testthing.xyz/images",
            fields: [
                {id: 2, permissionId: 0, fieldType: "uint16", arrayLength: 4, visibility: "public", key: "arr", description: ""},
                {id: 1, permissionId: 0, fieldType: "uint128", arrayLength: 1, visibility: "public", key: "count", description: ""},
            ],
            features: []
        }
        let schema: ContractSchema = new ContractSchemaImpl(config);
        expect(schema.storage.fields.length).toEqual(2);
        expect(schema.storage.slots.length).toEqual(2);
        expect(schema.storage.fields[0].key).toEqual("count");
        expect(schema.storage.fields[1].key).toEqual("arr");
        expect(schema.storage.slots[0].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[0].fieldIDs).toEqual([1]);
        expect(schema.storage.slots[1].fieldIDs.length).toEqual(1);
        expect(schema.storage.slots[1].fieldIDs).toEqual([2]);
    });

    // TODO should handle char64
    // TODO secondary order fill gaps
    // TODO add group ID option (must be 256 bits or below)

    // TODO codegen should:
    // -- for field, get the field, get the slot, make masks and stuff to do the whole slot
    // -- for packer, just go slot by slot and pack up each field.
});