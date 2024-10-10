// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./AccountPatchFragmentSingleGenerated.sol";

contract AccountPatchFragmentSingle is AccountPatchFragmentSingleGenerated {
  constructor(address _manager, address _owner) AccountPatchFragmentSingleGenerated(_manager, _owner) {}
}
