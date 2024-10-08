// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract TwoBoolsGenerated is Patchwork721 {

    struct Metadata {
        bool b1;
        bool b2;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "TwoBools", "TWOBOOLS", _manager, _owner)
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
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.BOOLEAN, 1, FieldVisibility.PUBLIC, 0, 0, "b1");
        entries[1] = MetadataSchemaEntry(2, 0, FieldType.BOOLEAN, 1, FieldVisibility.PUBLIC, 0, 1, "b2");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(data.b1 == true ? 1 : 0) | uint256(data.b2 == true ? 1 : 0) << 1;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.b1 = slot & 1 == 1;
        data.b2 = slot >> 1 & 1 == 1;
        return data;
    }

    // Load Only b1
    function loadB1(uint256 tokenId) public view returns (bool) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return value & 1 == 1;
    }

    // Store Only b1
    function storeB1(uint256 tokenId, bool b1) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 1) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(b1 == true ? 1 : 0) & mask);
    }

    // Load Only b2
    function loadB2(uint256 tokenId) public view returns (bool) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 1;
        return value & 1 == 1;
    }

    // Store Only b2
    function storeB2(uint256 tokenId, bool b2) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 1) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 1);
        _metadataStorage[tokenId][0] = cleared | (uint256(b2 == true ? 1 : 0) & mask) << 1;
    }
}