// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/PatchworkFragmentSingle.sol";
import "@patchwork/PatchworkUtils.sol";

contract WeakRef is PatchworkFragmentSingle {

    struct Metadata {
        string name;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "WeakRef", "WEAK", _manager, _owner)
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
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.CHAR32, 1, FieldVisibility.PUBLIC, 0, 0, "name");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = PatchworkUtils.strToUint256(data.name);
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.name = PatchworkUtils.toString32(slot);
        return data;
    }

    // Load Only name
    function loadName(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString32(value);
    }

    // Store Only name
    function storeName(uint256 tokenId, string memory name) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId][0] = PatchworkUtils.strToUint256(name);
    }

    /**
    @dev See {IERC721-ownerOf}
    */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        // Weak assignment uses normal ownership
        return ERC721.ownerOf(tokenId);
    }

    /**
    @dev See {IPatchwork721-locked}
    */
    function locked(uint256 tokenId) public view virtual override returns (bool) {
        // Weak assignment uses base 721 locking behavior
        return Patchwork721.locked(tokenId);
    }

    /**
    @dev See {IPatchwork721-setLocked}
    */
    function setLocked(uint256 tokenId, bool locked_) public virtual override {
        // Weak assignment uses base 721 locking behavior
        Patchwork721.setLocked(tokenId, locked_);
    }

    /**
    @dev See {IERC721-transferFrom}.
    */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        // Weak assignment skips calling PatchworkProtocol.applyTransfer()
        if (locked(tokenId)) {
            revert IPatchworkProtocol.Locked(address(this), tokenId);
        }
        ERC721.transferFrom(from, to, tokenId);
    }

    /**
    @dev See {IERC721-safeTransferFrom}.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        // Weak assignment skips calling PatchworkProtocol.applyTransfer()
        if (locked(tokenId)) {
            revert IPatchworkProtocol.Locked(address(this), tokenId);
        }
        ERC721.safeTransferFrom(from, to, tokenId, data);
    }
}