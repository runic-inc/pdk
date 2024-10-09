// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./TwoIntsGenerated.sol";

contract TwoInts is TwoIntsGenerated {
  constructor(address _manager, address _owner) TwoIntsGenerated(_manager, _owner) {}
}
