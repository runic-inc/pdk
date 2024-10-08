// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../TwoInts.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyTwoInts is TwoInts {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) TwoInts(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
    }
}

contract TwoIntsTest is Test {
    PatchworkProtocol _prot;
    MyTwoInts _myContract;

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

        _myContract = new MyTwoInts(address(_prot), _scopeOwner);
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
        assertEq(2, schema.entries.length);
        
        IPatchworkMetadata.MetadataSchemaEntry memory entry1 = schema.entries[0];
        assertEq(entry1.id, 2);
        assertEq(entry1.permissionId, 0);
        assertEq(uint(entry1.fieldType), uint(IPatchworkMetadata.FieldType.INT16));
        assertEq(entry1.fieldCount, 1);
        assertEq(uint(entry1.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry1.slot, 0);
        assertEq(entry1.offset, 0);
        assertEq(entry1.key, "i16");

        IPatchworkMetadata.MetadataSchemaEntry memory entry2 = schema.entries[1];
        assertEq(entry2.id, 1);
        assertEq(entry2.permissionId, 0);
        assertEq(uint(entry2.fieldType), uint(IPatchworkMetadata.FieldType.INT8));
        assertEq(entry2.fieldCount, 1);
        assertEq(uint(entry2.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry2.slot, 0);
        assertEq(entry2.offset, 16);
        assertEq(entry2.key, "i8");
    }

    function testPackUnpackMetadata() public {
        TwoIntsGenerated.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.i16 = 1000;
        originalData.i8 = 42;

        uint256[] memory packed = _myContract.packMetadata(originalData);
        TwoIntsGenerated.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.i16, originalData.i16, "i16 values do not match");
        assertEq(unpackedData.i8, originalData.i8, "i8 values do not match");
    }

    function testStoreLoadMetadata() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        TwoIntsGenerated.Metadata memory data;
        data.i16 = 1000;
        data.i8 = 42;
        
        _myContract.storeMetadata(tokenId, data);
        TwoIntsGenerated.Metadata memory loadedData = _myContract.loadMetadata(tokenId);
        
        assertEq(loadedData.i16, data.i16, "Stored and loaded i16 values do not match");
        assertEq(loadedData.i8, data.i8, "Stored and loaded i8 values do not match");
    }

    function testStoreLoadI16() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int16 testValue = 1000;
        _myContract.storeI16(tokenId, testValue);
        int16 loadedValue = _myContract.loadI16(tokenId);
        
        assertEq(loadedValue, testValue, "Stored and loaded i16 values do not match");
    }

    function testStoreLoadI8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8 testValue = 42;
        _myContract.storeI8(tokenId, testValue);
        int8 loadedValue = _myContract.loadI8(tokenId);
        
        assertEq(loadedValue, testValue, "Stored and loaded i8 values do not match");
    }

    function testNegativeValues() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int16 testValueI16 = -1000;
        int8 testValueI8 = -42;
        
        _myContract.storeI16(tokenId, testValueI16);
        _myContract.storeI8(tokenId, testValueI8);
        
        assertEq(_myContract.loadI16(tokenId), testValueI16, "Stored and loaded negative i16 values do not match");
        assertEq(_myContract.loadI8(tokenId), testValueI8, "Stored and loaded negative i8 values do not match");
    }

    function testBounds() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        // Test int16 bounds
        _myContract.storeI16(tokenId, 32767);  // Max value for int16
        assertEq(_myContract.loadI16(tokenId), 32767, "Max int16 value not stored correctly");
        
        _myContract.storeI16(tokenId, -32768);  // Min value for int16
        assertEq(_myContract.loadI16(tokenId), -32768, "Min int16 value not stored correctly");

        // Test int8 bounds
        _myContract.storeI8(tokenId, 127);  // Max value for int8
        assertEq(_myContract.loadI8(tokenId), 127, "Max int8 value not stored correctly");
        
        _myContract.storeI8(tokenId, -128);  // Min value for int8
        assertEq(_myContract.loadI8(tokenId), -128, "Min int8 value not stored correctly");
    }

    function testIndependentStorage() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        _myContract.storeI16(tokenId, 1000);
        _myContract.storeI8(tokenId, 42);
        
        assertEq(_myContract.loadI16(tokenId), 1000, "i16 value changed unexpectedly");
        assertEq(_myContract.loadI8(tokenId), 42, "i8 value changed unexpectedly");
        
        _myContract.storeI16(tokenId, 2000);
        assertEq(_myContract.loadI16(tokenId), 2000, "i16 value not updated correctly");
        assertEq(_myContract.loadI8(tokenId), 42, "i8 value changed unexpectedly when updating i16");
        
        _myContract.storeI8(tokenId, 84);
        assertEq(_myContract.loadI16(tokenId), 2000, "i16 value changed unexpectedly when updating i8");
        assertEq(_myContract.loadI8(tokenId), 84, "i8 value not updated correctly");
    }
}