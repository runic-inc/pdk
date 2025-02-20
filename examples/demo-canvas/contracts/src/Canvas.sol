// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;
import "./CanvasGenerated.sol";

contract Canvas is CanvasGenerated {
    enum MintMode { OWNER, OPEN }
    MintMode private _mintMode = MintMode.OWNER;

    constructor(address manager_, address owner_) 
        CanvasGenerated(manager_, owner_) 
    {}

    function mint(address to, bytes calldata data) public override payable returns (uint256 tokenId) {
        if (_mintMode == MintMode.OWNER) {
            require(tx.origin == owner(), "minting not allowed");
        } else {
            if (msg.sender != _manager) {
                return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);
            }
        }
        return _mintSingle(to, data);
    }

    function _mintSingle(address to, bytes calldata) internal override returns (uint256) {        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);
        //TODO: set canvas name in metadata
        _metadataStorage[tokenId] = new uint256[](1);
        return tokenId;
    }

    function setMintMode(MintMode mode) public {
        require(msg.sender == owner(), "Only owner can set mint mode");
        _mintMode = mode;
    }
}