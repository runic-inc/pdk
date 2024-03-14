// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../Mintable.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MintableTest is Test {
    PatchworkProtocol _prot;
    Mintable _myContract;

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

        _myContract = new Mintable(address(_prot), _scopeOwner);
        _prot.addWhitelist(_scopeName, address(_myContract));
        _prot.setMintConfiguration(address(_myContract), IPatchworkProtocol.MintConfig(0, true));
        vm.stopPrank();
    }

    function testSupportsInterface() public {
        assertTrue(_myContract.supportsInterface(type(IERC165).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC4906).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC5192).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchwork721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchworkMintable).interfaceId));
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
        IPatchworkMetadata.MetadataSchemaEntry memory entry = schema.entries[0];
        assertEq(entry.id, 1);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.CHAR16));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "name");
    }

    function testPackUnpackMetadata() public {
        Mintable.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.name = "testname"; 

        uint256[] memory packed = _myContract.packMetadata(originalData);
        Mintable.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.name, originalData.name, "Names do not match");
    }

    function testName() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress, "");
        _myContract.storeName(tokenId, "somename");
        assertEq("somename", _myContract.loadName(tokenId));
    }
}

