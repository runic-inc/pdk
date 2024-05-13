import { ContractSchema, ContractStorageField } from "../contractSchema";
import { Generator, ind } from "../generator";

export class PackFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        const packMetadataFunction = generatePackMetadataFunction(schema.storage.fields);

        function generatePackMetadataFunction(entries: ContractStorageField[]) {
            let slots = [];
            for (let slotIdx = 0; slotIdx < schema.storage.slots.length; slotIdx++) {
                let slotEntries: string[] = [];
                for (let fieldIdx = 0; fieldIdx < schema.storage.slots[slotIdx].fieldIDs.length; fieldIdx++) {
                    let fieldID = schema.storage.slots[slotIdx].fieldIDs[fieldIdx];
                    let field = schema.getField(fieldID);
                    if (field.arrayLength === 0) {
                        continue;
                    }
                    let arrayElementsPerSlot = 256 / field.elementBits;
                    let arrayIdxStartInSlot = field.arrayLength == 1 ? 0 : (slotIdx - field.slot) * arrayElementsPerSlot;
                    let arrayIdxEndInSlot = field.arrayLength == 1 ? 1 : arrayIdxStartInSlot + arrayElementsPerSlot;
                    let offsetInSlot = field.slot == slotIdx ? field.offset : 0;
                    for (let arrayIdx = arrayIdxStartInSlot; arrayIdx < arrayIdxEndInSlot; arrayIdx++) {
                        // the starting offset in this slot - if not the starting slot for the field then 0
                        let arrayIdxStr = field.arrayLength > 1 ? `[${arrayIdx}]` : "";
                        let conversion = `data.${field.key}`;
                        if (field.isString) {
                            const stringOffsetBits = 256 - field.elementBits;
                            const stringOffset = stringOffsetBits > 0 ? ` >> ${stringOffsetBits}` : "";
                            conversion = `PatchworkUtils.strToUint256(${conversion}${arrayIdxStr})${stringOffset}`;
                        } else if (field.fieldTypeSolidityEnum == `ADDRESS`) {
                            conversion = `uint256(uint160(${conversion}${arrayIdxStr}))`;
                        } else {
                            conversion = `uint256(${conversion}${arrayIdxStr})`;
                        }
                        if (offsetInSlot > 0 || arrayIdx > 0) {
                            let offset = field.offset + field.elementBits * (arrayIdx % arrayElementsPerSlot);
                            if (offset !== 0) {
                                conversion += ` << ${offset}`;
                            }
                        }
                        slotEntries.push(conversion);
                    }
                }
                // Will run out of stack, max 8
                const maxArrayPerSlot = 8;
                if (slotEntries.length > maxArrayPerSlot) {
                    let index = 0;
                    while (index < slotEntries.length) {
                        const group = slotEntries.slice(index, index + maxArrayPerSlot);
                        if (index === 0) {
                            slots.push(`uint256 slot${slotIdx} = ` + group.join(" | ") + ';');
                        } else if (index + maxArrayPerSlot < slotEntries.length) {
                            slots.push(`slot${slotIdx} = slot${slotIdx} | ` + group.join(" | ") + ';');
                        } else {
                            slots.push(`slots[${slotIdx}] = slot${slotIdx} | ` + group.join(" | ") + ';');
                        }
                        index += maxArrayPerSlot;
                    }
                } else {
                    slots.push(`slots[${slotIdx}] = ` + slotEntries.join(" | ") + ';');
                }
            }
            return `` +
        `function packMetadata(${schema.getMetadataStructName()} memory data) public pure returns (uint256[] memory slots) {\n` +
        ind(4, `slots = new uint256[](${schema.storage.slots.length});\n`) +
        ind(4, `${slots.join("\n")}\n`) +
        ind(4, `return slots;\n`) +
        `}\n`;
        }
    
        function generateUnpackMetadataFunction(entries: ContractStorageField[]) {
            let slotIndex = 0;
            let unpackLines: string[] = [];
    
            function unpackField(field: ContractStorageField, arrayIdx: number) {
                if (field.arrayLength === 0) {
                    return;
                }
                const naiveOffset = field.offset + (field.elementBits * arrayIdx);
                const slot = field.slot + Math.floor((field.offset + ((field.elementBits) * arrayIdx)) / 256);
                const offset = naiveOffset - ((slot - field.slot) * 256);
                if (slot > slotIndex) {
                    slotIndex = slot;
                    unpackLines.push(`slot = slots[${slotIndex}];`);
                }
    
                let arrayIdxStr = field.arrayLength > 1 ? `[${arrayIdx}]` : "";
                let shift = offset === 0 ? `` : ` >> ${offset}`;
    
                if (field.isString) {
                    let strBytes = field.elementBits / 8;
                    let slotExpr = `slot${shift}`;
                    if (field.elementBits != 256) {
                        slotExpr = `uint${field.elementBits}(${slotExpr})`;
                    }
                    unpackLines.push(`data.${field.key}${arrayIdxStr} = PatchworkUtils.toString${strBytes}(${slotExpr});`);
                } else if (field.fieldTypeSolidityEnum == `ADDRESS`) {
                    unpackLines.push(`data.${field.key}${arrayIdxStr} = address(uint160(slot${shift}));`);
                } else {
                    let unpackedValue = `${field.solidityType}(slot${shift})`;
                    unpackLines.push(`data.${field.key}${arrayIdxStr} = ${unpackedValue};`);
                }
            }
    
            unpackLines.push(`uint256 slot = slots[0];`);
            for (let i = 0; i < entries.length; i++) {
                let entry = entries[i];
    
                if (entry.arrayLength > 0) {
                    for (let j = 0; j < entry.arrayLength; j++) {
                        unpackField(entry, j);
                    }
                } else {
                    unpackField(entry, 0);
                }
            }
    
            return `` +
                `function unpackMetadata(uint256[] memory slots) public pure returns (${schema.getMetadataStructName()} memory data) {\n` +
                `    ${unpackLines.join("\n    ")}\n` +
                `    return data;\n` +
                `}\n`;
        }
    
        const unpackMetadataFunction = generateUnpackMetadataFunction(schema.storage.fields);

        return ind(4, `` +
        `${packMetadataFunction}\n` +
        `${unpackMetadataFunction}\n`);
    }
}