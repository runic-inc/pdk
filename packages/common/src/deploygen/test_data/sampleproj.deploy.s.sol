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
    DeploymentInfo LiteRef8;
    DeploymentInfo FragmentSingle;
}

contract SampleProjectDeploy is Script {
    function run() external returns (DeploymentAddresses memory) {
        address ownerAddress = vm.envAddress("OWNER");
        address ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        bytes32 salt = bytes32(vm.envOr("DEPLOY_SALT", uint256(0)));
        bool bytecodeOnly = vm.envOr("BYTECODE_ONLY", false);

        address create2DeployerAddress = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);
        console.log("deployment salt: ", vm.toString(salt));
        console.log("bytecode only mode: ", bytecodeOnly);

        DeploymentAddresses memory deployments;

        bytes memory literef8CreationCode = type(LiteRef8).creationCode;
        bytes memory literef8CreationBytecode = abi.encodePacked(literef8CreationCode, abi.encode(ppAddress, ownerAddress));
        bytes32 literef8BytecodeHash = keccak256(literef8CreationBytecode);
        console.log("LiteRef8 codehash: ", Strings.toHexString(uint256(literef8BytecodeHash)));

        address predictedLiteRef8Address = vm.computeCreate2Address(
            salt,
            literef8BytecodeHash,
            create2DeployerAddress
        );
        console.log("Predicted LiteRef8 address: ", predictedLiteRef8Address);

        deployments.LiteRef8 = DeploymentInfo({
            deployedAddress: predictedLiteRef8Address,
            bytecodeHash: literef8BytecodeHash
        });

        bytes memory fragmentsingleCreationCode = type(FragmentSingle).creationCode;
        bytes memory fragmentsingleCreationBytecode = abi.encodePacked(fragmentsingleCreationCode, abi.encode(ppAddress, ownerAddress));
        bytes32 fragmentsingleBytecodeHash = keccak256(fragmentsingleCreationBytecode);
        console.log("FragmentSingle codehash: ", Strings.toHexString(uint256(fragmentsingleBytecodeHash)));

        address predictedFragmentSingleAddress = vm.computeCreate2Address(
            salt,
            fragmentsingleBytecodeHash,
            create2DeployerAddress
        );
        console.log("Predicted FragmentSingle address: ", predictedFragmentSingleAddress);

        deployments.FragmentSingle = DeploymentInfo({
            deployedAddress: predictedFragmentSingleAddress,
            bytecodeHash: fragmentsingleBytecodeHash
        });

        if (!bytecodeOnly) {
            vm.startBroadcast();
            PatchworkProtocol pp = PatchworkProtocol(ppAddress);

            if (pp.getScopeOwner("test") == address(0)) {
                pp.claimScope("test");
                pp.setScopeRules("test", false, false, true);
            }
            LiteRef8 literef8 = new LiteRef8{salt: salt}(ppAddress, ownerAddress);
            assert(address(literef8) == predictedLiteRef8Address); // Verify prediction
            console.log("LiteRef8 deployed at: ", address(literef8));
            deployments.LiteRef8.deployedAddress = address(literef8);

            FragmentSingle fragmentsingle = new FragmentSingle{salt: salt}(ppAddress, ownerAddress);
            assert(address(fragmentsingle) == predictedFragmentSingleAddress); // Verify prediction
            console.log("FragmentSingle deployed at: ", address(fragmentsingle));
            deployments.FragmentSingle.deployedAddress = address(fragmentsingle);

            literef8.registerReferenceAddress(address(fragmentsingle));
            pp.addWhitelist("test", address(literef8));
            pp.addWhitelist("test", address(fragmentsingle));
            vm.stopBroadcast();
        }

        return deployments;
    }
}
