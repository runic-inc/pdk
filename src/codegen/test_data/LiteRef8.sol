// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";

contract LiteRef8 is Patchwork721, PatchworkLiteRef {

    error NoReferenceSlotsAvailable();
    error TooManyReferences();
    error NoReference();
    error UnsupportedMetadataId();
    error AlreadyHaveReferences();

    struct Metadata {
        uint32 counter;
        uint64[8] attributeIDs;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "LiteRef8", "LR8", _manager, _owner)
        PatchworkLiteRef()
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://mything/my-metadata.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://mything/my/";
    }

    function supportsInterface(bytes4 interfaceID) public view virtual override(Patchwork721, PatchworkLiteRef) returns (bool) {
        return Patchwork721.supportsInterface(interfaceID) ||
            PatchworkLiteRef.supportsInterface(interfaceID);
    }

    function storeMetadata(uint256 tokenId, Metadata memory data) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId] = packMetadata(data);
    }

    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    function schema() pure external override returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](2);
        entries[0] = MetadataSchemaEntry(2, 1, FieldType.UINT32, 1, FieldVisibility.PUBLIC, 0, 0, "counter");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 8, FieldVisibility.PUBLIC, 1, 0, "attributeIDs");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](3);
        slots[0] = uint256(data.counter);
        slots[1] = uint256(data.attributeIDs[0]) | uint256(data.attributeIDs[1]) << 64 | uint256(data.attributeIDs[2]) << 128 | uint256(data.attributeIDs[3]) << 192;
        slots[2] = uint256(data.attributeIDs[4]) | uint256(data.attributeIDs[5]) << 64 | uint256(data.attributeIDs[6]) << 128 | uint256(data.attributeIDs[7]) << 192;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.counter = uint32(slot);
        slot = slots[1];
        data.attributeIDs[0] = uint64(slot);
        data.attributeIDs[1] = uint64(slot >> 64);
        data.attributeIDs[2] = uint64(slot >> 128);
        data.attributeIDs[3] = uint64(slot >> 192);
        slot = slots[2];
        data.attributeIDs[4] = uint64(slot);
        data.attributeIDs[5] = uint64(slot >> 64);
        data.attributeIDs[6] = uint64(slot >> 128);
        data.attributeIDs[7] = uint64(slot >> 192);
        return data;
    }

    // Load Only counter
    function loadCounter(uint256 tokenId) public view returns (uint32) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return uint32(value);
    }

    // Store Only counter
    function storeCounter(uint256 tokenId, uint32 counter) public {
        if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x1 > 0)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 32) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(counter) & mask);
    }

    // Load Array for attributeIDs
    function loadAttributeIDs(uint256 tokenId) public view returns (uint64[] memory) {
        uint64[] memory result = new uint64[](8);
        uint256 slot = _metadataStorage[tokenId][1];
        result[0] = uint64(slot);
        result[1] = uint64(slot >> 64);
        result[2] = uint64(slot >> 128);
        result[3] = uint64(slot >> 192);
        slot = _metadataStorage[tokenId][2];
        result[4] = uint64(slot);
        result[5] = uint64(slot >> 64);
        result[6] = uint64(slot >> 128);
        result[7] = uint64(slot >> 192);
        return result;
    }

    // Store Array for attributeIDs
    function storeAttributeIDs(uint256 tokenId, uint64[] memory attributeIDs) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (attributeIDs.length != 8) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(attributeIDs[0]) << 0;
        slot = slot | uint256(attributeIDs[1]) << 64;
        slot = slot | uint256(attributeIDs[2]) << 128;
        slot = slot | uint256(attributeIDs[3]) << 192;
        _metadataStorage[tokenId][1] = slot;
        slot = 0;
        slot = slot | uint256(attributeIDs[4]) << 0;
        slot = slot | uint256(attributeIDs[5]) << 64;
        slot = slot | uint256(attributeIDs[6]) << 128;
        slot = slot | uint256(attributeIDs[7]) << 192;
        _metadataStorage[tokenId][2] = slot;
    }

    function addReference(uint256 tokenId, uint64 liteRef) public override {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 slot = mdStorage[1];
        if (uint64(slot) == 0) {
            mdStorage[1] = slot | uint256(liteRef);
        } else if (uint64(slot >> 64) == 0) {
            mdStorage[1] = slot | uint256(liteRef) << 64;
        } else if (uint64(slot >> 128) == 0) {
            mdStorage[1] = slot | uint256(liteRef) << 128;
        } else if (uint64(slot >> 192) == 0) {
            mdStorage[1] = slot | uint256(liteRef) << 192;
        } else {
            slot = mdStorage[2];
            if (uint64(slot) == 0) {
                mdStorage[2] = slot | uint256(liteRef);
            } else if (uint64(slot >> 64) == 0) {
                mdStorage[2] = slot | uint256(liteRef) << 64;
            } else if (uint64(slot >> 128) == 0) {
                mdStorage[2] = slot | uint256(liteRef) << 128;
            } else if (uint64(slot >> 192) == 0) {
                mdStorage[2] = slot | uint256(liteRef) << 192;
            } else {
                revert NoReferenceSlotsAvailable();
            }
        }
    }

    function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        addReference(tokenId, liteRef);
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs) public override {
        // This will overwrite all ref values starting at slot 0 idx 0
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (liteRefs.length > 8) {
            revert TooManyReferences();
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        for (uint256 slotIdx = 1; slotIdx < 3; slotIdx++) {
            if (mdStorage[slotIdx] != 0) {
                revert AlreadyHaveReferences();
            }
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
            revert UnsupportedMetadataId();
        }
        addReferenceBatch(tokenId, liteRefs);
    }

    function removeReference(uint256 tokenId, uint64 liteRef) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 nextSlotNumber = 1;
        uint256 curSlotNumber = 1;
        uint256 slot;
        for (uint256 i = 0; i < 8; i++) {
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
        revert NoReference();
    }

    function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        removeReference(tokenId, liteRef);
    }

    function loadReferenceAddressAndTokenId(uint256 tokenId, uint256 idx) external view returns (address refAddr, uint256 refTokenId) {
        uint256[] storage slots = _metadataStorage[tokenId];
        uint256 slotNumber = 1 + (idx / 4);
        uint256 shift = (idx % 4) * 64;
        uint64 attributeId = uint64(slots[slotNumber] >> shift);
        return getReferenceAddressAndTokenId(attributeId);
    }

    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}