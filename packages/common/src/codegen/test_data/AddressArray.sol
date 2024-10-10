// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./AddressArrayGenerated.sol";

contract AddressArray is AddressArrayGenerated {
  constructor(address _manager, address _owner) AddressArrayGenerated(_manager, _owner) {}
}
