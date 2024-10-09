// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./OneStringGenerated.sol";

contract OneString is OneStringGenerated {
  constructor(address _manager, address _owner) OneStringGenerated(_manager, _owner) {}
}
