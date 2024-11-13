// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../Bytes.sol";

contract MyBytes is Bytes {
    uint256 _nextTokenId;

    constructor(address manager, address owner) Bytes(manager, owner) {}

    /// test mint that allows minting from anyone to anyone
    function mint(address to) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metadataStorage[tokenId] = new uint256[](3);
    }
}

contract BytesTest is Test {
    MyBytes _bytesContract;
    address _userAddress;
    address _manager;
    address _scopeOwner;

    function setUp() public {
        _userAddress = address(0x1);
        _manager = address(0x2);
        _scopeOwner = address(0x3);
        vm.startPrank(_scopeOwner);
        _bytesContract = new MyBytes(_manager, _scopeOwner);
        vm.stopPrank();
    }

    function testSchemaURI() public {
        assertEq(_bytesContract.schemaURI(), "https://basic.xyz/schema/basic.json");
    }

    function testImageURI() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);
        assertEq(_bytesContract.imageURI(tokenId), string.concat("https://mything/my/", Strings.toString(tokenId), ".png"));
    }

    function testBaseURI() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);
        assertEq(_bytesContract.tokenURI(tokenId), string.concat("https://mything/my/", Strings.toString(tokenId)));
    }

    function testStoreAndLoadMetadata() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);
        
        BytesGenerated.Metadata memory data = BytesGenerated.Metadata({
            b3: bytes32(uint256(1)),
            b2: bytes16(uint128(2)),
            b1: bytes8(uint64(3)),
            b4: [bytes8(uint64(4)), bytes8(uint64(5)), bytes8(uint64(6)), bytes8(uint64(7))]
        });

        vm.startPrank(_scopeOwner);
        _bytesContract.storeMetadata(tokenId, data);
        Bytes.Metadata memory loadedData = _bytesContract.loadMetadata(tokenId);

        assertEq(loadedData.b3, data.b3);
        assertEq(loadedData.b2, data.b2);
        assertEq(loadedData.b1, data.b1);
        assertEq(loadedData.b4[0], data.b4[0]);
        assertEq(loadedData.b4[1], data.b4[1]);
        assertEq(loadedData.b4[2], data.b4[2]);
        assertEq(loadedData.b4[3], data.b4[3]);
    }

    function testPackAndUnpackMetadata() public {
        BytesGenerated.Metadata memory data = BytesGenerated.Metadata({
            b3: bytes32(uint256(1)),
            b2: bytes16(uint128(2)),
            b1: bytes8(uint64(3)),
            b4: [bytes8(uint64(4)), bytes8(uint64(5)), bytes8(uint64(6)), bytes8(uint64(7))]
        });

        uint256[] memory packed = _bytesContract.packMetadata(data);
        Bytes.Metadata memory unpacked = _bytesContract.unpackMetadata(packed);

        assertEq(unpacked.b3, data.b3);
        assertEq(unpacked.b2, data.b2);
        assertEq(unpacked.b1, data.b1);
        assertEq(unpacked.b4[0], data.b4[0]);
        assertEq(unpacked.b4[1], data.b4[1]);
        assertEq(unpacked.b4[2], data.b4[2]);
        assertEq(unpacked.b4[3], data.b4[3]);
    }

    function testLoadAndStoreB3() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);

        bytes32 b3Value = bytes32(uint256(1));
        vm.startPrank(_scopeOwner);
        _bytesContract.storeB3(tokenId, b3Value);
        bytes32 loadedB3 = _bytesContract.loadB3(tokenId);

        assertEq(loadedB3, b3Value);
    }

    function testLoadAndStoreB2() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);

        bytes16 b2Value = bytes16(uint128(2));
        vm.startPrank(_scopeOwner);
        _bytesContract.storeB2(tokenId, b2Value);
        bytes16 loadedB2 = _bytesContract.loadB2(tokenId);

        assertEq(loadedB2, b2Value);
    }

    function testLoadAndStoreB1() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);
        
        bytes8 b1Value = bytes8(uint64(3));
        vm.startPrank(_scopeOwner);
        _bytesContract.storeB1(tokenId, b1Value);
        bytes8 loadedB1 = _bytesContract.loadB1(tokenId);

        assertEq(loadedB1, b1Value);
    }

    function testLoadAndStoreB4() public {
        uint256 tokenId = _bytesContract.mint(_userAddress);

        bytes8[] memory b4Value = new bytes8[](4);
        b4Value[0] = bytes8(uint64(4));
        b4Value[1] = bytes8(uint64(5));
        b4Value[2] = bytes8(uint64(6));
        b4Value[3] = bytes8(uint64(7));

        vm.startPrank(_scopeOwner);
        _bytesContract.storeB4(tokenId, b4Value);
        bytes8[] memory loadedB4 = _bytesContract.loadB4(tokenId);

        assertEq(loadedB4.length, b4Value.length);
        for (uint i = 0; i < b4Value.length; i++) {
            assertEq(loadedB4[i], b4Value[i]);
        }
    }

    function testSchema() public {
        Bytes.MetadataSchema memory schema = _bytesContract.schema();
        assertEq(schema.version, 1);
        assertEq(schema.entries.length, 4);

        assertEq(uint(schema.entries[0].fieldType), uint(IPatchworkMetadata.FieldType.BYTES32));
        assertEq(schema.entries[0].key, "b3");

        assertEq(uint(schema.entries[1].fieldType), uint(IPatchworkMetadata.FieldType.BYTES16));
        assertEq(schema.entries[1].key, "b2");

        assertEq(uint(schema.entries[2].fieldType), uint(IPatchworkMetadata.FieldType.BYTES8));
        assertEq(schema.entries[2].key, "b1");

        assertEq(uint(schema.entries[3].fieldType), uint(IPatchworkMetadata.FieldType.BYTES8));
        assertEq(schema.entries[3].fieldCount, 4);
        assertEq(schema.entries[3].key, "b4");
    }
}