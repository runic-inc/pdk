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
    address private ownerAddress;
    address private ppAddress;
    bytes32 private salt;
    address private constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() external returns (DeploymentAddresses memory) {
        ownerAddress = vm.envAddress("OWNER");
        ppAddress = vm.envAddress("PATCHWORK_PROTOCOL");
        salt = bytes32(vm.envOr("DEPLOY_SALT", uint256(0)));
        bool tryDeploy = vm.envOr("TRY_DEPLOY", false);

        logDeploymentInfo();

        DeploymentAddresses memory deployments;

        deployments = prepareDeployments();

        if (tryDeploy) {
            performDeployment(deployments);
        }

        return deployments;
    }

    function logDeploymentInfo() private view {
        console.log("Deployer starting");
        console.log("owner: ", ownerAddress);
        console.log("patchwork protocol: ", ppAddress);
        console.log("deployment salt: ", vm.toString(salt));
    }

    function prepareDeployments() private view returns (DeploymentAddresses memory) {
        DeploymentAddresses memory deployments;

        bytes memory literef8CreationCode = type(LiteRef8).creationCode;
        bytes memory literef8CreationBytecode = abi.encodePacked(literef8CreationCode, abi.encode(ppAddress, ownerAddress));
        bytes32 literef8BytecodeHash = keccak256(literef8CreationBytecode);
        console.log("LiteRef8 codehash: ", Strings.toHexString(uint256(literef8BytecodeHash)));

        address predictedLiteRef8Address = vm.computeCreate2Address(
            salt,
            literef8BytecodeHash,
            CREATE2_DEPLOYER
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
            CREATE2_DEPLOYER
        );
        console.log("Predicted FragmentSingle address: ", predictedFragmentSingleAddress);

        deployments.FragmentSingle = DeploymentInfo({
            deployedAddress: predictedFragmentSingleAddress,
            bytecodeHash: fragmentsingleBytecodeHash
        });

        return deployments;
    }

    function performDeployment(DeploymentAddresses memory deployments) private {
        vm.startBroadcast();

        setupPatchworkProtocol();

        LiteRef8 literef8 = new LiteRef8{salt: salt}(ppAddress, ownerAddress);
        assert(address(literef8) == deployments.LiteRef8.deployedAddress);
        console.log("LiteRef8 deployed at: ", address(literef8));
        deployments.LiteRef8.deployedAddress = address(literef8);

        FragmentSingle fragmentsingle = new FragmentSingle{salt: salt}(ppAddress, ownerAddress);
        assert(address(fragmentsingle) == deployments.FragmentSingle.deployedAddress);
        console.log("FragmentSingle deployed at: ", address(fragmentsingle));
        deployments.FragmentSingle.deployedAddress = address(fragmentsingle);

        literef8.registerReferenceAddress(address(fragmentsingle));
        PatchworkProtocol pp = PatchworkProtocol(ppAddress);
        pp.addWhitelist("test", address(literef8));
        pp.addWhitelist("test", address(fragmentsingle));

        vm.stopBroadcast();
    }

    function setupPatchworkProtocol() private {
        PatchworkProtocol pp = PatchworkProtocol(ppAddress);
        if (pp.getScopeOwner("test") == address(0)) {
            pp.claimScope("test");
            pp.setScopeRules("test", false, false, true);
        }
    }

}
