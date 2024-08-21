// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./MintableGenerated.sol";

contract Mintable is MintableGenerated {
  constructor(address _manager, address _owner) MintableGenerated(_manager, _owner) {}
}
