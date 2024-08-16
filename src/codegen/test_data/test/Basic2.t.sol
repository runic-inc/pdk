// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../Basic2.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyBasic2 is Basic2Slotoverflow {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) Basic2Slotoverflow(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](3);
    }
}

contract Basic2Test is Test {
    PatchworkProtocol _prot;
    MyBasic2 _myContract;

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

        _myContract = new MyBasic2(address(_prot), _scopeOwner);
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
        IPatchworkMetadata.MetadataSchemaEntry memory entry = schema.entries[0];
        assertEq(entry.id, 2);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.ADDRESS));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "addr");
        entry = schema.entries[1];
        assertEq(entry.id, 1);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT128));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "fieldu128a");
    }

    function testPackUnpackMetadata() public {
        Basic2Slotoverflow.Metadata memory originalData;
        // Fill in the originalData with test values
        originalData.addr = address(0x707);
        originalData.fieldu128a = 1293123;

        uint256[] memory packed = _myContract.packMetadata(originalData);
        Basic2Slotoverflow.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.addr, originalData.addr, "Addresses do not match");
        assertEq(unpackedData.fieldu128a, originalData.fieldu128a, "fieldu128as do not match");
    }

    function testFieldAddr() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeAddr(tokenId, address(0x707));
        assertEq(address(0x707), _myContract.loadAddr(tokenId));
    }

    function testFieldU128a() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeFieldu128a(tokenId, 9120938129083901283);
        assertEq(9120938129083901283, _myContract.loadFieldu128a(tokenId));
    }
}

