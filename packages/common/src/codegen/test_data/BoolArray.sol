// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./BoolArrayGenerated.sol";

contract BoolArray is BoolArrayGenerated {
  constructor(address _manager, address _owner) BoolArrayGenerated(_manager, _owner) {}
}
