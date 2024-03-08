// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../Arrays.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyArrays is Arrays {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) Arrays(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](5);
    }
}

contract ArraysTest is Test {
    PatchworkProtocol _prot;
    MyArrays _myContract;

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

        _myContract = new MyArrays(address(_prot), _scopeOwner);
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
        assertEq("https://mything/my-metadata.json", _myContract.schemaURI());
    }

    function testImageURI() public {
        assertEq("https://mything/my/15.png", _myContract.imageURI(15));
    }

    function testSchema() public {
        IPatchworkMetadata.MetadataSchema memory schema = _myContract.schema();
        assertEq(6, schema.entries.length);
        IPatchworkMetadata.MetadataSchemaEntry memory entry = schema.entries[0];
        assertEq(entry.id, 3);
        assertEq(entry.permissionId, 1);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT128));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "fieldu128a");
        entry = schema.entries[1];
        assertEq(entry.id, 4);
        assertEq(entry.permissionId, 2);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT128));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 128);
        assertEq(entry.key, "fieldu128b");
        entry = schema.entries[2];
        assertEq(entry.id, 6);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.CHAR8));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "c8");
        entry = schema.entries[3];
        assertEq(entry.id, 5);
        assertEq(entry.permissionId, 3);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT32));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 64);
        assertEq(entry.key, "fieldu32");
        entry = schema.entries[4];
        assertEq(entry.id, 1);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.CHAR8));
        assertEq(entry.fieldCount, 4);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 2);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "names");
        entry = schema.entries[5];
        assertEq(entry.id, 2);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT16));
        assertEq(entry.fieldCount, 32);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 3);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "u16array");
    }

    function testPackUnpackMetadata() public {
        Arrays.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.c8 = "shorty";
        originalData.fieldu128a = 1293123;
        originalData.fieldu128b = 991911;
        originalData.fieldu32 = 2181203918;
        for (uint i = 0; i < 32; i++) {
            originalData.u16array[i] = 9821 + uint16(i);
        }
        for (uint i = 0; i < 4; i++) {
            originalData.names[i] = string.concat("test", Strings.toString(i));
        }

        uint256[] memory packed = _myContract.packMetadata(originalData);
        Arrays.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.c8, originalData.c8, "c8s do not match");
        assertEq(unpackedData.fieldu128a, originalData.fieldu128a, "fieldu128as do not match");
        assertEq(unpackedData.fieldu128b, originalData.fieldu128b, "fieldu128bs do not match");
        assertEq(unpackedData.fieldu32, originalData.fieldu32, "fieldu32s do not match");
        for (uint i = 0; i < 4; i++) {
            assertEq(unpackedData.names[i], originalData.names[i]);
        }
        for (uint i = 0; i < 32; i++) {
            assertEq(unpackedData.u16array[i], originalData.u16array[i]);
        }
    }

    function testNames() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        string[] memory names = new string[](4);
        for (uint i = 0; i < 4; i++) {
            names[i] = string.concat("test", Strings.toString(i));
        }
        _myContract.storeNames(tokenId, names);
        string[] memory names2 = _myContract.loadNames(tokenId);
        for (uint i = 0; i < 4; i++) {
            assertEq(names[i], names2[i]);
        }
    }

    function testU16Array() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        uint16[] memory u16array = new uint16[](32);
        for (uint i = 0; i < 32; i++) {
            u16array[i] = 9821 + uint16(i);
        }
        _myContract.storeU16array(tokenId, u16array);
        uint16[] memory u16array2 = _myContract.loadU16array(tokenId);
        for (uint i = 0; i < 32; i++) {
            assertEq(u16array[i], u16array2[i]);
        }
    }

    function testC8() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeC8(tokenId, "somec8");
        assertEq("somec8", _myContract.loadC8(tokenId));
    }

    function testFieldU128a() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128a(tokenId, 9120938129083901283);
        assertEq(9120938129083901283, _myContract.loadFieldu128a(tokenId));
    }

    function testFieldU128b() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128b(tokenId, 9120938129083901283);
        assertEq(9120938129083901283, _myContract.loadFieldu128b(tokenId));
    }

    function testFieldU32() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu32(tokenId, 912093);
        assertEq(912093, _myContract.loadFieldu32(tokenId));
    }
}

