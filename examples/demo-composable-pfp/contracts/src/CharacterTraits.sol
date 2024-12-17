// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./CharacterTraitsGenerated.sol";

contract CharacterTraits is CharacterTraitsGenerated {
    // Constants
    uint8 constant NUM_TRAIT_TYPES = 7;

    enum TraitType {
        BACKGROUND,
        BASE,
        EYE,
        MOUTH,
        CLOTHING,
        HAIR,
        ACCESSORY
    }
    
    event Register(uint16 indexed traitId, uint8 indexed traitType, string name);
    event SupplyLock(uint16 indexed traitId);

    // Mapping to store trait definitions
    mapping(uint16 => bool) private _registeredTraits;
    mapping(uint8 => uint16[]) private _traitsByType;
    // Storage for locked traits
    mapping(uint16 => bool) private _supplyLockedTraits;
    // Storage for trait definitions
    mapping(uint16 => Metadata) private _traitDefinitions;
    // Storage for user mint counts
    mapping(address => uint256) private _userMintCount;
    
    constructor(address manager_, address owner_) 
        CharacterTraitsGenerated(manager_, owner_) 
    {}

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

    /**
     * @dev Override _mintSingle to assign trait metadata during mint, using user's mint count for type
     */
    function _mintSingle(address to, bytes calldata /* data */) internal override returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        // Get current user's mint count and increment it
        uint256 userMintCount = _userMintCount[to];
        _userMintCount[to] = userMintCount + 1;
        
        // Determine trait type based on user's mint count
        uint8 traitType = uint8(userMintCount % NUM_TRAIT_TYPES);
        
        // Get traits for current type
        uint16[] storage traitsOfType = _traitsByType[traitType];
        require(traitsOfType.length > 0, string.concat("No traits registered for type ", Strings.toString(traitType)));
        
        // Get random trait of current type
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, userMintCount))) % traitsOfType.length;
        uint16 traitId = traitsOfType[randomIndex];
        
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
     * @notice Get a user's current mint count
     */
    function getUserMintCount(address user) public view returns (uint256) {
        return _userMintCount[user];
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
    function getTraitsByType(uint8 traitType) public view returns (uint16[] memory) {
        return _traitsByType[traitType];
    }
}