// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";

contract LiteRef1 is Patchwork721, PatchworkLiteRef {

    struct Metadata {
        uint64 attributeIDs;
        uint32 counter;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "LiteRef1", "LR1", _manager, _owner)
        PatchworkLiteRef()
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://mything/my-metadata.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function supportsInterface(bytes4 interfaceID) public view virtual override(Patchwork721, PatchworkLiteRef) returns (bool) {
        return Patchwork721.supportsInterface(interfaceID) ||
            PatchworkLiteRef.supportsInterface(interfaceID);
    }

    function storeMetadata(uint256 tokenId, Metadata memory data) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        _metadataStorage[tokenId] = packMetadata(data);
    }

    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    function schema() pure external override returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](2);
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 1, FieldVisibility.PUBLIC, 0, 0, "attributeIDs");
        entries[1] = MetadataSchemaEntry(2, 1, FieldType.UINT32, 1, FieldVisibility.PUBLIC, 0, 64, "counter");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(data.attributeIDs) | uint256(data.counter) << 64;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.attributeIDs = uint64(slot);
        data.counter = uint32(slot >> 64);
        return data;
    }

    // Load Only attributeIDs
    function loadAttributeIDs(uint256 tokenId) public view returns (uint64) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return uint64(value);
    }

    // Store Only attributeIDs
    function storeAttributeIDs(uint256 tokenId, uint64 attributeIDs) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 64) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(attributeIDs) & mask);
    }

    // Load Only counter
    function loadCounter(uint256 tokenId) public view returns (uint32) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 64;
        return uint32(value);
    }

    // Store Only counter
    function storeCounter(uint256 tokenId, uint32 counter) public {
        require(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x1 > 0, "not authorized");
        uint256 mask = (1 << 32) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 64);
        _metadataStorage[tokenId][0] = cleared | (uint256(counter) & mask) << 64;
    }

    function addReference(uint256 tokenId, uint64 liteRef) public override {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 slot = mdStorage[0];
        if (uint64(slot) == 0) {
            mdStorage[0] = slot | uint256(liteRef);
        } else {
            revert("No reference slots available");
        }
    }

    function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert("unsupported metadata Id");
        }
        addReference(tokenId, liteRef);
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs) public override {
        // This will overwrite all ref values starting at slot 0 idx 0
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        require(liteRefs.length <= 1, "too many references");
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        for (uint256 slotIdx = 0; slotIdx < 1; slotIdx++) {
            require(mdStorage[slotIdx] == 0, "already have references");
            uint256 slot = 0;
            for (uint256 refPos = 0; refPos < 4; refPos++) {
                uint256 refIdx = slotIdx * 4 + refPos;
                if (refIdx >= liteRefs.length) {
                    break;
                }
                slot = slot | uint256(liteRefs[refIdx]) << (64 * refPos);
            }
            if (slot != 0) {
                mdStorage[slotIdx] = slot;
            }
        }
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert("unsupported metadata Id");
        }
        addReferenceBatch(tokenId, liteRefs);
    }

    function removeReference(uint256 tokenId, uint64 liteRef) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 nextSlotNumber = 0;
        uint256 curSlotNumber = 0;
        uint256 slot;
        for (uint256 i = 0; i < 1; i++) {
            uint256 subSlotNumber = i % 4;
            if (subSlotNumber == 0) {
                slot = mdStorage[nextSlotNumber];
                nextSlotNumber++;
                curSlotNumber = nextSlotNumber - 1;
            }
            uint256 shift = subSlotNumber * 64;
            if (uint64(slot >> shift) == liteRef) {
                if (subSlotNumber == 0) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000;
                } else if (subSlotNumber == 1) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF;
                } else if (subSlotNumber == 2) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                } else {
                    mdStorage[curSlotNumber] = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                }
                return;
            }
        }
        revert("no reference");
    }

    function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert("unsupported metadata Id");
        }
        removeReference(tokenId, liteRef);
    }

    function loadReferenceAddressAndTokenId(uint256 tokenId, uint256 idx) external view returns (address refAddr, uint256 refTokenId) {
        uint256[] storage slots = _metadataStorage[tokenId];
        uint256 slotNumber = idx / 4;
        uint256 shift = (idx % 4) * 64;
        uint64 attributeId = uint64(slots[slotNumber] >> shift);
        return getReferenceAddressAndTokenId(attributeId);
    }

    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}