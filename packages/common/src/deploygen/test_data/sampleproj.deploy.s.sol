// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./LiteRef8.sol";
import "./FragmentSingle.sol";

contract SampleProjDeploy is Script {
    function run() external {

        address ownerAddress = vm.envAddress("OWNER");
        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);

        vm.startBroadcast();
        // TODO claim scope
        LiteRef8 lr8 = new LiteRef8(ppAddress, ownerAddress);
        FragmentSingle fs = new FragmentSingle(ppAddress, ownerAddress);
        lr8.registerFragment(fs);
        vm.stopBroadcast();
    }
}
