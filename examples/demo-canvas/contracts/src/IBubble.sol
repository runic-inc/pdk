// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
@notice Interface for Bubble
@author Runic Labs, Inc
*/
interface IBubble {

    /// Onchain bubble metadata
    struct Metadata {
        uint256 sequence;
        bytes8[4] decorations;
        address minter;
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
    @notice Loads sequence number for a tokenId 
    @param tokenId the tokenId to use
    @return sequence the sequence number
    */
    function loadSequence(uint256 tokenId) external view returns (uint256 sequence);

    /**
    @notice Loads the original minter of a tokenId 
    @param tokenId the tokenId to use
    @return minter the minter
    */
    function loadMinter(uint256 tokenId) external view returns (address minter);

    /**
    @notice Loads the token pseudorandomness (decorations) 
    @param tokenId the tokenId to use
    @return decorations the decorations
    */
    function loadDecorations(uint256 tokenId) external view returns (bytes8[4] memory decorations);
}