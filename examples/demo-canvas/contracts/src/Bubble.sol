// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;
import "./BubbleGenerated.sol";

contract Bubble is BubbleGenerated {
    constructor(address manager_, address owner_) 
        BubbleGenerated(manager_, owner_) 
    {}

    function _mintSingle(address to, bytes calldata data) internal override returns (uint256) {
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

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(to, tokenId);

        bytes8[] memory hashes = generateDecorations(to, 0);
        Metadata memory metadata = Metadata({
            sequence: tokenId,
            decorations: [hashes[0], hashes[1], hashes[2], hashes[3]],
            minter: to
        });

        _metadataStorage[tokenId] = packMetadata(metadata);
        IPatchworkProtocol(_manager).assign(address(this), tokenId, canvasAddress, canvasTokenId);
        return tokenId;
    }

    function generateDecorations(address minter, uint256 salt) private pure returns (bytes8[] memory) {
        bytes32 fullHash = keccak256(abi.encodePacked(minter, salt));
        bytes8[] memory hashes = new bytes8[](4);
        hashes[0] = bytes8(fullHash);
        hashes[1] = bytes8(fullHash << 64);
        hashes[2] = bytes8(fullHash << 128);
        hashes[3] = bytes8(fullHash << 192);
        return hashes;
    }

    function allowAssignment(uint256, address, uint256, address, address, string memory) 
        public 
        pure 
        override 
        returns (bool) 
    {
        return true;
    }
}