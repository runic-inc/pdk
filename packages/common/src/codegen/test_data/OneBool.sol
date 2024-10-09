// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./OneBoolGenerated.sol";

contract OneBool is OneBoolGenerated {
  constructor(address _manager, address _owner) OneBoolGenerated(_manager, _owner) {}
}
