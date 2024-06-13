// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

contract Basic2Slotoverflow is Patchwork721 {

    struct Metadata {
        address addr;
        uint128 fieldu128a;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "Basic2: Slot overflow", "BASIC", _manager, _owner)
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
        entries[0] = MetadataSchemaEntry(2, 0, FieldType.ADDRESS, 1, FieldVisibility.PUBLIC, 0, 0, "addr");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 1, 0, "fieldu128a");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](2);
        slots[0] = uint256(uint160(data.addr));
        slots[1] = uint256(data.fieldu128a);
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.addr = address(uint160(slot));
        slot = slots[1];
        data.fieldu128a = uint128(slot);
        return data;
    }

    // Load Only addr
    function loadAddr(uint256 tokenId) public view returns (address) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return address(uint160(value));
    }

    // Store Only addr
    function storeAddr(uint256 tokenId, address addr) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 160) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(uint160(addr)) & mask);
    }

    // Load Only fieldu128a
    function loadFieldu128a(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][1]);
        return uint128(value);
    }

    // Store Only fieldu128a
    function storeFieldu128a(uint256 tokenId, uint128 fieldu128a) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask);
        _metadataStorage[tokenId][1] = cleared | (uint256(fieldu128a) & mask);
    }
}