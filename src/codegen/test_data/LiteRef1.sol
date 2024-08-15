// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";

contract LiteRef1 is Patchwork721, PatchworkLiteRef {

    error NoReferenceSlotsAvailable();
    error TooManyReferences();
    error NoReference();
    error UnsupportedMetadataId();

    struct Metadata {
        uint128 counter;
        uint64 attributeIDs;
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
        entries[0] = MetadataSchemaEntry(2, 1, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 0, 0, "counter");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 1, FieldVisibility.PUBLIC, 0, 128, "attributeIDs");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(data.counter) | uint256(data.attributeIDs) << 128;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.counter = uint128(slot);
        data.attributeIDs = uint64(slot >> 128);
        return data;
    }

    // Load Only counter
    function loadCounter(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return uint128(value);
    }

    // Store Only counter
    function storeCounter(uint256 tokenId, uint128 counter) public {
        if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x1 > 0)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(counter) & mask);
    }

    // Load Only attributeIDs
    function loadAttributeIDs(uint256 tokenId) public view returns (uint64) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 128;
        return uint64(value);
    }

    // Store Only attributeIDs
    function storeAttributeIDs(uint256 tokenId, uint64 attributeIDs) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 64) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 128);
        _metadataStorage[tokenId][0] = cleared | (uint256(attributeIDs) & mask) << 128;
    }

    function addReference(uint256 tokenId, uint64 liteRef) public override {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 slot = mdStorage[0];
        if (uint64(slot >> 128) == 0) {
            mdStorage[0] = slot | uint256(liteRef) << 128;
        } else {
            revert NoReferenceSlotsAvailable();
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
        if (liteRefs.length > 1) {
            revert TooManyReferences();
        }
        addReference(tokenId, liteRefs[0]);
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
        if (uint64(mdStorage[0] >> 128) == liteRef) {
            uint256 mask = (1 << 64) - 1;
            uint256 cleared = uint256(mdStorage[0]) & ~(mask << 128);
            mdStorage[0] = cleared;
            return;
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
        uint256 slotNumber = idx / 4;
        uint256 shift = (idx % 4) * 64;
        uint64 attributeId = uint64(slots[slotNumber] >> shift);
        return getReferenceAddressAndTokenId(attributeId);
    }

    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}