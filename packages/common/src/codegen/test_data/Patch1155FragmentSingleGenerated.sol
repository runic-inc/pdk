// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/PatchworkFragmentSingle.sol";
import "@patchwork/Patchwork1155Patch.sol";
import "@patchwork/PatchworkUtils.sol";

abstract contract Patch1155FragmentSingleGenerated is Patchwork1155Patch, PatchworkFragmentSingle {

    struct Metadata {
        string single_char_field;
    }

    uint256 internal _nextTokenId;

    constructor(address _manager, address _owner)
        Patchwork721("test", "Patch1155FragmentSingle", "TST", _manager, _owner)
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

    function supportsInterface(bytes4 interfaceID) public view virtual override(PatchworkFragmentSingle, Patchwork1155Patch) returns (bool) {
        return PatchworkFragmentSingle.supportsInterface(interfaceID) ||
            Patchwork1155Patch.supportsInterface(interfaceID);
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
            return IPatchworkProtocol(_manager).patch1155{value: msg.value}(owner, target.addr, target.tokenId, target.account, address(this));
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

    function setLocked(uint256 tokenId, bool locked_) public virtual override(Patchwork721, PatchworkFragmentSingle) {
        PatchworkFragmentSingle.setLocked(tokenId, locked_);
    }

    function locked(uint256 tokenId) public view virtual override(Patchwork721, PatchworkFragmentSingle) returns (bool) {
        return PatchworkFragmentSingle.locked(tokenId);
    }

    function ownerOf(uint256 tokenId) public view virtual override(ERC721, IERC721, PatchworkFragmentSingle) returns (address) {
        return PatchworkFragmentSingle.ownerOf(tokenId);
    }
}