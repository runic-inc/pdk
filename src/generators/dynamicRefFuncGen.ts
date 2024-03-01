import { ContractSchema } from "../contractSchema";
import { Generator, ind } from "../generator";

export class DynamicRefFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        if (schema.hasLiteRef() && schema.liteRefArrayLength(0) === 0) {
        return ind(4, `
function addReference(uint256 ourTokenId, uint64 liteRef) public override {
    require(_checkTokenWriteAuth(ourTokenId), "not authorized");
    // to append: find last slot, if it's not full, add, otherwise start a new slot.
    DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen == 0) {
        store.slots.push(uint256(liteRef));
        store.idx[liteRef] = 0;
    } else {
        uint256 slot = store.slots[slotsLen-1];
        if (slot >= (1 << 192)) {
            // new slot (pos 1)
            store.slots.push(uint256(liteRef));
            store.idx[liteRef] = slotsLen;
        } else {
            store.idx[liteRef] = slotsLen-1;
            // Reverse search for the next empty subslot
            if (slot >= (1 << 128)) {
                // pos 4
                store.slots[slotsLen-1] = slot | uint256(liteRef) << 192;
            } else if (slot >= (1 << 64)) {
                // pos 3
                store.slots[slotsLen-1] = slot | uint256(liteRef) << 128;
            } else {
                // pos 2
                store.slots[slotsLen-1] = slot | uint256(liteRef) << 64;
            }
        }
    }
}

function addReferenceBatch(uint256 ourTokenId, uint64[] calldata liteRefs) public override {
    require(_checkTokenWriteAuth(ourTokenId), "not authorized");
    // do in batches of 4 with 1 remainder pass
    DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen > 0) {
        revert("already loaded");
    }
    uint256 fullBatchCount = liteRefs.length / 4;
    uint256 remainder = liteRefs.length % 4;
    for (uint256 batch = 0; batch < fullBatchCount; batch++) {
        uint256 refIdx = batch * 4;
        uint256 slot = uint256(liteRefs[refIdx]) | (uint256(liteRefs[refIdx+1]) << 64) | (uint256(liteRefs[refIdx+2]) << 128) | (uint256(liteRefs[refIdx+3]) << 192);
        store.slots.push(slot);
        store.idx[liteRefs[refIdx]] = batch;
        store.idx[liteRefs[refIdx + 1]] = batch;
        store.idx[liteRefs[refIdx + 2]] = batch;
        store.idx[liteRefs[refIdx + 3]] = batch;
    }
    uint256 rSlot;
    for (uint256 i = 0; i < remainder; i++) {
        uint256 idx = (fullBatchCount * 4) + i;
        rSlot = rSlot | (uint256(liteRefs[idx]) << (i * 64));
        store.idx[liteRefs[idx]] = fullBatchCount;
    }
    store.slots.push(rSlot);
}

function removeReference(uint256 ourTokenId, uint64 liteRef) public override {
    require(_checkTokenWriteAuth(ourTokenId), "not authorized");
    DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen == 0) {
        revert("not found");
    }

    uint256 count = getDynamicReferenceCount(ourTokenId);
    if (count == 1) {
        if (store.slots[0] == liteRef) {
            store.slots.pop();
            delete store.idx[liteRef];
        } else {
            revert("not found");
        }
    } else {
        // remember and remove the last ref
        uint256 lastIdx = slotsLen-1;
        uint256 slot = store.slots[lastIdx];
        uint64 lastRef;
        if (slot >= (1 << 192)) {
            // pos 4
            lastRef = uint64(slot >> 192);
            store.slots[lastIdx] = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        } else if (slot >= (1 << 128)) {
            // pos 3
            lastRef = uint64(slot >> 128);
            store.slots[lastIdx] = slot & 0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        } else if (slot >= (1 << 64)) {
            // pos 2
            lastRef = uint64(slot >> 64);
            store.slots[lastIdx] = slot & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF;
        } else {
            // pos 1
            lastRef = uint64(slot);
            store.slots.pop();
        }
        if (lastRef == liteRef) {
            // it was the last ref. No need to replace anything. It's already cleared so just clear the index
            delete store.idx[liteRef];
        } else {
            // Find the ref and replace it with lastRef then update indexes
            uint256 refSlotIdx = store.idx[liteRef];
            slot = store.slots[refSlotIdx];
            if (uint64(slot >> 192) == liteRef) {
                slot = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                slot = slot | (uint256(lastRef) << 192);
            } else if (uint64(slot >> 128) == liteRef) {
                slot = slot & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                slot = slot | (uint256(lastRef) << 128);
            } else if (uint64(slot >> 64) == liteRef) {
                slot = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF;
                slot = slot | (uint256(lastRef) << 64);
            } else if (uint64(slot) == liteRef) {
                slot = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000;
                slot = slot | uint256(lastRef);
            } else {
                revert("storage integrity error");
            }
            store.slots[refSlotIdx] = slot;
            store.idx[lastRef] = refSlotIdx;
            delete store.idx[liteRef];
        }
    }
}

function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert("Unsupported metadata ID");
    }
    addReference(tokenId, liteRef);
}


function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert("Unsupported metadata ID");
    }
    removeReference(tokenId, liteRef);
}

function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert("Unsupported metadata ID");
    }
    addReferenceBatch(tokenId, liteRefs);
}

function loadReferenceAddressAndTokenId(uint256 ourTokenId, uint256 idx) public view returns (address addr, uint256 tokenId) {
    uint256[] storage slots = _dynamicLiterefStorage[ourTokenId].slots;
    uint slotNumber = idx / 4; // integer division will get the correct slot number
    uint shift = (idx % 4) * 64; // the remainder will give the correct shift
    uint64 ref = uint64(slots[slotNumber] >> shift);
    (addr, tokenId) = getReferenceAddressAndTokenId(ref);
}

function getDynamicReferenceCount(uint256 tokenId) public view override returns (uint256 count) {
    DynamicLiteRefs storage store = _dynamicLiterefStorage[tokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen == 0) {
        return 0;
    } else {
        uint256 slot = store.slots[slotsLen-1];
        // You could get rid of this conditional stuff if you had a log function
        if (slot >= (1 << 192)) {
            return slotsLen * 4;
        } else {
            // Reverse search for the next empty subslot
            if (slot >= (1 << 128)) {
                // pos 4
                return (slotsLen-1) * 4 + 3;
            } else if (slot >= (1 << 64)) {
                // pos 3
                return (slotsLen-1) * 4 + 2;
            } else {
                // pos 2
                return (slotsLen-1) * 4 + 1;
            }
        }
    }
}

function loadDynamicReferencePage(uint256 tokenId, uint256 offset, uint256 count) public view override returns (address[] memory addresses, uint256[] memory tokenIds) {
    uint256 refCount = getDynamicReferenceCount(tokenId);
    if (offset >= refCount) {
        return (new address[](0), new uint256[](0));
    }
    uint256 realCount = refCount - offset;
    if (realCount > count) {
        realCount = count;
    }
    addresses = new address[](realCount);
    tokenIds = new uint256[](realCount);
    uint256[] storage slots = _dynamicLiterefStorage[tokenId].slots;
    // start at offset
    for (uint256 i = 0; i < realCount; i++) {
        uint256 idx = offset + i;
        uint slotNumber = idx / 4; // integer division will get the correct slot number
        uint shift = (idx % 4) * 64; // the remainder will give the correct shift
        uint64 ref = uint64(slots[slotNumber] >> shift);
        (address attributeAddress, uint256 attributeTokenId) = getReferenceAddressAndTokenId(ref);
        addresses[i] = attributeAddress;
        tokenIds[i] = attributeTokenId;
    }
}\n\n`);
    };
        return "";
    }
}