// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../IntArray.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyIntArray is IntArray {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) IntArray(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
    }
}

contract IntArrayTest is Test {
    PatchworkProtocol _prot;
    MyIntArray _myContract;

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

        _myContract = new MyIntArray(address(_prot), _scopeOwner);
        _prot.addWhitelist(_scopeName, address(_myContract));
        vm.stopPrank();
    }

    function testSupportsInterface() public {
        assertTrue(_myContract.supportsInterface(type(IERC165).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC4906).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC5192).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchwork721).interfaceId));
    }
    
    function testScopeName() public {
        assertEq(_scopeName, _myContract.getScopeName());
    }

    function testSchemaURI() public {
        assertEq("https://basic.xyz/schema/basic.json", _myContract.schemaURI());
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
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.INT8));
        assertEq(entry.fieldCount, 8);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "i8");
    }

    function testPackUnpackMetadata() public {
        IntArrayGenerated.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.i8 = [int8(1), -2, 3, -4, 5, -6, 7, -8];

        uint256[] memory packed = _myContract.packMetadata(originalData);
        IntArrayGenerated.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        for (uint i = 0; i < 8; i++) {
            assertEq(unpackedData.i8[i], originalData.i8[i], string(abi.encodePacked("i8[", Strings.toString(i), "] values do not match")));
        }
    }

    function testStoreLoadMetadata() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        IntArrayGenerated.Metadata memory data;
        data.i8 = [int8(1), -2, 3, -4, 5, -6, 7, -8];
        
        _myContract.storeMetadata(tokenId, data);
        IntArrayGenerated.Metadata memory loadedData = _myContract.loadMetadata(tokenId);
        
        for (uint i = 0; i < 8; i++) {
            assertEq(loadedData.i8[i], data.i8[i], string(abi.encodePacked("Stored and loaded i8[", Strings.toString(i), "] values do not match")));
        }
    }

    function testStoreLoadI8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8[] memory testValues = new int8[](8);
        testValues[0] = 1;
        testValues[1] = -2;
        testValues[2] = 3;
        testValues[3] = -4;
        testValues[4] = 5;
        testValues[5] = -6;
        testValues[6] = 7;
        testValues[7] = -8;

        _myContract.storeI8(tokenId, testValues);
        int8[] memory loadedValues = _myContract.loadI8(tokenId);
        
        for (uint i = 0; i < 8; i++) {
            assertEq(loadedValues[i], testValues[i], string(abi.encodePacked("Stored and loaded i8[", Strings.toString(i), "] values do not match")));
        }
    }

    function testI8Bounds() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8[] memory testValues = new int8[](8);
        testValues[0] = 127;  // Max value for int8
        testValues[1] = -128; // Min value for int8
        testValues[2] = 0;
        testValues[3] = 64;
        testValues[4] = -64;
        testValues[5] = 100;
        testValues[6] = -100;
        testValues[7] = 1;

        _myContract.storeI8(tokenId, testValues);
        int8[] memory loadedValues = _myContract.loadI8(tokenId);
        
        for (uint i = 0; i < 8; i++) {
            assertEq(loadedValues[i], testValues[i], string(abi.encodePacked("i8[", Strings.toString(i), "] bound test failed")));
        }
    }

    function testInvalidArrayLength() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8[] memory invalidArray = new int8[](7); // Invalid length, should be 8

        vm.expectRevert(IPatchworkProtocol.BadInputLengths.selector);
        _myContract.storeI8(tokenId, invalidArray);
    }
}