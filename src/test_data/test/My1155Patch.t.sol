// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "./TestBase1155.sol";
import "../My1155Patch.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract My1155PatchTest is Test {
    PatchworkProtocol _prot;
    TestBase1155 _base1155;
    My1155Patch _myContract;

    string _scopeName;
    address _scopeOwner;
    address _patchworkOwner; 
    address _userAddress;

    function setUp() public {
        _patchworkOwner = address(1001);
        _userAddress = address(1);
        _scopeOwner = address(2);
        _scopeName = "test";

        vm.prank(_patchworkOwner);
        _prot = new PatchworkProtocol(_patchworkOwner, address(new PatchworkProtocolAssigner(_patchworkOwner)));
        vm.startPrank(_scopeOwner);
        _prot.claimScope(_scopeName);
        _prot.setScopeRules(_scopeName, true, false, true);

        _base1155 = new TestBase1155();
        _myContract = new My1155Patch(address(_prot), _scopeOwner);
        _prot.addWhitelist(_scopeName, address(_myContract));
        vm.stopPrank();
    }

    function testSupportsInterface() public {
        assertTrue(_myContract.supportsInterface(type(IERC165).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC4906).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC5192).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchwork721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchwork1155Patch).interfaceId));
    }
    
    function testScopeName() public {
        assertEq(_scopeName, _myContract.getScopeName());
    }

    function testSchemaURI() public {
        assertEq("https://mything/my-metadata.json", _myContract.schemaURI());
    }

    function testImageURI() public {
        assertEq("https://mything/my/15.png", _myContract.imageURI(15));
    }

    function testSchema() public {
        IPatchworkMetadata.MetadataSchema memory schema = _myContract.schema();
        assertEq(1, schema.entries.length);
        assertEq(schema.entries[0].id, 1);
        assertEq(schema.entries[0].permissionId, 0);
        assertEq(uint(schema.entries[0].fieldType), uint(IPatchworkMetadata.FieldType.CHAR32));
        assertEq(schema.entries[0].fieldCount, 1);
        assertEq(uint(schema.entries[0].visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(schema.entries[0].slot, 0);
        assertEq(schema.entries[0].offset, 0);
        assertEq(schema.entries[0].key, "name");
    }

    function testPackUnpackMetadata() public {
        My1155Patch.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.name = "testname"; // An arbitrary test value for the counter

        uint256[] memory packed = _myContract.packMetadata(originalData);
        My1155Patch.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.name, originalData.name, "Names do not match");
    }

    function testName() public {
        vm.startPrank(_scopeOwner);
        uint256 baseTokenId = _base1155.mint(_userAddress, 0, 1);
        uint256 tokenId = _myContract.mintPatch(_userAddress, IPatchwork1155Patch.PatchTarget(address(_base1155), baseTokenId, _userAddress));
        _myContract.storeName(tokenId, "somename");
        assertEq("somename", _myContract.loadName(tokenId));
    }
}

