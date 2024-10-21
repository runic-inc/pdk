// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract BoolArrayGenerated is Patchwork721 {

    struct Metadata {
        bool[16] b;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "BoolArray", "BARRAY", _manager, _owner)
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
        emit MetadataUpdate(tokenId);
    }

    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    function schema() pure external override returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](1);
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.BOOLEAN, 16, FieldVisibility.PUBLIC, 0, 0, "b");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        uint256 slot0 = uint256(data.b[0] ? 1 : 0) | uint256(data.b[1] ? 1 : 0) << 1 | uint256(data.b[2] ? 1 : 0) << 2 | uint256(data.b[3] ? 1 : 0) << 3 | uint256(data.b[4] ? 1 : 0) << 4 | uint256(data.b[5] ? 1 : 0) << 5 | uint256(data.b[6] ? 1 : 0) << 6 | uint256(data.b[7] ? 1 : 0) << 7;
        slots[0] = slot0 | uint256(data.b[8] ? 1 : 0) << 8 | uint256(data.b[9] ? 1 : 0) << 9 | uint256(data.b[10] ? 1 : 0) << 10 | uint256(data.b[11] ? 1 : 0) << 11 | uint256(data.b[12] ? 1 : 0) << 12 | uint256(data.b[13] ? 1 : 0) << 13 | uint256(data.b[14] ? 1 : 0) << 14 | uint256(data.b[15] ? 1 : 0) << 15;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.b[0] = slot & 1 == 1;
        data.b[1] = slot >> 1 & 1 == 1;
        data.b[2] = slot >> 2 & 1 == 1;
        data.b[3] = slot >> 3 & 1 == 1;
        data.b[4] = slot >> 4 & 1 == 1;
        data.b[5] = slot >> 5 & 1 == 1;
        data.b[6] = slot >> 6 & 1 == 1;
        data.b[7] = slot >> 7 & 1 == 1;
        data.b[8] = slot >> 8 & 1 == 1;
        data.b[9] = slot >> 9 & 1 == 1;
        data.b[10] = slot >> 10 & 1 == 1;
        data.b[11] = slot >> 11 & 1 == 1;
        data.b[12] = slot >> 12 & 1 == 1;
        data.b[13] = slot >> 13 & 1 == 1;
        data.b[14] = slot >> 14 & 1 == 1;
        data.b[15] = slot >> 15 & 1 == 1;
        return data;
    }

    // Load Array for b
    function loadB(uint256 tokenId) public view returns (bool[] memory) {
        bool[] memory result = new bool[](16);
        uint256 slot = _metadataStorage[tokenId][0];
        result[0] = slot & 1 == 1;
        result[1] = slot >> 1 & 1 == 1;
        result[2] = slot >> 2 & 1 == 1;
        result[3] = slot >> 3 & 1 == 1;
        result[4] = slot >> 4 & 1 == 1;
        result[5] = slot >> 5 & 1 == 1;
        result[6] = slot >> 6 & 1 == 1;
        result[7] = slot >> 7 & 1 == 1;
        result[8] = slot >> 8 & 1 == 1;
        result[9] = slot >> 9 & 1 == 1;
        result[10] = slot >> 10 & 1 == 1;
        result[11] = slot >> 11 & 1 == 1;
        result[12] = slot >> 12 & 1 == 1;
        result[13] = slot >> 13 & 1 == 1;
        result[14] = slot >> 14 & 1 == 1;
        result[15] = slot >> 15 & 1 == 1;
        return result;
    }

    // Store Array for b
    function storeB(uint256 tokenId, bool[] memory b) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (b.length != 16) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(b[0] ? 1 : 0) << 0;
        slot = slot | uint256(b[1] ? 1 : 0) << 1;
        slot = slot | uint256(b[2] ? 1 : 0) << 2;
        slot = slot | uint256(b[3] ? 1 : 0) << 3;
        slot = slot | uint256(b[4] ? 1 : 0) << 4;
        slot = slot | uint256(b[5] ? 1 : 0) << 5;
        slot = slot | uint256(b[6] ? 1 : 0) << 6;
        slot = slot | uint256(b[7] ? 1 : 0) << 7;
        slot = slot | uint256(b[8] ? 1 : 0) << 8;
        slot = slot | uint256(b[9] ? 1 : 0) << 9;
        slot = slot | uint256(b[10] ? 1 : 0) << 10;
        slot = slot | uint256(b[11] ? 1 : 0) << 11;
        slot = slot | uint256(b[12] ? 1 : 0) << 12;
        slot = slot | uint256(b[13] ? 1 : 0) << 13;
        slot = slot | uint256(b[14] ? 1 : 0) << 14;
        slot = slot | uint256(b[15] ? 1 : 0) << 15;
        _metadataStorage[tokenId][0] = slot;
        emit MetadataUpdate(tokenId);
    }
}