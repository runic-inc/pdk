// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../OneInt.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyOneInt is OneInt {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) OneInt(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](1);
    }
}

contract OneIntTest is Test {
    PatchworkProtocol _prot;
    MyOneInt _myContract;

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

        _myContract = new MyOneInt(address(_prot), _scopeOwner);
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
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "i8");
    }

    function testPackUnpackMetadata() public {
        OneIntGenerated.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.i8 = 42;

        uint256[] memory packed = _myContract.packMetadata(originalData);
        OneIntGenerated.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.i8, originalData.i8, "i8 values do not match");
    }

    function testStoreLoadMetadata() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        OneIntGenerated.Metadata memory data;
        data.i8 = 42;
        
        _myContract.storeMetadata(tokenId, data);
        OneIntGenerated.Metadata memory loadedData = _myContract.loadMetadata(tokenId);
        
        assertEq(loadedData.i8, data.i8, "Stored and loaded i8 values do not match");
    }

    function testStoreLoadI8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8 testValue = 42;
        _myContract.storeI8(tokenId, testValue);
        int8 loadedValue = _myContract.loadI8(tokenId);
        
        assertEq(loadedValue, testValue, "Stored and loaded i8 values do not match");
    }

    function testNegativeI8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        int8 testValue = -42;
        _myContract.storeI8(tokenId, testValue);
        int8 loadedValue = _myContract.loadI8(tokenId);
        
        assertEq(loadedValue, testValue, "Stored and loaded negative i8 values do not match");
    }

    function testI8Bounds() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        
        _myContract.storeI8(tokenId, 127);  // Max value for int8
        assertEq(_myContract.loadI8(tokenId), 127, "Max int8 value not stored correctly");
        
        _myContract.storeI8(tokenId, -128);  // Min value for int8
        assertEq(_myContract.loadI8(tokenId), -128, "Min int8 value not stored correctly");
    }
}