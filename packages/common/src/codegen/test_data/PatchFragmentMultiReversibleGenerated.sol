// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/PatchworkFragmentMulti.sol";
import "@patchwork/PatchworkPatch.sol";
import "@patchwork/PatchworkUtils.sol";

abstract contract PatchFragmentMultiReversibleGenerated is PatchworkReversiblePatch, PatchworkFragmentMulti {

    struct Metadata {
        string single_char_field;
    }

    uint256 internal _nextTokenId;

    constructor(address _manager, address _owner)
        Patchwork721("test", "PatchFragmentMultiReversible", "TST", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://example.com/schema";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://example.com/";
    }

    function supportsInterface(bytes4 interfaceID) public view virtual override(PatchworkFragmentMulti, PatchworkReversiblePatch) returns (bool) {
        return PatchworkFragmentMulti.supportsInterface(interfaceID) ||
            PatchworkReversiblePatch.supportsInterface(interfaceID);
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
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.CHAR16, 1, FieldVisibility.PUBLIC, 0, 0, "single_char_field");
        return MetadataSchema(1, entries);
    }

    function mintPatch(address owner, PatchTarget memory target) external payable returns (uint256 tokenId) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).patch{value: msg.value}(owner, target.addr, target.tokenId, address(this));
        }
        // require inherited ownership
        if (IERC721(target.addr).ownerOf(target.tokenId) != owner) {
            revert IPatchworkProtocol.NotAuthorized(owner);
        }
        tokenId = _nextTokenId++;
        _storePatch(tokenId, target);
        _safeMint(owner, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
        return tokenId;
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = PatchworkUtils.strToUint256(data.single_char_field) >> 128;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.single_char_field = PatchworkUtils.toString16(uint128(slot));
        return data;
    }

    // Load Only single_char_field
    function loadSinglecharfield(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString16(uint128(value));
    }

    // Store Only single_char_field
    function storeSinglecharfield(uint256 tokenId, string memory single_char_field) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (PatchworkUtils.strToUint256(single_char_field) >> 128 & mask);
        emit MetadataUpdate(tokenId);
    }

    function setLocked(uint256 tokenId, bool locked_) public virtual override(PatchworkPatch, Patchwork721) {
        return PatchworkPatch.setLocked(tokenId, locked_);
    }

    function locked(uint256 /* tokenId */) public pure virtual override(PatchworkPatch, Patchwork721) returns (bool) {
        return false;
    }

    function ownerOf(uint256 tokenId) public view virtual override(PatchworkPatch, ERC721, IERC721) returns (address) {
        return PatchworkPatch.ownerOf(tokenId);
    }
}