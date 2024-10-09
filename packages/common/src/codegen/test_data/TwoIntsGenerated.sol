// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract TwoIntsGenerated is Patchwork721 {

    struct Metadata {
        int16 i16;
        int8 i8;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "TwoInts", "TWOINTS", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://basic.xyz/schema/basic.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://mything/my/";
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
        entries[0] = MetadataSchemaEntry(2, 0, FieldType.INT16, 1, FieldVisibility.PUBLIC, 0, 0, "i16");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.INT8, 1, FieldVisibility.PUBLIC, 0, 16, "i8");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(uint16(data.i16)) | uint256(uint8(data.i8)) << 16;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.i16 = int16(uint16(slot));
        data.i8 = int8(uint8(slot >> 16));
        return data;
    }

    // Load Only i16
    function loadI16(uint256 tokenId) public view returns (int16) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return int16(uint16(value));
    }

    // Store Only i16
    function storeI16(uint256 tokenId, int16 i16) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 16) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(uint16(i16)) & mask);
    }

    // Load Only i8
    function loadI8(uint256 tokenId) public view returns (int8) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 16;
        return int8(uint8(value));
    }

    // Store Only i8
    function storeI8(uint256 tokenId, int8 i8) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 8) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 16);
        _metadataStorage[tokenId][0] = cleared | (uint256(uint8(i8)) & mask) << 16;
    }
}