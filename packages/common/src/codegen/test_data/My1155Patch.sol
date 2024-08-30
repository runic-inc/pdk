// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./My1155PatchGenerated.sol";

contract My1155Patch is My1155PatchGenerated {
  constructor(address _manager, address _owner) My1155PatchGenerated(_manager, _owner) {}
}
