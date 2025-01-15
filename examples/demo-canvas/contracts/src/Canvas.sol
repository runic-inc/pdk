// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;
import "./CanvasGenerated.sol";

contract Canvas is CanvasGenerated {
    enum MintMode { OWNER, OPEN }
    MintMode private _mintMode = MintMode.OWNER;

    constructor(address manager_, address owner_) 
        CanvasGenerated(manager_, owner_) 
    {}

    function _mintSingle(address to, bytes calldata) internal override returns (uint256) {
        if (_mintMode == MintMode.OWNER) {
            require(msg.sender == owner(), "minting not allowed");
        }
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
        return tokenId;
    }

    function setMintMode(MintMode mode) public {
        require(msg.sender == owner(), "Only owner can set mint mode");
        _mintMode = mode;
    }
}