// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./Patch1155FragmentSingleGenerated.sol";

contract Patch1155FragmentSingle is Patch1155FragmentSingleGenerated {
    constructor(address _manager, address _owner) Patch1155FragmentSingleGenerated(_manager, _owner) {}

    // Add your custom logic here
    // This contract will not be overwritten by PDK when regenerating contracts
    // See https://docs.patchwork.dev for more details

    // example - customizing minting rules for an IPatchworkMintable
    // function _mintSingle(address to, bytes calldata /* data */) internal override returns (uint256) {
        // add custom mint rules here
    // }

    // example - adding a burn function
    // function burn(uint256 tokenId) internal override {
        // add custom burn rules here
        // _burn(tokenId);
    // }
}
