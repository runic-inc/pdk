import { ContractConfig, Feature, FieldConfig, FieldType, FunctionConfig, ValidNameIdentifier, Visibility } from '../types';

export type ContractFieldType = {
    solidityType: string;
    name: string;
    bits: number;
    isString: boolean;
};

export class ContractStorageField implements FieldConfig {
    // from Entry
    id!: number;
    permissionId!: number;
    type!: FieldType;
    arrayLength!: number;
    visibility!: Visibility;
    key!: string;
    description!: string;
    functionConfig!: FunctionConfig;
    // calculated
    solidityType!: string;
    fieldTypeSolidityEnum!: string;
    slot!: number;
    isString!: boolean;
    elementBits!: number;
    totalBits!: number;
    offset!: number;
}

export class ContractStorageSlot {
    fieldIDs: number[] = [];
}

export class ContractStorage {
    slots: ContractStorageSlot[] = [];
    fields: ContractStorageField[] = [];
}

export interface ContractSchema extends ContractConfig {
    features: Feature[];
    storage: ContractStorage;
    hasLiteRef(): boolean;
    getMetadataStructName(): string;
    liteRefField(which: number): ContractStorageField;
    liteRefFieldCount(): number;
    liteRefArrayLength(which: number): number;
    liteRefSlotNumber(which: number): number;
    validate(): any;
    slots(): number;
    getField(fieldID: number): ContractStorageField;
}

// ContractConfig from user or file ->> ContractSchemaImpl
export class ContractSchemaImpl implements ContractSchema {
    scopeName!: string;
    name!: ValidNameIdentifier;
    symbol!: string;
    baseURI!: string;
    schemaURI!: string;
    imageURI!: string;
    fields!: FieldConfig[];
    features!: Feature[];
    fragments!: string[];
    storage: ContractStorage;

    constructor(config: ContractConfig) {
        this.scopeName = config.scopeName;
        this.name = config.name;
        this.symbol = config.symbol;
        this.baseURI = config.baseURI;
        this.schemaURI = config.schemaURI;
        this.imageURI = config.imageURI;
        this.fields = config.fields;
        this.features = config.features || [];
        this.fragments = config.fragments || [];
        this.storage = this.buildStorage(config.fields);
    }

