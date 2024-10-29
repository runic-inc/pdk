// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./LiteRef8.sol";
import "./FragmentSingle.sol";
import "@patchwork/PatchworkProtocol.sol";

struct DeploymentAddresses {
    address literef8;
    address fragmentsingle;
}

contract SampleProjectDeploy is Script {
    function run() external returns (DeploymentAddresses memory) {
        address ownerAddress = vm.envAddress("OWNER");
        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);

        vm.startBroadcast();
        PatchworkProtocol pp = PatchworkProtocol(ppAddress);
        if (pp.getScopeOwner("test") == address(0)) {
            pp.claimScope("test");
            pp.setScopeRules("test", false, false, true);
        }
        LiteRef8 literef8 = new LiteRef8(ppAddress, ownerAddress);
        FragmentSingle fragmentsingle = new FragmentSingle(ppAddress, ownerAddress);
        literef8.registerReferenceAddress(address(fragmentsingle));
        pp.addWhitelist("test", address(literef8));
        pp.addWhitelist("test", address(fragmentsingle));
        vm.stopBroadcast();

        return DeploymentAddresses({
            literef8: address(literef8),
            fragmentsingle: address(fragmentsingle)
        });
    }
}
