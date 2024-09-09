// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./LiteRef8.sol";
import "./FragmentSingle.sol";
import "@patchwork/PatchworkProtocol.sol";

contract SampleProjectDeploy is Script {
    function run() external {
        address ownerAddress = vm.envAddress("OWNER");
        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);

        vm.startBroadcast();
        PatchworkProtocol pp = PatchworkProtocol(ppAddress);
        pp.claimScope("MyScope");
        pp.setScopeRules("MyScope", false, false, true);
        LiteRef8 literef8 = new LiteRef8(ppAddress, ownerAddress);
        FragmentSingle fragmentsingle = new FragmentSingle(ppAddress, ownerAddress);
        literef8.registerFragment(fragmentsingle);
        pp.addWhitelist("MyScope", address(literef8));
        pp.addWhitelist("MyScope", address(fragmentsingle));
        vm.stopBroadcast();
    }
}
