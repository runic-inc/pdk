// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";
import "@patchwork/interfaces/IPatchworkMintable.sol";

abstract contract LiteRef4Generated is Patchwork721, PatchworkLiteRef, IPatchworkMintable {

    error NoReferenceSlotsAvailable();
    error TooManyReferences();
    error NoReference();
    error UnsupportedMetadataId();
    error AlreadyHaveReferences();

    struct Metadata {
        uint64[4] array_literef;
    }

    uint256 internal _nextTokenId;

    constructor(address _manager, address _owner)
        Patchwork721("test", "LiteRef4", "LR4", _manager, _owner)
        PatchworkLiteRef()
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://example.com/schema";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return "https://example.com/image";
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://example.com/";
    }

    function supportsInterface(bytes4 interfaceID) public view virtual override(Patchwork721, PatchworkLiteRef) returns (bool) {
        return type(IPatchworkMintable).interfaceId == interfaceID ||
            Patchwork721.supportsInterface(interfaceID) ||
            PatchworkLiteRef.supportsInterface(interfaceID);
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
        entries[0] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 4, FieldVisibility.PUBLIC, 0, 0, "array_literef");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = uint256(data.array_literef[0]) | uint256(data.array_literef[1]) << 64 | uint256(data.array_literef[2]) << 128 | uint256(data.array_literef[3]) << 192;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.array_literef[0] = uint64(slot);
        data.array_literef[1] = uint64(slot >> 64);
        data.array_literef[2] = uint64(slot >> 128);
        data.array_literef[3] = uint64(slot >> 192);
        return data;
    }

    function mint(address to, bytes calldata data) public payable returns (uint256 tokenId) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);
        }
        return _mintSingle(to, data);
    }

    function mintBatch(address to, bytes calldata data, uint256 quantity) public payable returns (uint256[] memory tokenIds) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mintBatch{value: msg.value}(to, address(this), data, quantity);
        }
        tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = _mintSingle(to, data);
        }
    }

    function _mintSingle(address to, bytes calldata /* data */) internal returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _metadataStorage[tokenId] = new uint256[](1);
        _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    // Load Array for array_literef
    function loadArrayliteref(uint256 tokenId) public view returns (uint64[] memory) {
        uint64[] memory result = new uint64[](4);
        uint256 slot = _metadataStorage[tokenId][0];
        result[0] = uint64(slot);
        result[1] = uint64(slot >> 64);
        result[2] = uint64(slot >> 128);
        result[3] = uint64(slot >> 192);
        return result;
    }

    // Store Array for array_literef
    function storeArrayliteref(uint256 tokenId, uint64[] memory array_literef) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (array_literef.length != 4) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(array_literef[0]) << 0;
        slot = slot | uint256(array_literef[1]) << 64;
        slot = slot | uint256(array_literef[2]) << 128;
        slot = slot | uint256(array_literef[3]) << 192;
        _metadataStorage[tokenId][0] = slot;
    }

    function addReference(uint256 tokenId, uint64 liteRef) public override {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 slot = mdStorage[0];
        if (uint64(slot) == 0) {
            mdStorage[0] = slot | uint256(liteRef);
        } else if (uint64(slot >> 64) == 0) {
            mdStorage[0] = slot | uint256(liteRef) << 64;
        } else if (uint64(slot >> 128) == 0) {
            mdStorage[0] = slot | uint256(liteRef) << 128;
        } else if (uint64(slot >> 192) == 0) {
            mdStorage[0] = slot | uint256(liteRef) << 192;
        } else {
            revert NoReferenceSlotsAvailable();
        }
    }

    function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        addReference(tokenId, liteRef);
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs) public override {
        // This will overwrite all ref values starting at slot 0 idx 0
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (liteRefs.length > 4) {
            revert TooManyReferences();
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        for (uint256 slotIdx = 0; slotIdx < 1; slotIdx++) {
            if (mdStorage[slotIdx] != 0) {
                revert AlreadyHaveReferences();
            }
            uint256 slot = 0;
            for (uint256 refPos = 0; refPos < 4; refPos++) {
                uint256 refIdx = slotIdx * 4 + refPos;
                if (refIdx >= liteRefs.length) {
                    break;
                }
                slot = slot | uint256(liteRefs[refIdx]) << (64 * refPos);
            }
            if (slot != 0) {
                mdStorage[slotIdx] = slot;
            }
        }
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        addReferenceBatch(tokenId, liteRefs);
    }

    function removeReference(uint256 tokenId, uint64 liteRef) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256[] storage mdStorage = _metadataStorage[tokenId];
        uint256 nextSlotNumber = 0;
        uint256 curSlotNumber = 0;
        uint256 slot;
        for (uint256 i = 0; i < 4; i++) {
            uint256 subSlotNumber = i % 4;
            if (subSlotNumber == 0) {
                slot = mdStorage[nextSlotNumber];
                nextSlotNumber++;
                curSlotNumber = nextSlotNumber - 1;
            }
            uint256 shift = subSlotNumber * 64;
            if (uint64(slot >> shift) == liteRef) {
                if (subSlotNumber == 0) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000;
                } else if (subSlotNumber == 1) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF;
                } else if (subSlotNumber == 2) {
                    mdStorage[curSlotNumber] = slot & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                } else {
                    mdStorage[curSlotNumber] = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                }
                return;
            }
        }
        revert NoReference();
    }

    function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) external {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        removeReference(tokenId, liteRef);
    }

    function loadReferenceAddressAndTokenId(uint256 tokenId, uint256 idx) external view returns (address refAddr, uint256 refTokenId) {
        uint256[] storage slots = _metadataStorage[tokenId];
        uint256 slotNumber = idx / 4;
        uint256 shift = (idx % 4) * 64;
        uint64 attributeId = uint64(slots[slotNumber] >> shift);
        return getReferenceAddressAndTokenId(attributeId);
    }

    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}