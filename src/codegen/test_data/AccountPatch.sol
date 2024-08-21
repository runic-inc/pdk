// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "./AccountPatchGenerated.sol";

contract AccountPatch2 is AccountPatchGenerated {

    constructor(address _manager, address _owner)
        AccountPatch(_manager, _owner)
    {}
}