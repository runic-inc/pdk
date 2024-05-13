import { ContractSchema, ContractStorageField } from "../contractSchema";
import { Generator, ind } from "../generator";
import { cleanAndCapitalizeFirstLetter } from "../utils";

export class FieldFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        function generateLoadStoreFunctions(fields: ContractStorageField[]) {
            let loadStoreFunctions = [];
    
            for (let field of fields) {
                // Do not generate for dynamic arrays
                if (field.arrayLength === 0) {
                    continue;
                }
                let capName = cleanAndCapitalizeFirstLetter(field.key);
                const permissionLine = field.permissionId ?
                `if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x${(1 << (field.permissionId - 1)).toString(16)} > 0)) {\n    revert IPatchworkProtocol.NotAuthorized(msg.sender);\n}` :
                `if (!_checkTokenWriteAuth(tokenId)) {\n    revert IPatchworkProtocol.NotAuthorized(msg.sender);\n}`;
                if (field.arrayLength > 1) {
                    let loadArrayLines = [];
                    let storeArrayLines = [];
                    let slot = field.slot;
                    let offset = field.offset;
                    for (let i = 0; i < field.arrayLength; i++) {
                        if (offset >= 256) {
                            offset = 0;
                            slot++;
                            loadArrayLines.push(`slot = _metadataStorage[tokenId][${slot}];`);
                            storeArrayLines.push(`_metadataStorage[tokenId][${slot-1}] = slot;`)
                            storeArrayLines.push(`slot = 0;`);
                        }
                        const shift = offset > 0 ? ` >> ${offset}` : "";
                        if (field.isString) {
                            let conversion = `slot${shift}`;
                            if (field.elementBits < 256) {
                                conversion = `uint${field.elementBits}(${conversion})`;
                            }
                            loadArrayLines.push(`result[${i}] = PatchworkUtils.toString${field.elementBits / 8}(${conversion});`);
                            storeArrayLines.push(`slot = slot | PatchworkUtils.strToUint256(${field.key}[${i}]) >> ${256 - field.elementBits} << ${offset};`);
                        } else {
                            loadArrayLines.push(`result[${i}] = ${field.solidityType}(slot${shift});`);
                            storeArrayLines.push(`slot = slot | uint256(${field.key}[${i}]) << ${offset};`);
                        }
                        
                        // TODO Make an individual item for each array element and join but with the max 8 per line logic
                        // So instead of individual lines we'd have slot = item1 | item2 | item3...
                        offset += field.elementBits;
                    }
                    storeArrayLines.push(`_metadataStorage[tokenId][${slot}] = slot;`)
                    const loadFunction = `` +
                    `// Load Array for ${field.key}\n` +
                    `function load${capName}(uint256 tokenId) public view returns (${field.solidityType}[] memory) {\n` +
                    `    ${field.solidityType}[] memory result = new ${field.solidityType}[](${field.arrayLength});\n` +
                    `    uint256 slot = _metadataStorage[tokenId][${field.slot}];\n` +
                    `    ${loadArrayLines.join("\n    ")}\n` +
                    `    return result;\n` +
                    `}\n`;
        
                    const storeFunction = `` +
                    `// Store Array for ${field.key}\n` +
                    `function store${capName}(uint256 tokenId, ${field.solidityType}[] memory ${field.key}) public {\n` +
                    `${ind(4, permissionLine)}\n` +
                    `    if (${field.key}.length != ${field.arrayLength}) {\n` +
                    `        revert IPatchworkProtocol.BadInputLengths();\n` +
                    `    }\n` +
                    `    uint256 slot = 0;\n` +
                    `    ${storeArrayLines.join("\n    ")}\n` +
                    `}\n`;
        
                    loadStoreFunctions.push(loadFunction);
                    loadStoreFunctions.push(storeFunction);
                } else {
                    const shift = field.offset > 0 ? ` >> ${field.offset}` : "";
                    let loadFunction = `` +
                    `// Load Only ${field.key}\n` +
                    `function load${capName}(uint256 tokenId) public view returns (${field.solidityType}${field.isString ? ` memory` : ``}) {\n` +
                    `    uint256 value = uint256(_metadataStorage[tokenId][${field.slot}])${shift};\n`;
                    if (field.isString) {
                        let value = `value`;
                        if (field.elementBits < 256) {
                            value = `uint${field.elementBits}(${value})`;
                        }
                        loadFunction += `    return PatchworkUtils.toString${field.elementBits / 8}(${value});\n`;
                    } else if (field.fieldTypeSolidityEnum == `ADDRESS`) {
                        loadFunction += `    return address(uint160(value));\n`;
                    } else {
                        loadFunction += `    return ${field.solidityType}(value);\n`;
                    }
                    loadFunction += `}\n`;
                    let storeFunction = `` +
                    `// Store Only ${field.key}\n` +
                    `function store${capName}(uint256 tokenId, ${field.solidityType} ${field.isString ? `memory ` : ``}${field.key}) public {\n` +
                    `${ind(4, permissionLine)}\n`;
                    if (field.elementBits < 256) {
                        let shift = field.offset === 0 ? `` : ` << ${field.offset}`;
                        storeFunction += `    uint256 mask = (1 << ${field.totalBits}) - 1;\n`;
                        storeFunction += `    uint256 cleared = uint256(_metadataStorage[tokenId][${field.slot}]) & ~(mask${shift});\n`;
                        if (field.isString) {
                            storeFunction += `    _metadataStorage[tokenId][${field.slot}] = cleared | (PatchworkUtils.strToUint256(${field.key}) >> ${256 - field.elementBits} & mask)${shift};\n`;
                        } else if (field.fieldTypeSolidityEnum == `ADDRESS`) {
                            storeFunction += `    _metadataStorage[tokenId][${field.slot}] = cleared | (uint256(uint160(${field.key})) & mask)${shift};\n`;
                        } else {
                            storeFunction += `    _metadataStorage[tokenId][${field.slot}] = cleared | (uint256(${field.key}) & mask)${shift};\n`;
                        }                    
                    } else {
                        if (field.isString) {
                            storeFunction += `    _metadataStorage[tokenId][${field.slot}] = PatchworkUtils.strToUint256(${field.key});\n`;
                        } else {
                            storeFunction += `    _metadataStorage[tokenId][${field.slot}] = uint256(${field.key});\n`;
                        }
                    }

                    storeFunction += `}\n`;
                    loadStoreFunctions.push(loadFunction);
                    loadStoreFunctions.push(storeFunction);
                }
            }
    
            return loadStoreFunctions.join("\n");
        }
    
        const loadStoreFunctions = generateLoadStoreFunctions(schema.storage.fields);

        return ind(4, `${loadStoreFunctions}`);
    }
}