// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./CharacterGenerated.sol";
import "./CharacterTraits.sol";
import "@patchwork/interfaces/IPatchworkProtocol.sol";
import "@patchwork/interfaces/IPatchworkSingleAssignable.sol";

contract Character is CharacterGenerated {
    event Forge(
        address indexed owner,
        uint256 indexed tokenId,
        address[] traitAddresses,
        uint256[] traitTokenIds,
        bytes8 bgColor
    );
    event Change(
        address indexed owner,
        uint256 indexed tokenId,
        address[] traitAddresses,
        uint256[] traitTokenIds,
        bytes8 bgColor
    );
    event Burn(address indexed owner, uint256 indexed tokenId);

    uint256 private _nextTokenId;
    uint256 private _burnedCount;

    struct TraitTypeCounts {
        uint256 body;
        uint256 clothing;
        uint256 expression;
        uint256 hair;
        uint256 accessory;
    }

    constructor(address manager_, address owner_) 
        CharacterGenerated(manager_, owner_) 
    {}

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - _burnedCount;
    }

    function _checkTraitRules(address tokenOwner, address[] memory traitAddresses, uint256[] memory tokenIds) internal view {
        TraitTypeCounts memory traitCounts;

        for (uint256 i = 0; i < traitAddresses.length; i++) {
            if (traitAddresses[i] == address(0)) {
                continue;
            }

            require(
                IERC721(traitAddresses[i]).ownerOf(tokenIds[i]) == tokenOwner,
                "Must own all traits"
            );

            uint8 traitType = CharacterTraits(traitAddresses[i]).loadTraittype(tokenIds[i]);

            if (traitType == 0) traitCounts.body++;
            else if (traitType == 1) traitCounts.clothing++;
            else if (traitType == 2) traitCounts.expression++;
            else if (traitType == 3) traitCounts.hair++;
            else if (traitType == 4) traitCounts.accessory++;
        }

        require(traitCounts.body == 1, "Body trait required");
        require(traitCounts.clothing == 1, "Clothing trait required");
        require(traitCounts.expression == 1, "Expression trait required");
        require(traitCounts.hair == 1, "Hair trait required");
        require(traitCounts.accessory <= 1, "Only one accessory allowed");
    }

    function forge(
        address[] calldata traitAddresses,
        uint256[] calldata traitTokenIds,
        bytes8 bgColor
    ) public returns (uint256) {
        require(
            traitAddresses.length == traitTokenIds.length,
            "Arrays must be same length"
        );

        address owner_ = msg.sender;
        _checkTraitRules(owner_, traitAddresses, traitTokenIds);

        uint256 newTokenId = _nextTokenId;
        _safeMint(owner_, newTokenId);
        
        Metadata memory metadata = Metadata({
            name: "",
            bg_color: bgColor,
            attributeLiteRefs: [uint64(0), uint64(0), uint64(0), uint64(0), uint64(0), uint64(0), uint64(0), uint64(0)]
        });
        
        _metadataStorage[newTokenId] = packMetadata(metadata);
        _nextTokenId++;

        IPatchworkProtocol(_manager).assignBatch(
            traitAddresses,
            traitTokenIds,
            address(this),
            newTokenId
        );

        emit Forge(owner_, newTokenId, traitAddresses, traitTokenIds, bgColor);
        emit MetadataUpdate(newTokenId);
        return newTokenId;
    }

    struct TraitEdit {
        ActionType action;
        address oldTraitAddress;
        uint256 oldTraitTokenId;
        address newTraitAddress;
        uint256 newTraitTokenId;
    }

    enum ActionType { Add, Remove, Replace }

    function editTraits(uint256 tokenId, TraitEdit[] calldata edits, bytes8 bgColor) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        Metadata memory metadata = loadMetadata(tokenId);
        metadata.bg_color = bgColor;
        _metadataStorage[tokenId] = packMetadata(metadata);

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

        // Check rules after all edits
        (address[] memory traitAddresses, uint256[] memory traitTokenIds) = loadTraits(tokenId);
        _checkTraitRules(msg.sender, traitAddresses, traitTokenIds);
        
        emit Change(msg.sender, tokenId, traitAddresses, traitTokenIds, bgColor);
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

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        (address[] memory traitAddresses, uint256[] memory traitTokenIds) = loadTraits(tokenId);
        for (uint256 i = 0; i < traitAddresses.length; i++) {
            if (traitAddresses[i] != address(0)) {
                IPatchworkProtocol(_manager).unassignSingle(traitAddresses[i], traitTokenIds[i]);
            }
        }

        emit Burn(msg.sender, tokenId);

        _burn(tokenId);
        delete _metadataStorage[tokenId];
        _burnedCount++;
    }

    function loadTraits(uint256 tokenId) public view returns (
        address[] memory traitAddresses,
        uint256[] memory traitTokenIds
    ) {
        traitAddresses = new address[](5);
        traitTokenIds = new uint256[](5);
        return loadAllStaticReferences(tokenId);
    }
}