// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./IntArrayGenerated.sol";

contract IntArray is IntArrayGenerated {
  constructor(address _manager, address _owner) IntArrayGenerated(_manager, _owner) {}
}
