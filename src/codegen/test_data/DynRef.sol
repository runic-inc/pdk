// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./DynRefGenerated.sol";

contract DynRef is DynRefGenerated {
  constructor(address _manager, address _owner) DynRefGenerated(_manager, _owner) {}
}
