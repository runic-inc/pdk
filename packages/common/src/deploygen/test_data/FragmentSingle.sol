// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./FragmentSingleGenerated.sol";

contract FragmentSingle is FragmentSingleGenerated {
  constructor(address _manager, address _owner) FragmentSingleGenerated(_manager, _owner) {}
}
