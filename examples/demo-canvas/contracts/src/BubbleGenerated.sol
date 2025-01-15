// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/PatchworkFragmentSingle.sol";
import "@patchwork/interfaces/IPatchworkMintable.sol";

abstract contract BubbleGenerated is PatchworkFragmentSingle, IPatchworkMintable {

    struct Metadata {
        uint256 sequence;
        address minter;
        bytes8[4] decorations;
    }

    uint256 internal _nextTokenId;

    constructor(address _manager, address _owner)
        Patchwork721("canvas", "Bubble", "BUBBLE", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://canvas.patchwork.dev/schemas/bubble.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://canvas.patchwork.dev/assets/bubble/", Strings.toString(tokenId), "");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://canvas.patchwork.dev/";
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
        entries[0] = MetadataSchemaEntry(0, 0, FieldType.UINT256, 1, FieldVisibility.PUBLIC, 0, 0, "sequence");
        entries[1] = MetadataSchemaEntry(2, 0, FieldType.ADDRESS, 1, FieldVisibility.PUBLIC, 1, 0, "minter");
        entries[2] = MetadataSchemaEntry(1, 0, FieldType.BYTES8, 4, FieldVisibility.PUBLIC, 2, 0, "decorations");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](3);
        slots[0] = uint256(data.sequence);
        slots[1] = uint256(uint160(data.minter));
        slots[2] = uint256(uint64(data.decorations[0])) | uint256(uint64(data.decorations[1])) << 64 | uint256(uint64(data.decorations[2])) << 128 | uint256(uint64(data.decorations[3])) << 192;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.sequence = uint256(slot);
        slot = slots[1];
        data.minter = address(uint160(slot));
        slot = slots[2];
        data.decorations[0] = bytes8(uint64(slot));
        data.decorations[1] = bytes8(uint64(slot >> 64));
        data.decorations[2] = bytes8(uint64(slot >> 128));
        data.decorations[3] = bytes8(uint64(slot >> 192));
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
        _metadataStorage[tokenId] = new uint256[](3);
        _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    // Load Only sequence
    function loadSequence(uint256 tokenId) public view returns (uint256) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return uint256(value);
    }

    // Store Only sequence
    function storeSequence(uint256 tokenId, uint256 sequence) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId][0] = uint256(sequence);
        emit MetadataUpdate(tokenId);
    }

    // Load Only minter
    function loadMinter(uint256 tokenId) public view returns (address) {
        uint256 value = uint256(_metadataStorage[tokenId][1]);
        return address(uint160(value));
    }

    // Store Only minter
    function storeMinter(uint256 tokenId, address minter) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 160) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask);
        _metadataStorage[tokenId][1] = cleared | (uint256(uint160(minter)) & mask);
        emit MetadataUpdate(tokenId);
    }

    // Load Array for decorations
    function loadDecorations(uint256 tokenId) public view returns (bytes8[] memory) {
        bytes8[] memory result = new bytes8[](4);
        uint256 slot = _metadataStorage[tokenId][2];
        result[0] = bytes8(uint64(slot));
        result[1] = bytes8(uint64(slot >> 64));
        result[2] = bytes8(uint64(slot >> 128));
        result[3] = bytes8(uint64(slot >> 192));
        return result;
    }

    // Store Array for decorations
    function storeDecorations(uint256 tokenId, bytes8[] memory decorations) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (decorations.length != 4) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(uint64(decorations[0])) << 0;
        slot = slot | uint256(uint64(decorations[1])) << 64;
        slot = slot | uint256(uint64(decorations[2])) << 128;
        slot = slot | uint256(uint64(decorations[3])) << 192;
        _metadataStorage[tokenId][2] = slot;
        emit MetadataUpdate(tokenId);
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