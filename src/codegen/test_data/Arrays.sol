// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkUtils.sol";

contract Arrays is Patchwork721 {

    struct Metadata {
        uint128 fieldu128a;
        uint128 fieldu128b;
        string c8;
        uint32 fieldu32;
        string[4] names;
        uint16[32] u16array;
    }

    constructor(address _manager, address _owner)
        Patchwork721("test", "Arrays", "ARRAYS", _manager, _owner)
    {}

    function schemaURI() pure external override returns (string memory) {
        return "https://mything/my-metadata.json";
    }

    function imageURI(uint256 tokenId) pure external override returns (string memory) {
        return string.concat("https://mything/my/", Strings.toString(tokenId), ".png");
    }

    function _baseURI() internal pure virtual override returns (string memory) {
        return "https://mything/my/";
    }

    function storeMetadata(uint256 tokenId, Metadata memory data) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId] = packMetadata(data);
    }

    function loadMetadata(uint256 tokenId) public view returns (Metadata memory data) {
        return unpackMetadata(_metadataStorage[tokenId]);
    }

    function schema() pure external override returns (MetadataSchema memory) {
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](6);
        entries[0] = MetadataSchemaEntry(3, 1, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 0, 0, "fieldu128a");
        entries[1] = MetadataSchemaEntry(4, 2, FieldType.UINT128, 1, FieldVisibility.PUBLIC, 0, 128, "fieldu128b");
        entries[2] = MetadataSchemaEntry(6, 0, FieldType.CHAR8, 1, FieldVisibility.PUBLIC, 1, 0, "c8");
        entries[3] = MetadataSchemaEntry(5, 3, FieldType.UINT32, 1, FieldVisibility.PUBLIC, 1, 64, "fieldu32");
        entries[4] = MetadataSchemaEntry(1, 0, FieldType.CHAR8, 4, FieldVisibility.PUBLIC, 2, 0, "names");
        entries[5] = MetadataSchemaEntry(2, 0, FieldType.UINT16, 32, FieldVisibility.PUBLIC, 3, 0, "u16array");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](5);
        slots[0] = uint256(data.fieldu128a) | uint256(data.fieldu128b) << 128;
        slots[1] = PatchworkUtils.strToUint256(data.c8) >> 192 | uint256(data.fieldu32) << 64;
        slots[2] = PatchworkUtils.strToUint256(data.names[0]) >> 192 | PatchworkUtils.strToUint256(data.names[1]) >> 192 << 64 | PatchworkUtils.strToUint256(data.names[2]) >> 192 << 128 | PatchworkUtils.strToUint256(data.names[3]) >> 192 << 192;
        uint256 slot3 = uint256(data.u16array[0]) | uint256(data.u16array[1]) << 16 | uint256(data.u16array[2]) << 32 | uint256(data.u16array[3]) << 48 | uint256(data.u16array[4]) << 64 | uint256(data.u16array[5]) << 80 | uint256(data.u16array[6]) << 96 | uint256(data.u16array[7]) << 112;
        slots[3] = slot3 | uint256(data.u16array[8]) << 128 | uint256(data.u16array[9]) << 144 | uint256(data.u16array[10]) << 160 | uint256(data.u16array[11]) << 176 | uint256(data.u16array[12]) << 192 | uint256(data.u16array[13]) << 208 | uint256(data.u16array[14]) << 224 | uint256(data.u16array[15]) << 240;
        uint256 slot4 = uint256(data.u16array[16]) | uint256(data.u16array[17]) << 16 | uint256(data.u16array[18]) << 32 | uint256(data.u16array[19]) << 48 | uint256(data.u16array[20]) << 64 | uint256(data.u16array[21]) << 80 | uint256(data.u16array[22]) << 96 | uint256(data.u16array[23]) << 112;
        slots[4] = slot4 | uint256(data.u16array[24]) << 128 | uint256(data.u16array[25]) << 144 | uint256(data.u16array[26]) << 160 | uint256(data.u16array[27]) << 176 | uint256(data.u16array[28]) << 192 | uint256(data.u16array[29]) << 208 | uint256(data.u16array[30]) << 224 | uint256(data.u16array[31]) << 240;
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.fieldu128a = uint128(slot);
        data.fieldu128b = uint128(slot >> 128);
        slot = slots[1];
        data.c8 = PatchworkUtils.toString8(uint64(slot));
        data.fieldu32 = uint32(slot >> 64);
        slot = slots[2];
        data.names[0] = PatchworkUtils.toString8(uint64(slot));
        data.names[1] = PatchworkUtils.toString8(uint64(slot >> 64));
        data.names[2] = PatchworkUtils.toString8(uint64(slot >> 128));
        data.names[3] = PatchworkUtils.toString8(uint64(slot >> 192));
        slot = slots[3];
        data.u16array[0] = uint16(slot);
        data.u16array[1] = uint16(slot >> 16);
        data.u16array[2] = uint16(slot >> 32);
        data.u16array[3] = uint16(slot >> 48);
        data.u16array[4] = uint16(slot >> 64);
        data.u16array[5] = uint16(slot >> 80);
        data.u16array[6] = uint16(slot >> 96);
        data.u16array[7] = uint16(slot >> 112);
        data.u16array[8] = uint16(slot >> 128);
        data.u16array[9] = uint16(slot >> 144);
        data.u16array[10] = uint16(slot >> 160);
        data.u16array[11] = uint16(slot >> 176);
        data.u16array[12] = uint16(slot >> 192);
        data.u16array[13] = uint16(slot >> 208);
        data.u16array[14] = uint16(slot >> 224);
        data.u16array[15] = uint16(slot >> 240);
        slot = slots[4];
        data.u16array[16] = uint16(slot);
        data.u16array[17] = uint16(slot >> 16);
        data.u16array[18] = uint16(slot >> 32);
        data.u16array[19] = uint16(slot >> 48);
        data.u16array[20] = uint16(slot >> 64);
        data.u16array[21] = uint16(slot >> 80);
        data.u16array[22] = uint16(slot >> 96);
        data.u16array[23] = uint16(slot >> 112);
        data.u16array[24] = uint16(slot >> 128);
        data.u16array[25] = uint16(slot >> 144);
        data.u16array[26] = uint16(slot >> 160);
        data.u16array[27] = uint16(slot >> 176);
        data.u16array[28] = uint16(slot >> 192);
        data.u16array[29] = uint16(slot >> 208);
        data.u16array[30] = uint16(slot >> 224);
        data.u16array[31] = uint16(slot >> 240);
        return data;
    }

    // Load Only fieldu128a
    function loadFieldu128a(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return uint128(value);
    }

    // Store Only fieldu128a
    function storeFieldu128a(uint256 tokenId, uint128 fieldu128a) public {
        if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x1 > 0)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask);
        _metadataStorage[tokenId][0] = cleared | (uint256(fieldu128a) & mask);
    }

    // Load Only fieldu128b
    function loadFieldu128b(uint256 tokenId) public view returns (uint128) {
        uint256 value = uint256(_metadataStorage[tokenId][0]) >> 128;
        return uint128(value);
    }

    // Store Only fieldu128b
    function storeFieldu128b(uint256 tokenId, uint128 fieldu128b) public {
        if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x2 > 0)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 128) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][0]) & ~(mask << 128);
        _metadataStorage[tokenId][0] = cleared | (uint256(fieldu128b) & mask) << 128;
    }

    // Load Only c8
    function loadC8(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][1]);
        return PatchworkUtils.toString8(uint64(value));
    }

    // Store Only c8
    function storeC8(uint256 tokenId, string memory c8) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 64) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask);
        _metadataStorage[tokenId][1] = cleared | (PatchworkUtils.strToUint256(c8) >> 192 & mask);
    }

    // Load Only fieldu32
    function loadFieldu32(uint256 tokenId) public view returns (uint32) {
        uint256 value = uint256(_metadataStorage[tokenId][1]) >> 64;
        return uint32(value);
    }

    // Store Only fieldu32
    function storeFieldu32(uint256 tokenId, uint32 fieldu32) public {
        if (!(_checkTokenWriteAuth(tokenId) || _permissionsAllow[msg.sender] & 0x4 > 0)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        uint256 mask = (1 << 32) - 1;
        uint256 cleared = uint256(_metadataStorage[tokenId][1]) & ~(mask << 64);
        _metadataStorage[tokenId][1] = cleared | (uint256(fieldu32) & mask) << 64;
    }

    // Load Array for names
    function loadNames(uint256 tokenId) public view returns (string[] memory) {
        string[] memory result = new string[](4);
        uint256 slot = _metadataStorage[tokenId][2];
        result[0] = PatchworkUtils.toString8(uint64(slot));
        result[1] = PatchworkUtils.toString8(uint64(slot >> 64));
        result[2] = PatchworkUtils.toString8(uint64(slot >> 128));
        result[3] = PatchworkUtils.toString8(uint64(slot >> 192));
        return result;
    }

    // Store Array for names
    function storeNames(uint256 tokenId, string[] memory names) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (names.length != 4) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | PatchworkUtils.strToUint256(names[0]) >> 192 << 0;
        slot = slot | PatchworkUtils.strToUint256(names[1]) >> 192 << 64;
        slot = slot | PatchworkUtils.strToUint256(names[2]) >> 192 << 128;
        slot = slot | PatchworkUtils.strToUint256(names[3]) >> 192 << 192;
        _metadataStorage[tokenId][2] = slot;
    }

    // Load Array for u16array
    function loadU16array(uint256 tokenId) public view returns (uint16[] memory) {
        uint16[] memory result = new uint16[](32);
        uint256 slot = _metadataStorage[tokenId][3];
        result[0] = uint16(slot);
        result[1] = uint16(slot >> 16);
        result[2] = uint16(slot >> 32);
        result[3] = uint16(slot >> 48);
        result[4] = uint16(slot >> 64);
        result[5] = uint16(slot >> 80);
        result[6] = uint16(slot >> 96);
        result[7] = uint16(slot >> 112);
        result[8] = uint16(slot >> 128);
        result[9] = uint16(slot >> 144);
        result[10] = uint16(slot >> 160);
        result[11] = uint16(slot >> 176);
        result[12] = uint16(slot >> 192);
        result[13] = uint16(slot >> 208);
        result[14] = uint16(slot >> 224);
        result[15] = uint16(slot >> 240);
        slot = _metadataStorage[tokenId][4];
        result[16] = uint16(slot);
        result[17] = uint16(slot >> 16);
        result[18] = uint16(slot >> 32);
        result[19] = uint16(slot >> 48);
        result[20] = uint16(slot >> 64);
        result[21] = uint16(slot >> 80);
        result[22] = uint16(slot >> 96);
        result[23] = uint16(slot >> 112);
        result[24] = uint16(slot >> 128);
        result[25] = uint16(slot >> 144);
        result[26] = uint16(slot >> 160);
        result[27] = uint16(slot >> 176);
        result[28] = uint16(slot >> 192);
        result[29] = uint16(slot >> 208);
        result[30] = uint16(slot >> 224);
        result[31] = uint16(slot >> 240);
        return result;
    }

    // Store Array for u16array
    function storeU16array(uint256 tokenId, uint16[] memory u16array) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        if (u16array.length != 32) {
            revert IPatchworkProtocol.BadInputLengths();
        }
        uint256 slot = 0;
        slot = slot | uint256(u16array[0]) << 0;
        slot = slot | uint256(u16array[1]) << 16;
        slot = slot | uint256(u16array[2]) << 32;
        slot = slot | uint256(u16array[3]) << 48;
        slot = slot | uint256(u16array[4]) << 64;
        slot = slot | uint256(u16array[5]) << 80;
        slot = slot | uint256(u16array[6]) << 96;
        slot = slot | uint256(u16array[7]) << 112;
        slot = slot | uint256(u16array[8]) << 128;
        slot = slot | uint256(u16array[9]) << 144;
        slot = slot | uint256(u16array[10]) << 160;
        slot = slot | uint256(u16array[11]) << 176;
        slot = slot | uint256(u16array[12]) << 192;
        slot = slot | uint256(u16array[13]) << 208;
        slot = slot | uint256(u16array[14]) << 224;
        slot = slot | uint256(u16array[15]) << 240;
        _metadataStorage[tokenId][3] = slot;
        slot = 0;
        slot = slot | uint256(u16array[16]) << 0;
        slot = slot | uint256(u16array[17]) << 16;
        slot = slot | uint256(u16array[18]) << 32;
        slot = slot | uint256(u16array[19]) << 48;
        slot = slot | uint256(u16array[20]) << 64;
        slot = slot | uint256(u16array[21]) << 80;
        slot = slot | uint256(u16array[22]) << 96;
        slot = slot | uint256(u16array[23]) << 112;
        slot = slot | uint256(u16array[24]) << 128;
        slot = slot | uint256(u16array[25]) << 144;
        slot = slot | uint256(u16array[26]) << 160;
        slot = slot | uint256(u16array[27]) << 176;
        slot = slot | uint256(u16array[28]) << 192;
        slot = slot | uint256(u16array[29]) << 208;
        slot = slot | uint256(u16array[30]) << 224;
        slot = slot | uint256(u16array[31]) << 240;
        _metadataStorage[tokenId][4] = slot;
    }
}