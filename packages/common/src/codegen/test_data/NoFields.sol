// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./NoFieldsGenerated.sol";

contract NoFields is NoFieldsGenerated {
  constructor(address _manager, address _owner) NoFieldsGenerated(_manager, _owner) {}
}
