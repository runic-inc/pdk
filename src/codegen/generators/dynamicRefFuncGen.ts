import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";

export class DynamicRefFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        if (schema.hasLiteRef() && schema.liteRefArrayLength(0) === 0) {
            if (schema.features.includes(Feature.DYNAMICREFLIBRARY)) {
                return ind(4, `
function addReference(uint256 ourTokenId, uint64 liteRef) public override {
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
    PatchworkDynamicRefs.addReference(liteRef, _dynamicLiterefStorage[ourTokenId]);
}

function addReferenceBatch(uint256 ourTokenId, uint64[] calldata liteRefs) public override {
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
    PatchworkDynamicRefs.addReferenceBatch(liteRefs,  _dynamicLiterefStorage[ourTokenId]);
}

function removeReference(uint256 ourTokenId, uint64 liteRef) public override {
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
    PatchworkDynamicRefs.removeReference(liteRef, _dynamicLiterefStorage[ourTokenId]);
}

function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
    }
    addReference(tokenId, liteRef);
}


function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
    }
    removeReference(tokenId, liteRef);
}

function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
    }
    addReferenceBatch(tokenId, liteRefs);
}

function loadReferenceAddressAndTokenId(uint256 ourTokenId, uint256 idx) public view returns (address addr, uint256 tokenId) {
    uint64 ref = PatchworkDynamicRefs.loadRef(idx, _dynamicLiterefStorage[ourTokenId]);
    (addr, tokenId) = getReferenceAddressAndTokenId(ref);
}

function getDynamicReferenceCount(uint256 tokenId) public view override returns (uint256 count) {
    count = PatchworkDynamicRefs.getDynamicReferenceCount(_dynamicLiterefStorage[tokenId]);
}

function loadDynamicReferencePage(uint256 tokenId, uint256 offset, uint256 count) public view override returns (address[] memory addresses, uint256[] memory tokenIds) {
    uint64[] memory refs = PatchworkDynamicRefs.loadRefPage(offset, count, _dynamicLiterefStorage[tokenId]);
    addresses = new address[](refs.length);
    tokenIds = new uint256[](refs.length);
    for (uint256 i = 0; i < refs.length; i++) {
        (address attributeAddress, uint256 attributeTokenId) = getReferenceAddressAndTokenId(refs[i]);
        addresses[i] = attributeAddress;
        tokenIds[i] = attributeTokenId;
    }
}\n\n`);
            } else {
                return ind(4, `
function addReference(uint256 ourTokenId, uint64 liteRef) public override {
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
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
            for (uint256 i = 3; i > 0; i--) {
                if (slot >= (1 << ((i-1) * 64))) {
                    // pos 4 through 2
                    store.slots[slotsLen-1] = slot | uint256(liteRef) << (i*64);
                    break;
                }
            }
        }
    }
}

function addReferenceBatch(uint256 ourTokenId, uint64[] calldata liteRefs) public override {
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
    // do in batches of 4 with 1 remainder pass
    DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen > 0) {
        revert AlreadyLoaded();
    }
    uint256 fullBatchCount = liteRefs.length / 4;
    uint256 remainder = liteRefs.length % 4;
    for (uint256 batch = 0; batch < fullBatchCount; batch++) {
        uint256 refIdx = batch * 4;
        uint256 slot = uint256(liteRefs[refIdx]) | (uint256(liteRefs[refIdx+1]) << 64) | (uint256(liteRefs[refIdx+2]) << 128) | (uint256(liteRefs[refIdx+3]) << 192);
        store.slots.push(slot);
        for (uint256 i = 0; i < 4; i++) {
            store.idx[liteRefs[refIdx + i]] = batch;
        }
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
    if (!_checkTokenWriteAuth(ourTokenId)) {
        revert IPatchworkProtocol.NotAuthorized(msg.sender);
    }
    DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
    uint256 slotsLen = store.slots.length;
    if (slotsLen == 0) {
        revert NotFound();
    }

    uint256 count = getDynamicReferenceCount(ourTokenId);
    if (count == 1) {
        if (store.slots[0] == liteRef) {
            store.slots.pop();
            delete store.idx[liteRef];
        } else {
            revert NotFound();
        }
    } else {
        // remember and remove the last ref
        uint256 lastIdx = slotsLen-1;
        uint256 slot = store.slots[lastIdx];
        uint64 lastRef;

        for (uint256 i = 3; i > 0; i--) {
            uint256 shift = i * 64;
            if (slot >= (1 << shift)) {
                // pos 4 through 2
                lastRef = uint64(slot >> shift);
                uint256 mask = ~uint256(0) >> (256 - shift);
                store.slots[lastIdx] = slot & mask;
                break;
            }
        }
        if (lastRef == 0) {
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
            uint256 oldSlot = slot;
            for (uint256 i = 4; i > 0; i--) {
                uint256 shift = (i-1) * 64;
                if (uint64(slot >> shift) == liteRef) {
                    uint256 mask = ~(uint256(0xFFFFFFFFFFFFFFFF) << shift);
                    slot = (slot & mask) | (uint256(lastRef) << shift);
                    break;
                }
            }
            if (oldSlot == slot) {
                revert StorageIntegrityError();
            }
            store.slots[refSlotIdx] = slot;
            store.idx[lastRef] = refSlotIdx;
            delete store.idx[liteRef];
        }
    }
}

function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
    }
    addReference(tokenId, liteRef);
}


function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
    }
    removeReference(tokenId, liteRef);
}

function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) public override {
    if (targetMetadataId != 0) {
        revert UnsupportedMetadataId();
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
        for (uint256 i = 4; i > 1; i--) {
            uint256 shift = (i-1) * 64;
            if (slot >= (1 << shift)) {
                return (slotsLen-1) * 4 + i;
            }
        }
        return (slotsLen-1) * 4 + 1;
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
    }
        return "";
    }
}