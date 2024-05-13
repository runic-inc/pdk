// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../Basic1.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyBasic1 is Basic1ComplexName {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) Basic1ComplexName(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](3);
    }
}

contract Basic1Test is Test {
    PatchworkProtocol _prot;
    MyBasic1 _myContract;

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

        _myContract = new MyBasic1(address(_prot), _scopeOwner);
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
        assertEq(7, schema.entries.length);
        IPatchworkMetadata.MetadataSchemaEntry memory entry = schema.entries[0];
        assertEq(entry.id, 7);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.ADDRESS));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "addr");
        entry = schema.entries[1];
        assertEq(entry.id, 6);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.CHAR8));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 160);
        assertEq(entry.key, "c8");
        entry = schema.entries[2];
        assertEq(entry.id, 5);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT32));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 224);
        assertEq(entry.key, "fieldu32");
        entry = schema.entries[3];
        assertEq(entry.id, 1);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.CHAR16));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "name");
        entry = schema.entries[4];
        assertEq(entry.id, 3);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT128));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 128);
        assertEq(entry.key, "fieldu128a");
        entry = schema.entries[5];
        assertEq(entry.id, 4);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT128));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 2);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "fieldu128b");
        entry = schema.entries[6];
        assertEq(entry.id, 2);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT16));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 2);
        assertEq(entry.offset, 128);
        assertEq(entry.key, "fieldu16");
    }

    function testPackUnpackMetadata() public {
        Basic1ComplexName.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.addr = address(0x707);
        originalData.name = "testname"; 
        originalData.c8 = "shorty";
        originalData.fieldu128a = 1293123;
        originalData.fieldu128b = 991911;
        originalData.fieldu16 = 9821;
        originalData.fieldu32 = 2181203918;

        uint256[] memory packed = _myContract.packMetadata(originalData);
        Basic1ComplexName.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.addr, originalData.addr, "Addrs do not match");
        assertEq(unpackedData.name, originalData.name, "Names do not match");
        assertEq(unpackedData.c8, originalData.c8, "c8s do not match");
        assertEq(unpackedData.fieldu128a, originalData.fieldu128a, "fieldu128as do not match");
        assertEq(unpackedData.fieldu128b, originalData.fieldu128b, "fieldu128bs do not match");
        assertEq(unpackedData.fieldu16, originalData.fieldu16, "fieldu16s do not match");
        assertEq(unpackedData.fieldu32, originalData.fieldu32, "fieldu32s do not match");
    }

    // TODO update adjacency tests - slots have changed since this was written
    
    // adjacency
    function testSlot0() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128a(tokenId, 9120938129083901283);
        _myContract.storeName(tokenId, "somename");
        _myContract.storeFieldu128a(tokenId, 9120938129083901283);
        _myContract.storeName(tokenId, "somename");
        assertEq("somename", _myContract.loadName(tokenId));
        assertEq(9120938129083901283, _myContract.loadFieldu128a(tokenId));
    }

    // adjacency
    function testSlot1() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128b(tokenId, 9120938129083901283);
        _myContract.storeC8(tokenId, "somec8");
        _myContract.storeFieldu32(tokenId, 912093);
        _myContract.storeFieldu16(tokenId, 993);
        _myContract.storeFieldu128b(tokenId, 9120938129083901283);
        _myContract.storeC8(tokenId, "somec8");
        _myContract.storeFieldu32(tokenId, 912093);
        _myContract.storeFieldu16(tokenId, 993);
        assertEq(9120938129083901283, _myContract.loadFieldu128b(tokenId));
        assertEq("somec8", _myContract.loadC8(tokenId));
        assertEq(912093, _myContract.loadFieldu32(tokenId));
        assertEq(993, _myContract.loadFieldu16(tokenId));
    }

    function testFieldAddr() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeAddr(tokenId, address(0x707));
        assertEq(address(0x707), _myContract.loadAddr(tokenId));
    }

    function testName() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeName(tokenId, "somename");
        assertEq("somename", _myContract.loadName(tokenId));
    }

    function testFieldU128a() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128a(tokenId, 9120938129083901283);
        assertEq(9120938129083901283, _myContract.loadFieldu128a(tokenId));
    }

    function testC8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeC8(tokenId, "somec8");
        assertEq("somec8", _myContract.loadC8(tokenId));
    }

    function testFieldU128b() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128b(tokenId, 9120938129083901283);
        assertEq(9120938129083901283, _myContract.loadFieldu128b(tokenId));
    }

    function testFieldU16() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu16(tokenId, 993);
        assertEq(993, _myContract.loadFieldu16(tokenId));
    }

    function testFieldU32() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu32(tokenId, 912093);
        assertEq(912093, _myContract.loadFieldu32(tokenId));
    }
}

