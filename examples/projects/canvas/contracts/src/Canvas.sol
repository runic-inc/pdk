// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@patchwork/interfaces/IPatchworkProtocol.sol";
import "@patchwork/interfaces/IPatchworkMintable.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";
import "@patchwork/PatchworkUtils.sol";
import "./ICanvas.sol";


/** 
  ___    __    _  _  _  _    __    ___ 
 / __)  /__\  ( \( )( \/ )  /__\  / __)
( (__  /(__)\  )  (  \  /  /(__)\ \__ \
 \___)(__)(__)(_)\_)  \/  (__)(__)(___

 by Runic Labs, Inc
 */

/**
@notice A Canvas
@author Runic Labs, Inc
*/
contract Canvas is ICanvas, Patchwork721, PatchworkLiteRef, IPatchworkMintable {

    //Who can mint: only the owner, or everyone
    enum MintMode { OWNER, OPEN }
    MintMode private _mintMode = MintMode.OWNER;

    struct DynamicLiteRefs {
        uint256[] slots; // 4 per
        mapping(uint64 => uint256) idx;
    }

    /// next tokenId to mint
    uint256 private _nextTokenId;

    string private uriRoot;

    mapping(uint256 => DynamicLiteRefs) internal _dynamicLiterefStorage; // tokenId => indexed slots

    constructor(address manager_, address owner_)
        Patchwork721("canvas", "Canvas", "CANVAS", manager_, owner_)
    {
        uriRoot = "https://canvas.patchwork.dev/";
    }

    /**
    @dev ERC-165
    */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(Patchwork721, PatchworkLiteRef)
        returns (bool)
    {
        return interfaceId == type(ICanvas).interfaceId || 
            interfaceId == type(IPatchworkMintable).interfaceId ||
            Patchwork721.supportsInterface(interfaceId) || 
            PatchworkLiteRef.supportsInterface(interfaceId);
    }
    
    /**
    @notice gets the total supply
    @return uint256 the supply
    */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Sets the base URI root. Only callable by the contract owner.
     * @param newUriRoot The new URI root to be set.
     */
    function setUriRoot(string calldata newUriRoot) external onlyOwner {
        uriRoot = newUriRoot;
    }

    /**
     * @dev Internal baseURI for json (used by OpenZeppelin tokenURI() if overriding is needed).
     */
    function _baseURI() internal view override returns (string memory) {
        return string.concat(uriRoot, "metadata/canvas/");
    }

    /**
     * @notice An image URI for a canvas
     * @param tokenId the tokenId of the canvas
     * @return string The image URI
     */
    function imageURI(uint256 tokenId) external view returns (string memory) {
        return string.concat(uriRoot, "assets/canvas/", Strings.toString(tokenId));
    }

    /**
     * @notice A schema URI for a canvas
     * @return string The schema URI
     */
    function schemaURI() external view returns (string memory) {
        return string.concat(uriRoot, "schemas/canvas.json");
    }

    /**
    @notice the patchwork metadata schema
    @return MetadataSchema the schema
    */
    function schema() external pure returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](2);
        entries[0] = MetadataSchemaEntry(0, 0, FieldType.CHAR32, 1, FieldVisibility.PUBLIC, 0, 0, "name");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 0, FieldVisibility.PUBLIC, 0, 0, "bubbleRefs");
        return MetadataSchema(1, entries);
    }

    /**
    @notice Mints a canvas
    @param to the new owner of the canvas
    @param data mint data (empty)
    @return tokenId the newly minted tokenId
    */
    function mint(address to, bytes calldata data) public payable returns (uint256 tokenId) {
        if (_mintMode == MintMode.OWNER) {
            require (msg.sender == owner(), "minting not allowed");
        } else {
            // Open mint, if called directly, proxy through Patchwork Protocol
            if (msg.sender != _manager) {
                return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);
            }
        }
        return _mintSingle(to);
    }

    /**
    @notice Mints a batch of canvases
    @param to the new owner of the canvases
    @param data mint data (empty)
    @param quantity the number of canvases to mint
    @return tokenIds the newly minted tokenIds
    */
    function mintBatch(address to, bytes calldata data, uint256 quantity) public payable returns (uint256[] memory tokenIds) {
        if (_mintMode == MintMode.OWNER) {
            require (msg.sender == owner(), "minting not allowed");
        } else {
            // Open mint, if called directly, proxy through Patchwork Protocol
            if (msg.sender != _manager) {
                return IPatchworkProtocol(_manager).mintBatch{value: msg.value}(to, address(this), data, quantity);
            }
        }
        tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = _mintSingle(to);
        }
    }

    /**
    @dev mints a single canvas
    @param to the new owner
    @return uint256 the new tokenId
    */
    function _mintSingle(address to) private returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
        return tokenId;
    }

    /**
    @notice Sets the mint ode to either only owner, or anyone
    @param mode the mint mode
    */
    function setMintMode(MintMode mode) public onlyOwner {
        _mintMode = mode;
    }

    /**
    @dev packs and stores metadata
    @param _tokenId the tokenId
    @param data the metadata struct
    */
    function _storeMetadata(uint256 _tokenId, Metadata memory data) private {
        _metadataStorage[_tokenId] = packMetadata(data);
    }

    /**
    @notice Packs metadata for storage
    @param data the metadata struct
    @return slots the metadata slots
    */
    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = PatchworkUtils.strToUint256(data.name);
        return slots;
    }

    /**
    @notice Stores metadata for a tokenId
    @param tokenId the tokenId to store metadata for
    @param data the metadata
    */
    function storeMetadata(uint256 tokenId, Metadata memory data) public {
        require(_checkTokenWriteAuth(tokenId), "not authorized");
        _storeMetadata(tokenId, data);
    }

    /**
    @notice Unpacks packed metadata from storage format
    @param slots the metadata slots
    @return data the metadata struct
    */
    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        data.name = PatchworkUtils.toString32(slots[0]);
        return data;
    }

    /**
    @notice Loads metadata for a tokenId
    @param tokenId the tokenId to load metadata for
    @return data the metadata
    */
    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    /**
    @notice Loads an canvas name for a tokenId 
    @param tokenId the tokenId to use
    @return string the name
    */
    function loadName(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString32(value);
    }

    /**
    @notice Stores a canvas name for a tokenId 
    @param tokenId the tokenId to use
    @param name the canvas name
    */
    function storeName(uint256 tokenId, string memory name) public onlyOwner {
        _metadataStorage[tokenId][0] = PatchworkUtils.strToUint256(name);
    }

    /**
    @notice Adds a reference to a token
    @param ourTokenId ID of the token
    @param liteRef LiteRef to add
    */
    function addReference(uint256 ourTokenId, uint64 liteRef) public override {
        require(_checkTokenWriteAuth(ourTokenId), "not authorized");
        // to append: find last slot, if it's not full, add, otherwise start a new slot.
        DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
        uint256 slotsLen = store.slots.length;
        if (slotsLen == 0) {
            store.slots.push(uint256(liteRef));
            store.idx[liteRef] = 0;
        } else {
            uint256 slot = store.slots[slotsLen-1];
            if (slot >= (1 << 192)) {
                // new slot (pos 1)
                store.slots.push(uint256(liteRef));
                store.idx[liteRef] = slotsLen;
            } else {
                store.idx[liteRef] = slotsLen-1;
                // Reverse search for the next empty subslot
                if (slot >= (1 << 128)) {
                    // pos 4
                    store.slots[slotsLen-1] = slot | uint256(liteRef) << 192;
                } else if (slot >= (1 << 64)) {
                    // pos 3
                    store.slots[slotsLen-1] = slot | uint256(liteRef) << 128;
                } else {
                    // pos 2
                    store.slots[slotsLen-1] = slot | uint256(liteRef) << 64;
                }
            }
        }
    }

    /**
    @notice Adds multiple references to a token
    @param ourTokenId ID of the token
    @param _liteRefs Array of lite references to add
    */
    function addReferenceBatch(uint256 ourTokenId, uint64[] calldata _liteRefs) public override {
        require(_checkTokenWriteAuth(ourTokenId), "not authorized");
        // do in batches of 4 with 1 remainder pass
        DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
        uint256 slotsLen = store.slots.length;
        if (slotsLen > 0) {
            revert("already loaded");
        }
        uint256 fullBatchCount = _liteRefs.length / 4;
        uint256 remainder = _liteRefs.length % 4;
        for (uint256 batch = 0; batch < fullBatchCount; batch++) {
            uint256 refIdx = batch * 4;
            uint256 slot = uint256(_liteRefs[refIdx]) | (uint256(_liteRefs[refIdx+1]) << 64) | (uint256(_liteRefs[refIdx+2]) << 128) | (uint256(_liteRefs[refIdx+3]) << 192);
            store.slots.push(slot);
            store.idx[_liteRefs[refIdx]] = batch;
            store.idx[_liteRefs[refIdx + 1]] = batch;
            store.idx[_liteRefs[refIdx + 2]] = batch;
            store.idx[_liteRefs[refIdx + 3]] = batch;
        }
        uint256 rSlot;
        for (uint256 i = 0; i < remainder; i++) {
            uint256 idx = (fullBatchCount * 4) + i;
            rSlot = rSlot | (uint256(_liteRefs[idx]) << (i * 64));
            store.idx[_liteRefs[idx]] = fullBatchCount;
        }
        store.slots.push(rSlot);
    }

    /**
    @notice Removes a reference from a token
    @param ourTokenId ID of the token
    @param liteRef Lite reference to remove
    */
    function removeReference(uint256 ourTokenId, uint64 liteRef) public override {
        require(_checkTokenWriteAuth(ourTokenId), "not authorized");
        DynamicLiteRefs storage store = _dynamicLiterefStorage[ourTokenId];
        uint256 slotsLen = store.slots.length;
        if (slotsLen == 0) {
            revert("not found");
        }

        uint256 count = getDynamicReferenceCount(ourTokenId);
        if (count == 1) {
            if (store.slots[0] == liteRef) {
                store.slots.pop();
                delete store.idx[liteRef];
            } else {
                revert("not found");
            }
        } else {
            // remember and remove the last ref
            uint256 lastIdx = slotsLen-1;
            uint256 slot = store.slots[lastIdx];
            uint64 lastRef;
            if (slot >= (1 << 192)) {
                // pos 4
                lastRef = uint64(slot >> 192);
                store.slots[lastIdx] = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            } else if (slot >= (1 << 128)) {
                // pos 3
                lastRef = uint64(slot >> 128);
                store.slots[lastIdx] = slot & 0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            } else if (slot >= (1 << 64)) {
                // pos 2
                lastRef = uint64(slot >> 64);
                store.slots[lastIdx] = slot & 0x000000000000000000000000000000000000000000000000FFFFFFFFFFFFFFFF;
            } else {
                // pos 1
                lastRef = uint64(slot);
                store.slots.pop();
            }
            if (lastRef == liteRef) {
                // it was the last ref. No need to replace anything. It's already cleared so just clear the index
                delete store.idx[liteRef];
            } else {
                // Find the ref and replace it with lastRef then update indexes
                uint256 refSlotIdx = store.idx[liteRef];
                slot = store.slots[refSlotIdx];
                if (uint64(slot >> 192) == liteRef) {
                    slot = slot & 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                    slot = slot | (uint256(lastRef) << 192);
                } else if (uint64(slot >> 128) == liteRef) {
                    slot = slot & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
                    slot = slot | (uint256(lastRef) << 128);
                } else if (uint64(slot >> 64) == liteRef) {
                    slot = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF;
                    slot = slot | (uint256(lastRef) << 64);
                } else if (uint64(slot) == liteRef) {
                    slot = slot & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000;
                    slot = slot | uint256(lastRef);
                } else {
                    revert("storage integrity error");
                }
                store.slots[refSlotIdx] = slot;
                store.idx[lastRef] = refSlotIdx;
                delete store.idx[liteRef];
            }
        }
    }

    /**
    @notice Adds a reference to a token
    @param tokenId ID of the token
    @param liteRef LiteRef to add
    @param targetMetadataId The metadata ID on the target to assign to
    */
    function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert("Unsupported metadata ID");
        }
        addReference(tokenId, liteRef);
    }

    /**
    @notice Removes a literef from tokenId 
    @param tokenId our tokenId to use
    @param liteRef the literef
    @param targetMetadataId the target metadata id
    */
    function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert("Unsupported metadata ID");
        }
        removeReference(tokenId, liteRef);
    }

    /**
    @notice Adds multiple references to a token
    @param tokenId ID of the token
    @param liteRefs Array of lite references to add
    @param targetMetadataId The metadata ID on the target to assign to
    */
    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert("Unsupported metadata ID");
        }
        addReferenceBatch(tokenId, liteRefs);
    }

    /**
    @notice Loads a reference address and token ID at a given index
    @param ourTokenId ID of the token
    @param idx Index to load from
    @return addr Address
    @return tokenId Token ID
    */
    function loadReferenceAddressAndTokenId(uint256 ourTokenId, uint256 idx) public view returns (address addr, uint256 tokenId) {
        uint256[] storage slots = _dynamicLiterefStorage[ourTokenId].slots;
        uint slotNumber = idx / 4; // integer division will get the correct slot number
        uint shift = (idx % 4) * 64; // the remainder will give the correct shift
        uint64 ref = uint64(slots[slotNumber] >> shift);
        (addr, tokenId) = getReferenceAddressAndTokenId(ref);
    }

    /**
    @notice Gers the reference count for a token id
    @param tokenId ID of the token
    @return count the reference count
    */
    function getDynamicReferenceCount(uint256 tokenId) public view override returns (uint256 count) {
        DynamicLiteRefs storage store = _dynamicLiterefStorage[tokenId];
        uint256 slotsLen = store.slots.length;
        if (slotsLen == 0) {
            return 0;
        } else {
            uint256 slot = store.slots[slotsLen-1];
            // You could get rid of this conditional stuff if you had a log function
            if (slot >= (1 << 192)) {
                return slotsLen * 4;
            } else {
                // Reverse search for the next empty subslot
                if (slot >= (1 << 128)) {
                    // pos 4
                    return (slotsLen-1) * 4 + 3;
                } else if (slot >= (1 << 64)) {
                    // pos 3
                    return (slotsLen-1) * 4 + 2;
                } else {
                    // pos 2
                    return (slotsLen-1) * 4 + 1;
                }
            }
        }
    }

    /**
    @notice Loads a page of dynamic references
    @param tokenId ID of the token
    @param offset the offset
    @param count the count
    @return addresses reference token addresses
    @return tokenIds reference token Ids
    */
    function loadDynamicReferencePage(uint256 tokenId, uint256 offset, uint256 count) public view override returns (address[] memory addresses, uint256[] memory tokenIds) {
        uint256 refCount = getDynamicReferenceCount(tokenId);
        if (offset >= refCount) {
            return (new address[](0), new uint256[](0));
        }
        uint256 realCount = refCount - offset;
        if (realCount > count) {
            realCount = count;
        }
        addresses = new address[](realCount);
        tokenIds = new uint256[](realCount);
        uint256[] storage slots = _dynamicLiterefStorage[tokenId].slots;
        // start at offset
        for (uint256 i = 0; i < realCount; i++) {
            uint256 idx = offset + i;
            uint slotNumber = idx / 4; // integer division will get the correct slot number
            uint shift = (idx % 4) * 64; // the remainder will give the correct shift
            uint64 ref = uint64(slots[slotNumber] >> shift);
            (address attributeAddress, uint256 attributeTokenId) = getReferenceAddressAndTokenId(ref);
            addresses[i] = attributeAddress;
            tokenIds[i] = attributeTokenId;
        }
    }

    /**
    @dev use Patchwork721's _checkWriteAuth()
    */
    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}