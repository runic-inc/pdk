// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkUtils.sol";

abstract contract OneStringGenerated is Patchwork721 {

    struct Metadata {
        uint256 reserved;
    }

    mapping(uint256 => string) internal _dynamicStringStorage; // tokenId => string

    constructor(address _manager, address _owner)
        Patchwork721("test", "OneString", "ONESTRING", _manager, _owner)
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
        entries[0] = MetadataSchemaEntry(2, 0, FieldType.UINT256, 1, FieldVisibility.PUBLIC, 0, 0, "reserved");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.STRING, 1, FieldVisibility.PUBLIC, 0, 0, "s");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(data.reserved);
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.reserved = uint256(slot);
        return data;
    }

    // Load Only s
    function loadS(uint256 tokenId) public view returns (string memory) {
        return _dynamicStringStorage[tokenId];
    }

    // Store Only s
    function storeS(uint256 tokenId, string memory s) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _dynamicStringStorage[tokenId] = s;
    }
}