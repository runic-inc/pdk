// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./Patch1155FragmentSingleGenerated.sol";

contract Patch1155FragmentSingle is Patch1155FragmentSingleGenerated {
  constructor(address _manager, address _owner) Patch1155FragmentSingleGenerated(_manager, _owner) {}
}
