// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./AccountPatchGenerated.sol";

contract AccountPatch is AccountPatchGenerated {
  constructor(address _manager, address _owner) AccountPatchGenerated(_manager, _owner) {}
}
