// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkUtils.sol";

contract Basic1 is Patchwork721 {

    struct Metadata {
        string name;
        uint128 fieldu128a;
        uint128 fieldu128b;
        string c8;
        uint32 fieldu32;
        uint16 fieldu16;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "Basic1", "BASIC", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://mything/my-metadata.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function storeMetadata(uint256 tokenId, Metadata memory data) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        _metadataStorage[tokenId] = packMetadata(data);
    }

    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    function schema() pure external override returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](6);
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.CHAR16, 1, FieldVisibility.PUBLIC, 0, 0, "name");
        entries[1] = MetadataSchemaEntry(3, 0, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 0, 128, "fieldu128a");
        entries[2] = MetadataSchemaEntry(4, 0, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 1, 0, "fieldu128b");
        entries[3] = MetadataSchemaEntry(6, 0, FieldType.CHAR8, 1, FieldVisibility.PUBLIC, 1, 128, "c8");
        entries[4] = MetadataSchemaEntry(5, 0, FieldType.UINT32, 1, FieldVisibility.PUBLIC, 1, 192, "fieldu32");
        entries[5] = MetadataSchemaEntry(2, 0, FieldType.UINT16, 1, FieldVisibility.PUBLIC, 1, 224, "fieldu16");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](2);
        slots[0] = PatchworkUtils.strToUint256(data.name) >> 128 | uint256(data.fieldu128a) << 128;
        slots[1] = uint256(data.fieldu128b) | PatchworkUtils.strToUint256(data.c8) >> 192 << 128 | uint256(data.fieldu32) << 192 | uint256(data.fieldu16) << 224;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.name = PatchworkUtils.toString16(uint128(slot));
        data.fieldu128a = uint128(slot >> 128);
        slot = slots[1];
        data.fieldu128b = uint128(slot);
        data.c8 = PatchworkUtils.toString8(uint64(slot >> 128));
        data.fieldu32 = uint32(slot >> 192);
        data.fieldu16 = uint16(slot >> 224);
        return data;
    }

    // Load Only name
    function loadName(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString16(uint128(value));
    }

    // Store Only name
    function storeName(uint256 tokenId, string memory name) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (PatchworkUtils.strToUint256(name) >> 128 & mask);
    }

    // Load Only fieldu128a
    function loadFieldu128a(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 128;
        return uint128(value);
    }

    // Store Only fieldu128a
    function storeFieldu128a(uint256 tokenId, uint128 fieldu128a) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 128);
        _metadataStorage[tokenId][0] = cleared | (uint256(fieldu128a) & mask) << 128;
    }

    // Load Only fieldu128b
    function loadFieldu128b(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][1]);
        return uint128(value);
    }

    // Store Only fieldu128b
    function storeFieldu128b(uint256 tokenId, uint128 fieldu128b) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask);
        _metadataStorage[tokenId][1] = cleared | (uint256(fieldu128b) & mask);
    }

    // Load Only c8
    function loadC8(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][1]) >> 128;
        return PatchworkUtils.toString8(uint64(value));
    }

    // Store Only c8
    function storeC8(uint256 tokenId, string memory c8) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 64) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask << 128);
        _metadataStorage[tokenId][1] = cleared | (PatchworkUtils.strToUint256(c8) >> 192 & mask) << 128;
    }

    // Load Only fieldu32
    function loadFieldu32(uint256 tokenId) public view returns (uint32) {
        uint256 value = uint256(_metadataStorage[tokenId][1]) >> 192;
        return uint32(value);
    }

    // Store Only fieldu32
    function storeFieldu32(uint256 tokenId, uint32 fieldu32) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 32) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask << 192);
        _metadataStorage[tokenId][1] = cleared | (uint256(fieldu32) & mask) << 192;
    }

    // Load Only fieldu16
    function loadFieldu16(uint256 tokenId) public view returns (uint16) {
        uint256 value = uint256(_metadataStorage[tokenId][1]) >> 224;
        return uint16(value);
    }

    // Store Only fieldu16
    function storeFieldu16(uint256 tokenId, uint16 fieldu16) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        uint256 mask = (1 << 16) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask << 224);
        _metadataStorage[tokenId][1] = cleared | (uint256(fieldu16) & mask) << 224;
    }
}