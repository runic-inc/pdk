// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./PatchGenerated.sol";

contract Patch is PatchGenerated {
  constructor(address _manager, address _owner) PatchGenerated(_manager, _owner) {}
}
