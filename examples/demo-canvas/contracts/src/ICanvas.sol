// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
@notice Interface for Canvas
@author Runic Labs, Inc
*/
interface ICanvas {

    /// Onchain canvas metadata
    struct Metadata {
        string name;
    }

     /**
    @notice Stores metadata for a tokenId
    @param tokenId the tokenId to store metadata for
    @param data the metadata
    */
    function storeMetadata(uint256 tokenId, Metadata memory data) external;

    /**
    @notice Loads metadata for a tokenId
    @param tokenId the tokenId to load metadata for
    @return data the metadata
    */
    function loadMetadata(uint256 tokenId) external view returns (Metadata memory data);

    /**
    @notice Packs metadata for storage
    @param data the metadata struct
    @return slots the metadata slots
    */
    function packMetadata(Metadata memory data) external pure returns (uint256[] memory slots);

    /**
    @notice Unpacks packed metadata from storage format
    @param slots the metadata slots
    @return data the metadata struct
    */
    function unpackMetadata(uint256[] memory slots) external pure returns (Metadata memory data);

    /**
    @notice Loads an canvas name for a tokenId 
    @param tokenId the tokenId to use
    @return string the name
    */
    function loadName(uint256 tokenId) external view returns (string memory);

}