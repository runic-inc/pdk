// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@patchwork/Patchwork721.sol";
import "@patchwork/PatchworkLiteRef.sol";
import "@patchwork/PatchworkUtils.sol";
import "@patchwork/libraries/PatchworkDynamicRefs.sol";

contract DynRefLib is Patchwork721, PatchworkLiteRef {

    error AlreadyLoaded();
    error NotFound();
    error StorageIntegrityError();
    error UnsupportedMetadataId();

    struct Metadata {
        string name;
    }

    mapping(uint256 => PatchworkDynamicRefs.DynamicLiteRefs) internal _dynamicLiterefStorage; // tokenId => indexed slots

    constructor(address _manager, address _owner)
        Patchwork721("test", "DynRefLib", "DR", _manager, _owner)
        PatchworkLiteRef()
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

    function supportsInterface(bytes4 interfaceID) public view virtual override(Patchwork721, PatchworkLiteRef) returns (bool) {
        return Patchwork721.supportsInterface(interfaceID) ||
            PatchworkLiteRef.supportsInterface(interfaceID);
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
        MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](2);
        entries[0] = MetadataSchemaEntry(2, 0, FieldType.CHAR32, 1, FieldVisibility.PUBLIC, 0, 0, "name");
        entries[1] = MetadataSchemaEntry(1, 0, FieldType.LITEREF, 0, FieldVisibility.PUBLIC, 0, 0, "attributeIDs");
        return MetadataSchema(1, entries);
    }

    function packMetadata(Metadata memory data) public pure returns (uint256[] memory slots) {
        slots = new uint256[](1);
        slots[0] = PatchworkUtils.strToUint256(data.name);
        return slots;
    }

    function unpackMetadata(uint256[] memory slots) public pure returns (Metadata memory data) {
        uint256 slot = slots[0];
        data.name = PatchworkUtils.toString32(slot);
        return data;
    }

    // Load Only name
    function loadName(uint256 tokenId) public view returns (string memory) {
        uint256 value = uint256(_metadataStorage[tokenId][0]);
        return PatchworkUtils.toString32(value);
    }

    // Store Only name
    function storeName(uint256 tokenId, string memory name) public {
        if (!_checkTokenWriteAuth(tokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        _metadataStorage[tokenId][0] = PatchworkUtils.strToUint256(name);
    }

    function addReference(uint256 ourTokenId, uint64 liteRef) public override {
        if (!_checkTokenWriteAuth(ourTokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        PatchworkDynamicRefs.addReference(liteRef, _dynamicLiterefStorage[ourTokenId]);
    }

    function addReferenceBatch(uint256 ourTokenId, uint64[] calldata liteRefs) public override {
        if (!_checkTokenWriteAuth(ourTokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        PatchworkDynamicRefs.addReferenceBatch(liteRefs,  _dynamicLiterefStorage[ourTokenId]);
    }

    function removeReference(uint256 ourTokenId, uint64 liteRef) public override {
        if (!_checkTokenWriteAuth(ourTokenId)) {
            revert IPatchworkProtocol.NotAuthorized(msg.sender);
        }
        PatchworkDynamicRefs.removeReference(liteRef, _dynamicLiterefStorage[ourTokenId]);
    }

    function addReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        addReference(tokenId, liteRef);
    }


    function removeReference(uint256 tokenId, uint64 liteRef, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        removeReference(tokenId, liteRef);
    }

    function addReferenceBatch(uint256 tokenId, uint64[] calldata liteRefs, uint256 targetMetadataId) public override {
        if (targetMetadataId != 0) {
            revert UnsupportedMetadataId();
        }
        addReferenceBatch(tokenId, liteRefs);
    }

    function loadReferenceAddressAndTokenId(uint256 ourTokenId, uint256 idx) public view returns (address addr, uint256 tokenId) {
        uint64 ref = PatchworkDynamicRefs.loadRef(idx, _dynamicLiterefStorage[ourTokenId]);
        (addr, tokenId) = getReferenceAddressAndTokenId(ref);
    }

    function getDynamicReferenceCount(uint256 tokenId) public view override returns (uint256 count) {
        count = PatchworkDynamicRefs.getDynamicReferenceCount(_dynamicLiterefStorage[tokenId]);
    }

    function loadDynamicReferencePage(uint256 tokenId, uint256 offset, uint256 count) public view override returns (address[] memory addresses, uint256[] memory tokenIds) {
        uint64[] memory refs = PatchworkDynamicRefs.loadRefPage(offset, count, _dynamicLiterefStorage[tokenId]);
        addresses = new address[](refs.length);
        tokenIds = new uint256[](refs.length);
        for (uint256 i = 0; i < refs.length; i++) {
            (address attributeAddress, uint256 attributeTokenId) = getReferenceAddressAndTokenId(refs[i]);
            addresses[i] = attributeAddress;
            tokenIds[i] = attributeTokenId;
        }
    }

    function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {
        return Patchwork721._checkWriteAuth();
    }
}