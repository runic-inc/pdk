import { ContractSchema, ContractStorageField, Entry } from "../contractSchema";
import { Generator, ind } from "../generator";

export class StaticRefFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        if (!schema.hasLiteRef()) {
            return "";
        }
        // TODO check all literef fields to find the static ones
        if (schema.liteRefArrayLength(0) === 0) {
            return "";
        }
        function generateAddReferenceFunction(entries: ContractStorageField[]) {
            for (let entry of entries) {
                if (entry.fieldType == "literef") {
                    let addReferenceLines = [];
                    let slot = entry.slot;
                    let offset = entry.offset;
                    let indent = 0;
                    for (let i = 0; i < entry.arrayLength; i++) {
                        const shift = offset > 0 ? ` >> ${offset}` : "";
                        addReferenceLines.push(`if (uint64(slot${shift}) == 0) {\n` +
                        ind(indent*4, `        mdStorage[${slot}] = slot | uint256(liteRef)${shift !== "" ? ` << ${offset}` : ""};\n` +
                        `    }`));
                        offset += entry.elementBits;
                        if (offset >= 256) {
                            offset = 64;
                            slot++;
                            indent = 1;
                            if (i < entry.arrayLength-2) {
                              addReferenceLines.push(`{\n` +
                              `        slot = mdStorage[${slot}];\n` +
                              `        if (uint64(slot) == 0) {\n` +
                              `            mdStorage[${slot}] = slot | uint256(liteRef);\n` +
                              `        }`);
                              i++;
                            }
                        }
                    }
                    let lines = addReferenceLines.join(" else ");
                    let retBlock = `` +
                    `function addReference(uint256 tokenId, uint64 liteRef) public override {\n` +
                    `    if (!_checkTokenWriteAuth(tokenId)) {\n` +
                    `        revert IPatchworkProtocol.NotAuthorized(msg.sender);\n` +
                    `    }\n` +
                    `    uint256[] storage mdStorage = _metadataStorage[tokenId];\n` +
                    `    uint256 slot = mdStorage[${entry.slot}];\n` +
                    `    ${lines} else {\n`;
                    if (indent == 0) {
                        retBlock +=  `        revert NoReferenceSlotsAvailable();\n`;
                    } else {
                        retBlock +=  `            revert NoReferenceSlotsAvailable();\n` +
                        `        }\n`;
                    }
                    retBlock += `` +
                    `    }\n` +
                    `}\n`;
                    return retBlock;
                }
            }
            return "";
        };
        
        function generateAddReferenceBatchFunction(entries: Entry[]) {
            if (schema.hasLiteRef()) {
                let out = `` +
                `function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs) public override {\n` +
                `    // This will overwrite all ref values starting at slot 0 idx 0\n` +
                `    if (!_checkTokenWriteAuth(tokenId)) {\n` +
                `        revert IPatchworkProtocol.NotAuthorized(msg.sender);\n` +
                `    }\n` +
                `    if (liteRefs.length > ${schema.liteRefArrayLength(0)}) {\n` +
                `        revert TooManyReferences();\n` +
                `    }\n`;
                if (schema.liteRefArrayLength(0) == 1) {
                    out += `    addReference(tokenId, liteRefs[0]);\n`;
                } else {
                    out += `    uint256[] storage mdStorage = _metadataStorage[tokenId];\n`;
                    out += `    for (uint256 slotIdx = ${startSlot(0)}; slotIdx < ${endSlot(0)}; slotIdx++) {\n` +
                    `        if (mdStorage[slotIdx] != 0) {\n` +
                    `            revert AlreadyHaveReferences();\n` +
                    `        }\n` +
                    `        uint256 slot = 0;\n` +
                    `        for (uint256 refPos = 0; refPos < 4; refPos++) {\n` +
                    `            uint256 refIdx = slotIdx * 4 + refPos;\n` +
                    `            if (refIdx >= liteRefs.length) {\n` +
                    `                break;\n` +
                    `            }\n` +
                    `            slot = slot | uint256(liteRefs[refIdx]) << (64 * refPos);\n` +
                    `        }\n` +
                    `        if (slot != 0) {\n` +
                    `            mdStorage[slotIdx] = slot;\n` +
                    `        }\n` +
                    `    }\n`;
                }
                out += `}\n`;
                return out;
            } 
            return "";
        }

        const addReferenceFunction = generateAddReferenceFunction(schema.storage.fields);
        `function addReference(uint256 tokenId, uint64 liteRef) external {\n` +
        `}\n`

        const addReferenceDirectFunction = schema.hasLiteRef() ? 
        `function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {\n` +
        `    if (targetMetadataId != 0) {\n` +
        `        revert UnsupportedMetadataId();\n` +
        `    }\n` +
        `    addReference(tokenId, liteRef);\n` +
        `}\n` : "";

        const addReferenceBatchFunction = schema.hasLiteRef() ? generateAddReferenceBatchFunction(schema.storage.fields) : "";

        const addReferenceBatchDirectFunction =
        `function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) external {\n` +
        `    if (targetMetadataId != 0) {\n` +
        `        revert UnsupportedMetadataId();\n` +
        `    }\n` +
        `    addReferenceBatch(tokenId, liteRefs);\n` +
        `}\n`;

        function generateRemoveReferenceFunction() {
            let out = ``;
            if (schema.hasLiteRef()) {
                out += `` +
                `function removeReference(uint256 tokenId, uint64 liteRef) public {\n` +
                `    if (!_checkTokenWriteAuth(tokenId)) {\n` +
                `        revert IPatchworkProtocol.NotAuthorized(msg.sender);\n` +
                `    }\n` +
                `    uint256[] storage mdStorage = _metadataStorage[tokenId];\n`;
                if (schema.liteRefArrayLength(0) == 1) {
                    let slot = schema.liteRefField(0).slot;
                    let shift = ``;
                    let revShift = ``;
                    if (schema.liteRefField(0).offset > 0) {
                        shift = ` >> ${schema.liteRefField(0).offset}`;
                        revShift = ` << ${schema.liteRefField(0).offset}`;
                    }
                    out += `` +
                    `    if (uint64(mdStorage[${slot}]${shift}) == liteRef) {\n` +
                    `        uint256 mask = (1 << 64) - 1;\n` +
                    `        uint256 cleared = uint256(mdStorage[${slot}]) & ~(mask${revShift});\n` +
                    `        mdStorage[${slot}] = cleared;\n` +
                    `        return;\n` +
                    `    }\n`;
                } else {
                    out += `` +
                    `    uint256 nextSlotNumber = ${schema.liteRefSlotNumber(0)};\n` +
                    `    uint256 curSlotNumber = ${schema.liteRefSlotNumber(0)};\n` +
                    `    uint256 slot;\n` +
                    `    for (uint256 i = 0; i < ${schema.liteRefArrayLength(0)}; i++) {\n` +
                    `        uint256 subSlotNumber = i % 4;\n` +
                    `        if (subSlotNumber == 0) {\n` +
                    `            slot = mdStorage[nextSlotNumber];\n` +
                    `            nextSlotNumber++;\n` +
                    `            curSlotNumber = nextSlotNumber - 1;\n` +
                    `        }\n` +
                    `        uint256 shift = subSlotNumber * 64;\n` +
                    `        if (uint64(slot >> shift) == liteRef) {\n` +
                    `            if (subSlotNumber == 0) {\n` +
                    `                mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000;\n` +
                    `            } else if (subSlotNumber == 1) {\n` +
                    `                mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF;\n` +
                    `            } else if (subSlotNumber == 2) {\n` +
                    `                mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;\n` +
                    `            } else {\n` +
                    `                mdStorage[curSlotNumber] = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;\n` +
                    `            }\n` +
                    `            return;\n` +
                    `        }\n` +
                    `    }\n`;
                }
                out +=  `    revert NoReference();\n`;
                out += `}\n`;
            }
            return out;
        }

        const removeReferenceFunction = generateRemoveReferenceFunction();

        const removeReferenceDirectFunction = schema.hasLiteRef() ? `` +
        `function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {\n` +
        `    if (targetMetadataId != 0) {\n` +
        `        revert UnsupportedMetadataId();\n` +
        `    }\n` +
        `    removeReference(tokenId, liteRef);\n` +
        `}\n` : "";

        function generateLoadReferenceAndTokenIdFunction() {
            const _startSlot = startSlot(0) == 0 ? "idx / 4" : startSlot(0) + " + (idx / 4)";
            if (schema.hasLiteRef()) {
                return `` +
                `function loadReferenceAddressAndTokenId(uint256 tokenId, uint256 idx) external view returns (address refAddr, uint256 refTokenId) {\n` +
                `    uint256[] storage slots = _metadataStorage[tokenId];\n` +
                `    uint256 slotNumber = ${_startSlot};\n` +
                `    uint256 shift = (idx % 4) * 64;\n` +
                `    uint64 attributeId = uint64(slots[slotNumber] >> shift);\n` +
                `    return getReferenceAddressAndTokenId(attributeId);\n` +
                `}\n`;
            } else {
                return "";
            }
        }
        const loadReferenceAddressAndTokenIdFunction = generateLoadReferenceAndTokenIdFunction();

        function startSlot(which: number) {
            return schema.liteRefSlotNumber(which);
        }

        function endSlot(which: number) {
            return startSlot(which) + Math.ceil(schema.liteRefArrayLength(0) / 4);
        }

        return ind(4, `\n` +
        `${addReferenceFunction}\n` +
        `${addReferenceDirectFunction}\n` +
        `${addReferenceBatchFunction}\n` +
        `${addReferenceBatchDirectFunction}\n` +
        `${removeReferenceFunction}\n` +
        `${removeReferenceDirectFunction}\n` +
        `${loadReferenceAddressAndTokenIdFunction}\n`);
    }
}