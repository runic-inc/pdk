// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./OneIntGenerated.sol";

contract OneInt is OneIntGenerated {
  constructor(address _manager, address _owner) OneIntGenerated(_manager, _owner) {}
}
