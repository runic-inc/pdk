// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./DynStringGenerated.sol";

contract DynString is DynStringGenerated {
  constructor(address _manager, address _owner) DynStringGenerated(_manager, _owner) {}
}
