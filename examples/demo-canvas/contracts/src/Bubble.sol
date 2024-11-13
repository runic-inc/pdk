// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/interfaces/IPatchworkProtocol.sol";
import "@patchwork/interfaces/IPatchworkMintable.sol";
import "@patchwork/PatchworkFragmentSingle.sol";
import "@patchwork/PatchworkUtils.sol";
import "./IBubble.sol";

/**
(  _ \(  )(  )(  _ \(  _ \(  )  ( ___)
 ) _ < )(__)(  ) _ < ) _ < )(__  )__) 
(____/(______)(____/(____/(____)(____)

by Runic Labs, Inc
 */

/**
@notice A Canvas Bubble
@author Runic Labs, Inc
*/
contract Bubble is IBubble, PatchworkFragmentSingle, IPatchworkMintable {
    
    /// next tokenId to mint
    uint256 private _nextTokenId;

    // minter address + canvas + canvas token id -> mint count
    mapping(bytes32 => uint256) private _addressMintCounts;

    // canvas + canvas id hash -> mint limit
    mapping(bytes32 => uint256) private _canvasMintLimits;
    string private _uriRoot;

    constructor(address manager_, address owner_)
        Patchwork721("canvas", "Bubble", "BUBBLE", manager_, owner_)
    {
        _uriRoot = "https://canvas.patchwork.dev/";
    }

    /**
    @dev ERC-165
    */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return interfaceId == type(IBubble).interfaceId || 
            interfaceId == type(IPatchworkMintable).interfaceId ||
            PatchworkFragmentSingle.supportsInterface(interfaceId);
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
     * @param uriRoot_ The new URI root to be set.
     */
    function setUriRoot(string calldata uriRoot_) external onlyOwner {
        _uriRoot = uriRoot_;
    }

    /**
     * @dev Internal baseURI for json (used by OpenZeppelin tokenURI() if overriding is needed).
     */
    function _baseURI() internal view override returns (string memory) {
        return string.concat(_uriRoot, "metadata/bubble/");
    }

    /**
     * @notice An image URI for a bubble
     * @param tokenId the tokenId of the bubble
     * @return string The image URI
     */
    function imageURI(uint256 tokenId) external view returns (string memory) {
        return string.concat(_uriRoot, "assets/bubble/", Strings.toString(tokenId));
    }

    /**
     * @notice A schema URI for a bubble
     * @return string The schema URI
     */
    function schemaURI() external view returns (string memory) {
        return string.concat(_uriRoot, "schemas/bubble.json");
    }

    /**
    @notice the patchwork metadata schema
    @return MetadataSchema the schema
    */
    function schema() external pure returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](3);
        entries[0] = MetadataSchemaEntry(0, 0, FieldType.UINT256, 1, FieldVisibility.PUBLIC, 0, 0, "sequence");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.CHAR8, 4, FieldVisibility.PUBLIC, 1, 0, "decorations");
        entries[2] = MetadataSchemaEntry(2, 0, FieldType.ADDRESS, 1, FieldVisibility.PUBLIC, 2, 0, "minter");
        return MetadataSchema(1, entries);
    }

    /**
    @notice Sets the per address mint limit for a canvas
    @param canvasAddress the canvas address
    @param canvasTokenId the canvas token id
    @param mintLimit the mint limit
    */
    function setCanvasMintLimit(address canvasAddress, uint256 canvasTokenId, uint256 mintLimit) public {
        require(ERC721(canvasAddress).ownerOf(canvasTokenId) == msg.sender, "only canvas token owner can set the mint limit");
        bytes32 canvasHash = keccak256(abi.encodePacked(canvasAddress, canvasTokenId));
        _canvasMintLimits[canvasHash] = mintLimit;
    }

    /**
    @notice Mints a bubble
    @param to the new owner of the bubble
    @param data mint data (empty)
    @return tokenId the newly minted tokenId
    */
    function mint(address to, bytes calldata data) public payable returns (uint256 tokenId) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);
        }
        return _mintSingle(to, data);
    }

    /**
    @notice Mints a batch of bubbles
    @param to the new owner of the bubbles
    @param data mint data (empty)
    @param quantity the number of bubbles to mint
    @return tokenIds the newly minted tokenIds
    */
    function mintBatch(address to, bytes calldata data, uint256 quantity) public payable returns (uint256[] memory tokenIds) {
        if (msg.sender != _manager) {
            return IPatchworkProtocol(_manager).mintBatch{value: msg.value}(to, address(this), data, quantity);
        }
        tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            tokenIds[i] = _mintSingle(to, data);
        }
    }

    /**
    @dev mints a single bubble
    @param to the new owner
    @return uint256 the new tokenId
    */
    function _mintSingle(address to, bytes calldata data) private returns (uint256) {
        require(data.length == 52, "Data must include canvas address and tokenId");
        address canvasAddress;
        uint256 canvasTokenId;
        assembly {
            canvasAddress := calldataload(sub(data.offset, 12))
            canvasTokenId := calldataload(add(data.offset, 20))
        }   

        if (ERC721(canvasAddress).ownerOf(canvasTokenId) == address(0)) {
            revert("invalid canvas token ID");
        }
        bytes32 canvasHash = keccak256(abi.encodePacked(canvasAddress, canvasTokenId));
        
        uint256 canvasMintLimit = _canvasMintLimits[canvasHash];
        require(canvasMintLimit > 0, "Mint count not set for this canvas");
        bytes32 addressCanvasHash = keccak256(abi.encodePacked(to, canvasHash));
        // Check if the mint count for this address and canvas has been exceeded
        require(_addressMintCounts[addressCanvasHash] < canvasMintLimit, "Mint count exceeded for this canvas and address");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);

        bytes8[] memory hashes = generateDecorations(to, _addressMintCounts[addressCanvasHash]);
        Metadata memory metadata = Metadata({
            sequence: tokenId,
            decorations: [hashes[0], hashes[1], hashes[2], hashes[3]],
            minter: to
        });
        _addressMintCounts[addressCanvasHash] += 1;

        _storeMetadata(tokenId, metadata);
        IPatchworkProtocol(_manager).assign(address(this), tokenId, canvasAddress, canvasTokenId);
        return tokenId;
    }

    /**
    @dev generates 4 pseudorandom 8 byte strings for use by artists
    @param minter the minter address
    @param salt the salt
    @return bytes8[] the decorations
    */
    function generateDecorations(address minter, uint256 salt) private pure returns (bytes8[] memory) {
        bytes32 fullHash = keccak256(abi.encodePacked(minter, salt));
        bytes8[] memory hashes = new bytes8[](4);
        hashes[0] = bytes8(fullHash);
        hashes[1] = bytes8(fullHash << 64);
        hashes[2] = bytes8(fullHash << 128);
        hashes[3] = bytes8(fullHash << 192);
        return hashes;
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
     * Public getter for mint count based on minter address, canvas address, and canvas token ID.
     * @param minter The address of the minter.
     * @param canvasAddress The address of the canvas.
     * @param canvasTokenId The token ID of the canvas.
     * @return The mint count for the given minter and canvas combination.
     */
    function getCanvasMintCount(address minter, address canvasAddress, uint256 canvasTokenId) public view returns (uint256) {
        bytes32 addressCanvasHash = keccak256(abi.encodePacked(minter, keccak256(abi.encodePacked(canvasAddress, canvasTokenId))));
        return _addressMintCounts[addressCanvasHash];
    }

    /**
    @notice Packs metadata for storage
    @param data the metadata struct
    @return slots the metadata slots
    */
    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](3);
        slots[0] = data.sequence;
        uint256 decorationsPacked;
        for (uint i = 0; i < 4; i++) {
            decorationsPacked |= uint256(uint64(data.decorations[i])) << (i * 64);
        }
        slots[1] = decorationsPacked;
        slots[2] = uint256(uint160(data.minter)) << 20;
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
        data.sequence = slots[0];
 
        for (uint i = 0; i < data.decorations.length; i++) {
            data.decorations[i] = bytes8(uint64(slots[1] >> (i * 64)));
        }
        data.minter = address(uint160(slots[2] >> 20));
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
    @notice Loads sequence number for a tokenId 
    @param tokenId the tokenId to use
    @return sequence the sequence number
    */
    function loadSequence(uint256 tokenId) public view returns (uint256 sequence) {
        sequence = _metadataStorage[tokenId][0];
    }

    /**
    @notice Loads the original minter of a tokenId 
    @param tokenId the tokenId to use
    @return minter the minter
    */
    function loadMinter(uint256 tokenId) public view returns (address minter) {
        minter = address(uint160(_metadataStorage[tokenId][2] >> 20));
    }

    /**
    @notice Loads the token pseudorandomness (decorations) 
    @param tokenId the tokenId to use
    @return decorations the decorations
    */
    function loadDecorations(uint256 tokenId) public view returns (bytes8[4] memory decorations) {
        uint256 decorationsPacked = _metadataStorage[tokenId][1];
        for (uint i = 0; i < decorations.length; i++) {
            decorations[i] = bytes8(uint64(decorationsPacked >> (i * 64)));
        }
    }

    /**
    @dev owned by the assignment's owner
    @dev See {IERC721-ownerOf}
    */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        // Normal ERC721 ownership for bubble
        return ERC721.ownerOf(tokenId);
    }

    /**
    @dev See {IERC721-transferFrom}.
    */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        // Override to skip calling PatchworkProtocol.applyTransfer() as we want different rules than default
        if (locked(tokenId)) {
            revert IPatchworkProtocol.Locked(address(this), tokenId);
        }
        ERC721.transferFrom(from, to, tokenId);
    }

    /**
    @dev See {IERC721-safeTransferFrom}.
    */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        // Override to skip calling PatchworkProtocol.applyTransfer() as we want different rules than default
        if (locked(tokenId)) {
            revert IPatchworkProtocol.Locked(address(this), tokenId);
        }
        ERC721.safeTransferFrom(from, to, tokenId, data);
    }

    /**
    @dev See {IPatchworAssignable-allowAssignment}
    */
    function allowAssignment(uint256 /*ourTokenId*/, address /*target*/, uint256 /*targetTokenId*/, address /*targetOwner*/, address /*by*/, string memory /*scopeName*/) virtual public override pure returns (bool) {
        return true;
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
}