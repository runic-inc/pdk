// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract TestBase721 is ERC721 {
    uint256 public _tokenId;

    constructor() ERC721("TestBase", "TEST") {
    }

    function mint(address to) public returns (uint256) {
        uint256 newTokenId = _tokenId++;
        _safeMint(to, newTokenId);
        return newTokenId;
    }
}