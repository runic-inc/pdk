// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./CharacterTraitsGenerated.sol";

contract CharacterTraits is CharacterTraitsGenerated {
    // Simplified events - removed isPromo
    event Register(
        uint16 indexed traitId,
        uint8 indexed traitType,
        string name
    );
    event SupplyLock(uint16 indexed traitId);

    // Mapping to store trait definitions
    mapping(uint16 => bool) private _registeredTraits;
    mapping(uint8 => uint16[]) private _traitsByType;
    // Storage for locked traits
    mapping(uint16 => bool) private _supplyLockedTraits;

    constructor(
        address manager_,
        address owner_
    ) CharacterTraitsGenerated(manager_, owner_) {}

    /**
     * @notice Register new traits that can be minted
     * @param ids Trait IDs to register
     * @param names Names for each trait
     * @param traitTypes Type for each trait
     */
    function registerTraits(
        uint16[] calldata ids,
        string[] calldata names,
        uint8[] calldata traitTypes
    ) external onlyOwner {
        require(
            ids.length == names.length && ids.length == traitTypes.length,
            "Arrays must be same length"
        );

        for (uint256 i = 0; i < ids.length; i++) {
            require(!_registeredTraits[ids[i]], "Trait already registered");
            require(ids[i] != 0, "Cannot register ID 0");

            _registeredTraits[ids[i]] = true;
            _traitsByType[traitTypes[i]].push(ids[i]);

            // Pre-register the metadata
            Metadata memory metadata = Metadata({
                trait_name: names[i],
                trait_id: ids[i],
                trait_type: traitTypes[i]
            });
            _traitDefinitions[ids[i]] = metadata;

            // Simplified Register event
            emit Register(ids[i], traitTypes[i], names[i]);
        }
    }

    // Storage for trait definitions
    mapping(uint16 => Metadata) private _traitDefinitions;

    /**
     * @dev Override _mintSingle to assign trait metadata during mint
     */
    function _mintSingle(
        address to,
        bytes calldata /* data */
    ) internal override returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        // Get a random registered trait
        uint16 traitId = _getRandomRegisteredTrait();

        // Get the predefined metadata for this trait
        Metadata memory metadata = _traitDefinitions[traitId];

        // Mint the token
        _safeMint(to, tokenId);

        // Store the metadata
        _metadataStorage[tokenId] = packMetadata(metadata);

        return tokenId;
    }

    /**
     * @notice Locks supply for a traitId (forever)
     */
    function supplyLock(uint16 traitId) public onlyOwner {
        require(_registeredTraits[traitId], "Trait does not exist");
        require(!_supplyLockedTraits[traitId], "Trait already locked");

        uint8 traitType = _traitDefinitions[traitId].trait_type;
        _removeFromTraitType(traitType, traitId);
        _supplyLockedTraits[traitId] = true;

        emit SupplyLock(traitId);
    }

    /**
     * @dev Remove a trait from its type array
     */
    function _removeFromTraitType(uint8 traitType, uint16 traitId) internal {
        uint16[] storage traits = _traitsByType[traitType];
        for (uint256 i = 0; i < traits.length; i++) {
            if (traits[i] == traitId) {
                // Swap with the last element if not the last
                if (i != traits.length - 1) {
                    traits[i] = traits[traits.length - 1];
                }
                traits.pop();
                break;
            }
        }
    }

    /**
     * @dev Get a random registered trait ID
     */
    function _getRandomRegisteredTrait() internal view returns (uint16) {
        // Get a random trait type first
        uint8 numTypes = 5; // Assuming we have 5 trait types (0-4)
        uint8 randomType = uint8(
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) %
                numTypes
        );

        uint16[] storage traitsOfType = _traitsByType[randomType];
        require(traitsOfType.length > 0, "No traits registered for type");

        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, randomType))
        ) % traitsOfType.length;
        return traitsOfType[randomIndex];
    }

    /**
     * @notice Check if a trait ID is registered
     */
    function isTraitRegistered(uint16 traitId) public view returns (bool) {
        return _registeredTraits[traitId];
    }

    /**
     * @notice Get all trait IDs for a given trait type
     */
    function getTraitsByType(
        uint8 traitType
    ) public view returns (uint16[] memory) {
        return _traitsByType[traitType];
    }
}
