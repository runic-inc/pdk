// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/PatchworkFragmentSingle.sol";
import "@patchwork/interfaces/IPatchworkMintable.sol";
import "@patchwork/PatchworkUtils.sol";

abstract contract CharacterTraitsGenerated is PatchworkFragmentSingle, IPatchworkMintable {

    struct Metadata {
        string trait_name;
        uint16 trait_id;
        uint8 trait_type;
    }

    uint256 internal _nextTokenId;

    constructor(address _manager, address _owner)
        Patchwork721("composable-pfp-demo", "Character Traits", "CHARTRAIT", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://example.com/schemas/trait.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://example.com/assets/trait/", Strings.toString(tokenId), "");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://example.com/metadata/trait";
    }

    function supportsInterface(bytes4 interfaceID) public view virtual override returns (bool) {
        return type(IPatchworkMintable).interfaceId == interfaceID ||
            super.supportsInterface(interfaceID);
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
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](3);
        entries[0] = MetadataSchemaEntry(2, 0, FieldType.CHAR16, 1, FieldVisibility.PUBLIC, 0, 0, "trait_name");
        entries[1] = MetadataSchemaEntry(0, 0, FieldType.UINT16, 1, FieldVisibility.PUBLIC, 0, 128, "trait_id");
        entries[2] = MetadataSchemaEntry(1, 0, FieldType.UINT8, 1, FieldVisibility.PUBLIC, 0, 144, "trait_type");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = PatchworkUtils.strToUint256(data.trait_name) >> 128 | uint256(data.trait_id) << 128 | uint256(data.trait_type) << 144;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.trait_name = PatchworkUtils.toString16(uint128(slot));
        data.trait_id = uint16(slot >> 128);
        data.trait_type = uint8(slot >> 144);
        return data;
    }

    function mint(address to, bytes calldata data) public virtual payable returns (uint256 tokenId) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);
        }
        return _mintSingle(to, data);
    }

    function mintBatch(address to, bytes calldata data, uint256 quantity) public virtual payable returns (uint256[] memory tokenIds) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mintBatch{value: msg.value}(to, address(this), data, quantity);
        }
        tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = _mintSingle(to, data);
        }
    }

    function _mintSingle(address to, bytes calldata /* data */) internal virtual returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _metadataStorage[tokenId] = new uint256[](1);
        _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    // Load Only trait_name
    function loadTraitname(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString16(uint128(value));
    }

    // Store Only trait_name
    function storeTraitname(uint256 tokenId, string memory trait_name) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (PatchworkUtils.strToUint256(trait_name) >> 128 & mask);
        emit MetadataUpdate(tokenId);
    }

    // Load Only trait_id
    function loadTraitid(uint256 tokenId) public view returns (uint16) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 128;
        return uint16(value);
    }

    // Store Only trait_id
    function storeTraitid(uint256 tokenId, uint16 trait_id) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 16) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 128);
        _metadataStorage[tokenId][0] = cleared | (uint256(trait_id) & mask) << 128;
        emit MetadataUpdate(tokenId);
    }

    // Load Only trait_type
    function loadTraittype(uint256 tokenId) public view returns (uint8) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 144;
        return uint8(value);
    }

    // Store Only trait_type
    function storeTraittype(uint256 tokenId, uint8 trait_type) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 8) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 144);
        _metadataStorage[tokenId][0] = cleared | (uint256(trait_type) & mask) << 144;
        emit MetadataUpdate(tokenId);
    }
}