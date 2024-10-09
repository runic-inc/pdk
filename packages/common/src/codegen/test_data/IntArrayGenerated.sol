// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract IntArrayGenerated is Patchwork721 {

    struct Metadata {
        int8[8] i8;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "IntArray", "IARRAY", _manager, _owner)
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
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](1);
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.INT8, 8, FieldVisibility.PUBLIC, 0, 0, "i8");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(uint8(data.i8[0])) | uint256(uint8(data.i8[1])) << 8 | uint256(uint8(data.i8[2])) << 16 | uint256(uint8(data.i8[3])) << 24 | uint256(uint8(data.i8[4])) << 32 | uint256(uint8(data.i8[5])) << 40 | uint256(uint8(data.i8[6])) << 48 | uint256(uint8(data.i8[7])) << 56;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.i8[0] = int8(uint8(slot));
        data.i8[1] = int8(uint8(slot >> 8));
        data.i8[2] = int8(uint8(slot >> 16));
        data.i8[3] = int8(uint8(slot >> 24));
        data.i8[4] = int8(uint8(slot >> 32));
        data.i8[5] = int8(uint8(slot >> 40));
        data.i8[6] = int8(uint8(slot >> 48));
        data.i8[7] = int8(uint8(slot >> 56));
        return data;
    }

    // Load Array for i8
    function loadI8(uint256 tokenId) public view returns (int8[] memory) {
        int8[] memory result = new int8[](8);
        uint256 slot = _metadataStorage[tokenId][0];
        result[0] = int8(uint8(slot));
        result[1] = int8(uint8(slot >> 8));
        result[2] = int8(uint8(slot >> 16));
        result[3] = int8(uint8(slot >> 24));
        result[4] = int8(uint8(slot >> 32));
        result[5] = int8(uint8(slot >> 40));
        result[6] = int8(uint8(slot >> 48));
        result[7] = int8(uint8(slot >> 56));
        return result;
    }

    // Store Array for i8
    function storeI8(uint256 tokenId, int8[] memory i8) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (i8.length != 8) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(uint8(i8[0])) << 0;
        slot = slot | uint256(uint8(i8[1])) << 8;
        slot = slot | uint256(uint8(i8[2])) << 16;
        slot = slot | uint256(uint8(i8[3])) << 24;
        slot = slot | uint256(uint8(i8[4])) << 32;
        slot = slot | uint256(uint8(i8[5])) << 40;
        slot = slot | uint256(uint8(i8[6])) << 48;
        slot = slot | uint256(uint8(i8[7])) << 56;
        _metadataStorage[tokenId][0] = slot;
    }
}