    orderFieldsPacked(origFields: ContractStorageField[]): ContractStorageField[] {
        let fields = origFields.map((x) => x);
        fields.sort((a: ContractStorageField, b: ContractStorageField) => {
            // sort static arrays to the end so that other fields can pack easily before we start needing 0 offsets
            if (a.arrayLength > 1 && b.arrayLength == 1) {
                return 1;
            }
            if (a.arrayLength == 1 && b.arrayLength > 1) {
                return -1;
            }
            if (a.totalBits >= 256 && b.totalBits >= 256) {
                return 0;
            }
            return b.totalBits - a.totalBits;
        });
        let newFields: ContractStorageField[] = [];
        while (fields.length > 0) {
            let curSlotRemainder = 256;
            let spliceList = [];
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                if (curSlotRemainder >= field.totalBits || (field.totalBits > 256 && curSlotRemainder == 256)) {
                    newFields.push(field);
                    // mark for removal
                    spliceList.push(i);
                    curSlotRemainder -= field.totalBits;
                    if (curSlotRemainder == 0) {
                        // this slot is fully packed.
                        // stop here so we start back at the largest fields for the next iteration.
                        break;
                    }
                }
            }
            spliceList.reverse();
            for (let idx of spliceList) {
                fields.splice(idx, 1);
            }
        }
        return newFields;
    }

    buildStorage(rawEntries: FieldConfig[]): ContractStorage {
        // work on a copy to leave the original config alone, only storage will represent augmentation
        let entries: FieldConfig[] = [...rawEntries];
        // console.log(entries);
        let highestID = 0;
        let staticCount = 0;
        // count static entries
        for (let i = 0; i < entries.length; i++) {
            const arrayLength = entries[i].arrayLength;
            if ((arrayLength === undefined || arrayLength > 0) && entries[i].type !== 'string') {
                staticCount++;
            }
            if (entries[i].id > highestID) {
                highestID = entries[i].id;
            }
        }
        if (staticCount === 0) {
            entries.push({
                id: highestID + 1,
                permissionId: 0,
                type: 'uint256',
                arrayLength: 1,
                visibility: 'public',
                key: 'reserved',
                description: 'Reserved',
                functionConfig: FunctionConfig.NONE,
            });
        }
        let fields: ContractStorageField[] = entries.map((entry: FieldConfig, index: number) => {
            const fieldTypeEnum = this.getFieldTypeEnum(entry.type);
            const fieldArrayLength = entry.arrayLength === undefined ? 1 : entry.arrayLength;
            let bits = fieldTypeEnum.bits * fieldArrayLength;
            let elementBits = fieldTypeEnum.bits;
            // Address arrays have bad alignment so we will waste space to avoid 2-slot IO
            if (entry.type === 'address' && fieldArrayLength > 1) {
                bits = 256 * fieldArrayLength;
                elementBits = 256;
            }

            const field: ContractStorageField = {
                id: entry.id,
                permissionId: entry.permissionId || 0,
                solidityType: fieldTypeEnum.solidityType,
                type: entry.type,
                fieldTypeSolidityEnum: fieldTypeEnum.name,
                arrayLength: fieldArrayLength,
                visibility: 'public',
                isString: fieldTypeEnum.isString,
                elementBits: elementBits,
                totalBits: bits,
                key: entry.key,
                slot: -1,
                offset: -1,
                description: entry.description || '',
                functionConfig: entry.functionConfig || FunctionConfig.ALL,
            };
            return field;
        });

        let hasDynString = false;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].type === 'string') {
                if (hasDynString) {
                    throw new Error('Only one dynamic string field is currently supported in PDK.');
                }
                hasDynString = true;
            }
        }
        let hasLiteRef = false;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].type === 'literef') {
                if (hasLiteRef) {
                    throw new Error('Only one field of literefs is currently supported in PDK.');
                }
                hasLiteRef = true;
            }
        }
        fields = this.orderFieldsPacked(fields);

        let slots: ContractStorageSlot[] = [];
        let slot = new ContractStorageSlot();
        slots.push(slot);
        let slotNumber = 0;
        let offset = 0;

        function nextSlot() {
            slot = new ContractStorageSlot();
            slots.push(slot);
            slotNumber += Math.floor(offset / 256);
            offset = offset % 256;
        }
        fields = fields.map((field: ContractStorageField, index: number) => {
            if (field.arrayLength == 0) {
                field.slot = 0;
                field.offset = 0;
            } else if (field.arrayLength > 1) {
                if (offset > 0) {
                    offset = 256;
                    nextSlot();
                }
                field.slot = slotNumber;
                field.offset = 0;
            } else {
                if (offset > 0 && offset + field.totalBits > 256) {
                    // This field would span starting at a non-0 offset over another slot which is unsupported
                    // leave the rest of the slot empty and move on to the next.
                    offset = 256;
                    nextSlot();
                }
                field.slot = slotNumber;
                field.offset = offset;
            }
            slot.fieldIDs.push(field.id);
            // how many more slots this spans
            let slotSpan = Math.floor(field.totalBits / 256);
            let bitsUsedThisSlot = field.totalBits;
            if (slotSpan > 1) {
                for (let i = 0; i < slotSpan - 1; i++) {
                    nextSlot();
                    slot.fieldIDs.push(field.id);
                }
                bitsUsedThisSlot = field.totalBits - (slotSpan - 1) * 256;
            }

            // skip this if there aren't more bits later
            if (index < entries.length - 1 && fields[index + 1].totalBits > 0) {
                offset += bitsUsedThisSlot;
                if (offset >= 256) {
                    nextSlot();
                }
            }
            return field;
        });
        return { slots: slots, fields: fields };
    }

    hasLiteRef(): boolean {
        return this.fields.some((field: any) => field.type === 'literef');
    }

    getMetadataStructName(): string {
        return `Metadata`;
    }

    liteRefField(which: number): ContractStorageField {
        const liteRefFields = this.storage.fields.filter((field: any) => field.fieldTypeSolidityEnum === 'LITEREF');
        return liteRefFields[which];
    }

    liteRefFieldCount(): number {
        // Count fields where type is "literef"
        return this.storage.fields.filter((field: any) => field.fieldTypeSolidityEnum === 'LITEREF').length;
    }

    liteRefArrayLength(which: number): number {
        // Filter fields by type "literef" and find by index
        const liteRefField = this.liteRefField(which);
        return liteRefField ? liteRefField.arrayLength : 0;
    }

    liteRefSlotNumber(which: number): number {
        // Filter fields by type "literef" and find by index
        const liteRefField = this.liteRefField(which);
        return liteRefField ? liteRefField.slot : 0;
    }

    validate() {
        const patchTypes = [Feature.PATCH, Feature['1155PATCH'], Feature.ACCOUNTPATCH];
        const patchTypeCount = this.features.filter((feature) => patchTypes.includes(feature)).length;
        if (patchTypeCount > 1) {
            throw new Error('PATCH, 1155PATCH, and ACCOUNTPATCH are mutually exclusive.');
        }
        const fragmentTypes = [Feature.FRAGMENTMULTI, Feature.FRAGMENTSINGLE];
        const fragmentTypeCount = this.features.filter((feature) => fragmentTypes.includes(feature)).length;
        if (fragmentTypeCount > 1) {
            throw new Error('FRAGMENTMULTI and FRAGMENTSINGLE are mutually exclusive.');
        }
        const hasReversible = this.features.includes(Feature.REVERSIBLE);
        if (hasReversible && patchTypeCount === 0) {
            throw new Error('REVERSIBLE feature requires at least one of PATCH, 1155PATCH, or ACCOUNTPATCH to be present.');
        }
        const hasWeakRef = this.features.includes(Feature.WEAKREF);
        if (hasWeakRef && !this.features.includes(Feature.FRAGMENTSINGLE)) {
            throw new Error('WEAKREF feature requires FRAGMENTSINGLE feature');
        }
        if (this.features.includes(Feature.DYNAMICREFLIBRARY)) {
            if (!(this.hasLiteRef() && this.liteRefArrayLength(0) === 0)) {
                throw new Error('DYNAMICREFLIBRARY feature requires a dynamic array length literef field');
            }
        }
    }

    slots(): number {
        return this.storage.slots.length;
    }

    getField(fieldID: number): ContractStorageField {
        for (let i = 0; i < this.storage.fields.length; i++) {
            if (this.storage.fields[i].id == fieldID) {
                return this.storage.fields[i];
            }
        }
        throw Error('No field with ID ' + fieldID);
    }

    getFieldTypeEnum(name: string) {
        const fieldTypeMap: Record<string, ContractFieldType> = {
            bool: { solidityType: 'bool', name: 'BOOLEAN', bits: 1, isString: false },
            int8: { solidityType: 'int8', name: 'INT8', bits: 8, isString: false },
            int16: { solidityType: 'int16', name: 'INT16', bits: 16, isString: false },
            int32: { solidityType: 'int32', name: 'INT32', bits: 32, isString: false },
            int64: { solidityType: 'int64', name: 'INT64', bits: 64, isString: false },
            int128: { solidityType: 'int128', name: 'INT128', bits: 128, isString: false },
            int256: { solidityType: 'int256', name: 'INT256', bits: 256, isString: false },
            uint8: { solidityType: 'uint8', name: 'UINT8', bits: 8, isString: false },
            uint16: { solidityType: 'uint16', name: 'UINT16', bits: 16, isString: false },
            uint32: { solidityType: 'uint32', name: 'UINT32', bits: 32, isString: false },
            uint64: { solidityType: 'uint64', name: 'UINT64', bits: 64, isString: false },
            uint128: { solidityType: 'uint128', name: 'UINT128', bits: 128, isString: false },
            uint256: { solidityType: 'uint256', name: 'UINT256', bits: 256, isString: false },
            char8: { solidityType: 'string', name: 'CHAR8', bits: 64, isString: true },
            char16: { solidityType: 'string', name: 'CHAR16', bits: 128, isString: true },
            char32: { solidityType: 'string', name: 'CHAR32', bits: 256, isString: true },
            char64: { solidityType: 'string', name: 'CHAR64', bits: 512, isString: true },
            bytes8: { solidityType: 'bytes8', name: 'BYTES8', bits: 64, isString: false },
            bytes16: { solidityType: 'bytes16', name: 'BYTES16', bits: 128, isString: false },
            bytes32: { solidityType: 'bytes32', name: 'BYTES32', bits: 256, isString: false },
            literef: { solidityType: 'uint64', name: 'LITEREF', bits: 64, isString: false },
            address: { solidityType: 'address', name: 'ADDRESS', bits: 160, isString: false },
            string: { solidityType: 'string', name: 'STRING', bits: 0, isString: true },
        };

        const fieldType = fieldTypeMap[name];

        if (!fieldType) {
            throw new Error(`Unknown field type: ${name}`);
        }
        if (fieldType.name === 'CHAR64') {
            throw new Error('CHAR64 is not currently supported in the pdk. Consider using the dynamic type string instead.');
        }

        return fieldType;
    }
}
