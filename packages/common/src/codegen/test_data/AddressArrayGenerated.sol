// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";

abstract contract AddressArrayGenerated is Patchwork721 {

    struct Metadata {
        address[4] addresses;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "AddressArray", "AARR", _manager, _owner)
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
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.ADDRESS, 4, FieldVisibility.PUBLIC, 0, 0, "addresses");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](4);
        slots[0] = uint256(uint160(data.addresses[0]));
        slots[1] = uint256(uint160(data.addresses[1]));
        slots[2] = uint256(uint160(data.addresses[2]));
        slots[3] = uint256(uint160(data.addresses[3]));
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.addresses[0] = address(uint160(slot));
        slot = slots[1];
        data.addresses[1] = address(uint160(slot));
        slot = slots[2];
        data.addresses[2] = address(uint160(slot));
        slot = slots[3];
        data.addresses[3] = address(uint160(slot));
        return data;
    }

    // Load Array for addresses
    function loadAddresses(uint256 tokenId) public view returns (address[] memory) {
        address[] memory result = new address[](4);
        uint256 slot = _metadataStorage[tokenId][0];
        result[0] = address(uint160(slot));
        slot = _metadataStorage[tokenId][1];
        result[1] = address(uint160(slot));
        slot = _metadataStorage[tokenId][2];
        result[2] = address(uint160(slot));
        slot = _metadataStorage[tokenId][3];
        result[3] = address(uint160(slot));
        return result;
    }

    // Store Array for addresses
    function storeAddresses(uint256 tokenId, address[] memory addresses) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (addresses.length != 4) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(uint160(addresses[0])) << 0;
        _metadataStorage[tokenId][0] = slot;
        slot = 0;
        slot = slot | uint256(uint160(addresses[1])) << 0;
        _metadataStorage[tokenId][1] = slot;
        slot = 0;
        slot = slot | uint256(uint160(addresses[2])) << 0;
        _metadataStorage[tokenId][2] = slot;
        slot = 0;
        slot = slot | uint256(uint160(addresses[3])) << 0;
        _metadataStorage[tokenId][3] = slot;
    }
}