// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./CharacterGenerated.sol";
import "@patchwork/interfaces/IPatchworkProtocol.sol";
import "@patchwork/interfaces/IPatchworkSingleAssignable.sol";

contract Character is CharacterGenerated {
    event Forge(
        address indexed owner,
        uint256 indexed tokenId,
        address[] traitAddresses,
        uint256[] traitTokenIds
    );
    event Change(
        address indexed owner,
        uint256 indexed tokenId,
        address[] traitAddresses,
        uint256[] traitTokenIds
    );
    event Burn(address indexed owner, uint256 indexed tokenId);

    uint256 private _nextTokenId;
    uint256 private _burnedCount;

    constructor(address manager_, address owner_) 
        CharacterGenerated(manager_, owner_) 
    {}

    /**
     * @notice Gets the total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - _burnedCount;
    }

    /**
     * @notice Forges a new character from traits
     * @param traitAddresses Array of trait contract addresses
     * @param traitTokenIds Array of trait token IDs
     */
    function forge(
        address[] calldata traitAddresses,
        uint256[] calldata traitTokenIds
    ) public returns (uint256) {
        require(
            traitAddresses.length == traitTokenIds.length,
            "Arrays must be same length"
        );

        address owner_ = msg.sender;

        // Mint the character token
        uint256 newTokenId = _nextTokenId;
        _safeMint(owner_, newTokenId);
        _metadataStorage[newTokenId] = new uint256[](1);
        _nextTokenId++;

        // Check ownership of traits
        for (uint256 i = 0; i < traitAddresses.length; i++) {
            require(
                IERC721(traitAddresses[i]).ownerOf(traitTokenIds[i]) == owner_,
                "Must own all traits"
            );
        }

        // Assign all traits to the character
        IPatchworkProtocol(_manager).assignBatch(
            traitAddresses,
            traitTokenIds,
            address(this),
            newTokenId
        );

        emit Forge(owner_, newTokenId, traitAddresses, traitTokenIds);
        emit MetadataUpdate(newTokenId);
        return newTokenId;
    }

    /**
     * @notice Edit traits assigned to a character
     */
    struct TraitEdit {
        ActionType action;
        address oldTraitAddress;
        uint256 oldTraitTokenId;
        address newTraitAddress;
        uint256 newTraitTokenId;
    }

    enum ActionType { Add, Remove, Replace }

    function editTraits(uint256 tokenId, TraitEdit[] calldata edits) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        for (uint256 i = 0; i < edits.length; i++) {
            TraitEdit memory edit = edits[i];
            if (edit.action == ActionType.Add) {
                _addTrait(tokenId, edit.newTraitAddress, edit.newTraitTokenId);
            } else if (edit.action == ActionType.Remove) {
                _removeTrait(tokenId, edit.oldTraitAddress, edit.oldTraitTokenId);
            } else if (edit.action == ActionType.Replace) {
                _swapTrait(
                    tokenId,
                    edit.oldTraitAddress,
                    edit.oldTraitTokenId,
                    edit.newTraitAddress,
                    edit.newTraitTokenId
                );
            }
        }

        // Emit change event with updated traits
        (address[] memory traitAddresses, uint256[] memory traitTokenIds) = loadTraits(tokenId);
        emit Change(msg.sender, tokenId, traitAddresses, traitTokenIds);
        emit MetadataUpdate(tokenId);
    }

    function _addTrait(uint256 tokenId, address traitAddress, uint256 traitTokenId) internal {
        require(IERC721(traitAddress).ownerOf(traitTokenId) == msg.sender, "Must own trait");
        IPatchworkProtocol(_manager).assign(traitAddress, traitTokenId, address(this), tokenId);
    }

    function _removeTrait(uint256 tokenId, address traitAddress, uint256 traitTokenId) internal {
        IPatchworkProtocol(_manager).unassignSingle(traitAddress, traitTokenId);
    }

    function _swapTrait(
        uint256 tokenId,
        address oldTraitAddress,
        uint256 oldTraitTokenId,
        address newTraitAddress,
        uint256 newTraitTokenId
    ) internal {
        require(IERC721(newTraitAddress).ownerOf(newTraitTokenId) == msg.sender, "Must own new trait");
        IPatchworkProtocol(_manager).unassignSingle(oldTraitAddress, oldTraitTokenId);
        IPatchworkProtocol(_manager).assign(newTraitAddress, newTraitTokenId, address(this), tokenId);
    }

    /**
     * @notice Burns a character and releases its traits
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Load and unassign all traits
        (address[] memory traitAddresses, uint256[] memory traitTokenIds) = loadTraits(tokenId);
        for (uint256 i = 0; i < traitAddresses.length; i++) {
            if (traitAddresses[i] != address(0)) {
                IPatchworkProtocol(_manager).unassignSingle(traitAddresses[i], traitTokenIds[i]);
            }
        }

        emit Burn(msg.sender, tokenId);

        // Burn the character
        _burn(tokenId);
        delete _metadataStorage[tokenId];
        _burnedCount++;
    }

    /**
     * @notice Load all traits assigned to a character
     */
    function loadTraits(uint256 tokenId) public view returns (
        address[] memory traitAddresses,
        uint256[] memory traitTokenIds
    ) {
        // Initialize arrays to store trait data
        traitAddresses = new address[](5); // Assuming max 5 trait types
        traitTokenIds = new uint256[](5);

        // Load all static references (traits)
        return loadAllStaticReferences(tokenId);
    }
}