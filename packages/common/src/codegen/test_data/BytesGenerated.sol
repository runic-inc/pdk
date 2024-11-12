// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract BytesGenerated is Patchwork721 {

    struct Metadata {
        bytes32 b3;
        bytes16 b2;
        bytes8 b1;
        bytes8[4] b4;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "Bytes", "BYTES", _manager, _owner)
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
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](4);
        entries[0] = MetadataSchemaEntry(3, 0, FieldType.BYTES32, 1, FieldVisibility.PUBLIC, 0, 0, "b3");
        entries[1] = MetadataSchemaEntry(2, 0, FieldType.BYTES16, 1, FieldVisibility.PUBLIC, 1, 0, "b2");
        entries[2] = MetadataSchemaEntry(1, 0, FieldType.BYTES8, 1, FieldVisibility.PUBLIC, 1, 128, "b1");
        entries[3] = MetadataSchemaEntry(4, 0, FieldType.BYTES8, 4, FieldVisibility.PUBLIC, 2, 0, "b4");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](3);
        slots[0] = uint256(data.b3);
        slots[1] = uint256(uint128(data.b2)) | uint256(uint64(data.b1)) << 128;
        slots[2] = uint256(uint64(data.b4[0])) | uint256(uint64(data.b4[1])) << 64 | uint256(uint64(data.b4[2])) << 128 | uint256(uint64(data.b4[3])) << 192;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.b3 = bytes32(slot);
        slot = slots[1];
        data.b2 = bytes16(uint128(slot));
        data.b1 = bytes8(uint64(slot >> 128));
        slot = slots[2];
        data.b4[0] = bytes8(uint64(slot));
        data.b4[1] = bytes8(uint64(slot >> 64));
        data.b4[2] = bytes8(uint64(slot >> 128));
        data.b4[3] = bytes8(uint64(slot >> 192));
        return data;
    }

    // Load Only b3
    function loadB3(uint256 tokenId) public view returns (bytes32) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return bytes32(value);
    }

    // Store Only b3
    function storeB3(uint256 tokenId, bytes32 b3) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId][0] = uint256(b3);
        emit MetadataUpdate(tokenId);
    }

    // Load Only b2
    function loadB2(uint256 tokenId) public view returns (bytes16) {
        uint256 value = uint256(_metadataStorage[tokenId][1]);
        return bytes16(uint128(value));
    }

    // Store Only b2
    function storeB2(uint256 tokenId, bytes16 b2) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask);
        _metadataStorage[tokenId][1] = cleared | (uint256(uint128(b2)) & mask);
        emit MetadataUpdate(tokenId);
    }

    // Load Only b1
    function loadB1(uint256 tokenId) public view returns (bytes8) {
        uint256 value = uint256(_metadataStorage[tokenId][1]) >> 128;
        return bytes8(uint64(value));
    }

    // Store Only b1
    function storeB1(uint256 tokenId, bytes8 b1) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 64) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask << 128);
        _metadataStorage[tokenId][1] = cleared | (uint256(uint64(b1)) & mask) << 128;
        emit MetadataUpdate(tokenId);
    }

    // Load Array for b4
    function loadB4(uint256 tokenId) public view returns (bytes8[] memory) {
        bytes8[] memory result = new bytes8[](4);
        uint256 slot = _metadataStorage[tokenId][2];
        result[0] = bytes8(uint64(slot));
        result[1] = bytes8(uint64(slot >> 64));
        result[2] = bytes8(uint64(slot >> 128));
        result[3] = bytes8(uint64(slot >> 192));
        return result;
    }

    // Store Array for b4
    function storeB4(uint256 tokenId, bytes8[] memory b4) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (b4.length != 4) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(uint64(b4[0])) << 0;
        slot = slot | uint256(uint64(b4[1])) << 64;
        slot = slot | uint256(uint64(b4[2])) << 128;
        slot = slot | uint256(uint64(b4[3])) << 192;
        _metadataStorage[tokenId][2] = slot;
        emit MetadataUpdate(tokenId);
    }
}