import { ContractConfig, Feature } from '@/types';
import { FeatureConfig } from '../types';

export default [
    {
        name: 'Mintable',
        description: `Adds protocol-level mint support and enables mint fee accrual to the contract's Scope.`,
        icon: 'fa-plus',
        interfaces: [
            {
                interface: Feature.MINTABLE,
                label: '',
                default: true,
            },
        ],
        options: [],
    },
    {
        name: 'Assignable',
        description: 'Assignable contracts contain tokens that can be assigned to an Assignee token.',
        icon: 'fa-grid-2',
        interfaces: [
            {
                interface: Feature.FRAGMENTSINGLE,
                label: 'Single-assignable',
                default: true,
                description: `Single-assignable tokens can only be assigned to one Assignee token at a time, and have the ability to have its ownership proxied through its parent.`,
            },
            {
                interface: Feature.FRAGMENTMULTI,
                label: 'Multi-assignable',
                description: `Multi-assignable tokens can be assigned to multiple Assignees, but cannot have ownership proxied.`,
            },
        ],
        options: [],
    },
    {
        name: 'Assignee',
        description: `Assignee tokens can hold and own Assignable tokens.`,
        icon: 'fa-square-dashed',
        autoToggle: true,
        validator: ({ fields }: ContractConfig) => {
            return fields.filter((field) => field.fieldType === 'literef').length >= 1 ? true : false;
        },
        validatorMessage: 'This feature is automatically enabled when a LiteRef field is added.',
        interfaces: [
            {
                interface: Feature.LITEREF,
                label: 'Strong assignments',
                default: true,
                description: `Single-assignable tokens can only be assigned to one Assignee token at a time, and have the ability to have its ownership proxied through its parent.`,
            },
            {
                interface: Feature.DYNAMICREFLIBRARY,
                label: 'Use dynamic reference library',
                optional: true,
                description: `Saves significant code space in your contract at the expense of CALLs to an external library.`,
                validator: ({ fields }: ContractConfig) => {
                    return fields.filter((field) => field.fieldType === 'literef' && field.arrayLength === 0).length >= 1 ? true : false;
                },
                validatorMessage: 'Requires a LiteRef field with a cardinality of 0.',
            },
            {
                interface: Feature.WEAKREF,
                label: 'Weak assignments',
                optional: true,
                description: `Does not attempt to cascade ownership changes to its assigned tokens.`,
            },
        ],
        options: [],
    },
    {
        name: 'Patch',
        description: 'Patch contracts contain tokens that get soulbound to a target onchain entity.',
        icon: 'fa-frame',
        interfaces: [
            {
                interface: Feature.PATCH,
                label: 'ERC721 Patch',
                default: true,
                description: "Contract's tokens are soulbound to a target token",
            },
            {
                interface: Feature.ACCOUNTPATCH,
                label: 'Account Patch',
                description: "Contract's tokens are soulbound to a target address",
            },
            {
                interface: Feature['1155PATCH'],
                label: 'ERC1155 Patch',
                description: "Contract's tokens are soulbound to a tokenset within a parent 1155",
            },
            {
                interface: Feature.REVERSIBLE,
                label: 'Reversible',
                description: 'Allows reverse lookups',
                optional: true,
            },
        ],
        options: [],
    },
] satisfies FeatureConfig[];
