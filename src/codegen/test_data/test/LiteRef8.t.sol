// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../LiteRef8.sol";
import "@patchwork/PatchworkProtocol.sol";
import "@patchwork/PatchworkProtocolAssigner.sol";

contract MyLiteRef8 is LiteRef8 {
    uint256 _nextTokenId;

    constructor(address _manager, address _owner) LiteRef8(_manager, _owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](3);
    }
}

contract LiteRef8Test is Test {
    PatchworkProtocol _prot;
    MyLiteRef8 _myContract;

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
        _prot.setScopeRules(_scopeName, false, false, true);

        _myContract = new MyLiteRef8(address(_prot), _scopeOwner);
        vm.stopPrank();
    }

    function testSupportsInterface() public {
        assertTrue(_myContract.supportsInterface(type(IERC165).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC4906).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IERC5192).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchwork721).interfaceId));
        assertTrue(_myContract.supportsInterface(type(IPatchworkLiteRef).interfaceId));
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
        assertEq(2, schema.entries.length);
        IPatchworkMetadata.MetadataSchemaEntry memory entry = schema.entries[0];
        assertEq(entry.id, 2);
        assertEq(entry.permissionId, 1);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.UINT32));
        assertEq(entry.fieldCount, 1);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 0);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "counter");
        entry = schema.entries[1];
        assertEq(entry.id, 1);
        assertEq(entry.permissionId, 0);
        assertEq(uint(entry.fieldType), uint(IPatchworkMetadata.FieldType.LITEREF));
        assertEq(entry.fieldCount, 8);
        assertEq(uint(entry.visibility), uint(IPatchworkMetadata.FieldVisibility.PUBLIC));
        assertEq(entry.slot, 1);
        assertEq(entry.offset, 0);
        assertEq(entry.key, "attributeIDs");
    }

    function testPackUnpackMetadata() public {
        MyLiteRef8.Metadata memory originalData;
        // Fill in the originalData with test values
        for(uint64 i = 0; i < 8; i++) {
            originalData.attributeIDs[i] = i + 1; // Assuming test values 1 through 8 for attributeIDs
        }
        originalData.counter = 42; // An arbitrary test value for the counter

        uint256[] memory packed = _myContract.packMetadata(originalData);
        MyLiteRef8.Metadata memory unpackedData = _myContract.unpackMetadata(packed);

        // Assertions to verify that original and unpacked data match
        assertEq(unpackedData.counter, originalData.counter, "Counters do not match");
        for(uint256 i = 0; i < originalData.attributeIDs.length; i++) {
            assertEq(unpackedData.attributeIDs[i], originalData.attributeIDs[i], "AttributeIDs do not match");
        }
    }

    // Field tests
    function testAttributeIDs() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        uint64[] memory attributeIDs = new uint64[](8);
        for (uint64 i = 0; i < 8; i++) {
            attributeIDs[i] = i + 1;
        }
        _myContract.storeAttributeIDs(tokenId, attributeIDs);
        uint64[] memory attIDs = _myContract.loadAttributeIDs(tokenId);
        for (uint64 i = 0; i < 8; i++) {
            assertEq(attIDs[i], attributeIDs[i]);
        }
    }

    function testCounter() public {
        vm.startPrank(_scopeOwner);
        uint256 tokenId = _myContract.mint(_userAddress);
        _myContract.storeCounter(tokenId, 5);
        assertEq(5, _myContract.loadCounter(tokenId));
    }

    // TODO test references (need a mock fragment to use)
}

