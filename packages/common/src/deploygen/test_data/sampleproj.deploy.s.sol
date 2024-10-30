// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "./LiteRef8.sol";
import "./FragmentSingle.sol";
import "@patchwork/PatchworkProtocol.sol";

struct DeploymentInfo {
    address deployedAddress;
    bytes32 bytecodeHash;
}

struct DeploymentAddresses {
    DeploymentInfo literef8;
    DeploymentInfo fragmentsingle;
}

contract SampleProjectDeploy is Script {
    function run() external returns (DeploymentAddresses memory) {
        address ownerAddress = vm.envAddress("OWNER");
        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        bytes32 salt = bytes32(vm.envOr("DEPLOY_SALT", uint256(0)));
        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);
        console.log("deployment salt: ", vm.toString(salt));

        vm.startBroadcast();
        PatchworkProtocol pp = PatchworkProtocol(ppAddress);
        if (pp.getScopeOwner("test") == address(0)) {
            pp.claimScope("test");
            pp.setScopeRules("test", false, false, true);
        }
        bytes memory literef8CreationCode = type(LiteRef8).creationCode;
        bytes memory literef8CreationBytecode = abi.encodePacked(literef8CreationCode, abi.encode(ppAddress, ownerAddress));
        bytes32 literef8BytecodeHash = keccak256(literef8CreationBytecode);
        console.log("LiteRef8 codehash: ", Strings.toHexString(uint256(literef8BytecodeHash)));
        LiteRef8 literef8 = new LiteRef8{salt: salt}(ppAddress, ownerAddress);
        console.log("LiteRef8 deployed at: ", address(literef8));

        bytes memory fragmentsingleCreationCode = type(FragmentSingle).creationCode;
        bytes memory fragmentsingleCreationBytecode = abi.encodePacked(fragmentsingleCreationCode, abi.encode(ppAddress, ownerAddress));
        bytes32 fragmentsingleBytecodeHash = keccak256(fragmentsingleCreationBytecode);
        console.log("FragmentSingle codehash: ", Strings.toHexString(uint256(fragmentsingleBytecodeHash)));
        FragmentSingle fragmentsingle = new FragmentSingle{salt: salt}(ppAddress, ownerAddress);
        console.log("FragmentSingle deployed at: ", address(fragmentsingle));

        literef8.registerReferenceAddress(address(fragmentsingle));
        pp.addWhitelist("test", address(literef8));
        pp.addWhitelist("test", address(fragmentsingle));
        vm.stopBroadcast();

        return DeploymentAddresses({
            literef8: DeploymentInfo({
                deployedAddress: address(literef8),
                bytecodeHash: literef8BytecodeHash
            }),
            fragmentsingle: DeploymentInfo({
                deployedAddress: address(fragmentsingle),
                bytecodeHash: fragmentsingleBytecodeHash
            })
        });
    }
}
