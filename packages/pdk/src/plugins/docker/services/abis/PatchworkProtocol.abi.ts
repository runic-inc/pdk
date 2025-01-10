export const PatchworkProtocol = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "owner_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "assignerDelegate_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "CONTRACT_UPGRADE_TIMELOCK",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FEE_CHANGE_TIMELOCK",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "acceptScopeTransfer",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addBanker",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addOperator",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "op",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addProtocolBanker",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addWhitelist",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "applyTransfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "assign",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "assign",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetMetadataId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "assignBatch",
    "inputs": [
      {
        "name": "fragments",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "tokenIds",
        "type": "uint256[]",
        "internalType": "uint256[]"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "assignBatch",
    "inputs": [
      {
        "name": "fragments",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "tokenIds",
        "type": "uint256[]",
        "internalType": "uint256[]"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetMetadataId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOfProtocol",
    "inputs": [],
    "outputs": [
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelScopeTransfer",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimScope",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "commitAssignerDelegate",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "commitProtocolFeeConfig",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "commitScopeFeeOverride",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAssignFee",
    "inputs": [
      {
        "name": "fragmentAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "baseFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMintConfiguration",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.MintConfig",
        "components": [
          {
            "name": "flatFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPatchFee",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "baseFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProtocolFeeConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.FeeConfig",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getScopeFeeOverride",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.FeeConfigOverride",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getScopeOwner",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getScopeOwnerElect",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "ownerElect",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "mintable",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "mintBatch",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "mintable",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "quantity",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "tokenIds",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "patch",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "patch1155",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "originalAccount",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "patchAccount",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "patchBurned",
    "inputs": [
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "patchBurned1155",
    "inputs": [
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "originalAccount",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "patchBurnedAccount",
    "inputs": [
      {
        "name": "originalAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeAssignerDelegate",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeProtocolFeeConfig",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.FeeConfig",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeScopeFeeOverride",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.FeeConfigOverride",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeBanker",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeOperator",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "op",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeProtocolBanker",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeWhitelist",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setAssignFee",
    "inputs": [
      {
        "name": "fragmentAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "baseFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setMintConfiguration",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "config",
        "type": "tuple",
        "internalType": "struct IPatchworkProtocol.MintConfig",
        "components": [
          {
            "name": "flatFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setPatchFee",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "baseFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setScopeRules",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "allowUserPatch",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "allowUserAssign",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "requireWhitelist",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferScopeOwnership",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassign",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetMetadataId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassign",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassignMulti",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetMetadataId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassignMulti",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassignSingle",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetMetadataId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unassignSingle",
    "inputs": [
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateOwnershipTree",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawFromProtocol",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AccountPatch",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "patchTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Assign",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fragmentAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "targetAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AssignFeeChange",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AssignerDelegateCommit",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AssignerDelegatePropose",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ERC1155Patch",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "originalAccount",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "patchTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Mint",
    "inputs": [
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "mintable",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MintBatch",
    "inputs": [
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "mintable",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      },
      {
        "name": "quantity",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MintConfigure",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "mintable",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "config",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IPatchworkProtocol.MintConfig",
        "components": [
          {
            "name": "flatFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Patch",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "originalAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "originalTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "patchTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "scopeFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PatchFeeChange",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolBankerAdd",
    "inputs": [
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "banker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolBankerRemove",
    "inputs": [
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "banker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolFeeConfigCommit",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IPatchworkProtocol.FeeConfig",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolFeeConfigPropose",
    "inputs": [
      {
        "name": "config",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IPatchworkProtocol.FeeConfig",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolWithdraw",
    "inputs": [
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeAddOperator",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeBankerAdd",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "banker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeBankerRemove",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "banker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeClaim",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeFeeOverrideCommit",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "config",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IPatchworkProtocol.FeeConfigOverride",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeFeeOverridePropose",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "config",
        "type": "tuple",
        "indexed": false,
        "internalType": "struct IPatchworkProtocol.FeeConfigOverride",
        "components": [
          {
            "name": "mintBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "patchBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "assignBp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeRemoveOperator",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "operator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeRuleChange",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "allowUserPatch",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "allowUserAssign",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "requireWhitelist",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeTransfer",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeTransferCancel",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeTransferElect",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeWhitelistAdd",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeWhitelistRemove",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "addr",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ScopeWithdraw",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "actor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unassign",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fragmentAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "fragmentTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "targetAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AccountAlreadyPatched",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "AlreadyPatched",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "BadInputLengths",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotLockSoulboundPatch",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "DataIntegrityError",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "addr2",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId2",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC1155AlreadyPatched",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "patchAddress",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "FailedToSend",
    "inputs": []
  },
  {
    "type": "error",
    "name": "FragmentAlreadyAssigned",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "FragmentAlreadyRegistered",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "FragmentNotAssigned",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "FragmentNotAssignedToTarget",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "targetAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "targetTokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "FragmentRedacted",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "FragmentUnregistered",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "Frozen",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "IncorrectFeeAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "IncorrectNonce",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "InsufficientFunds",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidFeeValue",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Locked",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "MintNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MintNotAllowed",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "NoDelegateProposed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoProposedFeeSet",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotAuthorized",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotFrozen",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotPatchworkAssignable",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotWhitelisted",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OutOfIDs",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "RefNotFound",
    "inputs": [
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "fragment",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ScopeDoesNotExist",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ]
  },
  {
    "type": "error",
    "name": "ScopeExists",
    "inputs": [
      {
        "name": "scopeName",
        "type": "string",
        "internalType": "string"
      }
    ]
  },
  {
    "type": "error",
    "name": "ScopeTransferNotAllowed",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SelfAssignmentNotAllowed",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "TimelockNotElapsed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferBlockedByAssignment",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "TransferNotAllowed",
    "inputs": [
      {
        "name": "addr",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "UnsupportedContract",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnsupportedOperation",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnsupportedTokenId",
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  }
] as const;
