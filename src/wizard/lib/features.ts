import { ContractConfig, Feature, FeatureConfig } from '../../types';

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
        description: 'Assignee tokens can hold and own Assignable tokens using LiteRef fields.',
        icon: 'fa-square-dashed',
        interfaces: [
            {
                interface: Feature.LITEREF,
                label: 'Strong assignments',
                default: true,
                description: `Single-assignable tokens can only be assigned to one Assignee token at a time, and have the ability to have its ownership proxied through its parent.`,
                validator: ({ fields }: ContractConfig) => {
                    if (fields.filter((field) => field.fieldType === 'literef').length >= 1) {
                        return true;
                    } else {
                        return false;
                    }
                },
            },
            {
                interface: Feature.DYNAMICREFLIBRARY,
                label: 'Dynamic reference lengths',
                optional: true,
                description: `Saves code space in your 721 contract at the expense of CALLs to an external library.`,
                validator: ({ fields }: ContractConfig) => {
                    if (fields.filter((field) => field.fieldType === 'literef' && field.arrayLength === 0).length >= 1) {
                        return true;
                    } else {
                        return false;
                    }
                },
            },
            {
                interface: Feature.WEAKREF,
                label: 'Weak assignments',
                optional: true,
                description: `Does not cascade ownership changes to its assigned tokens.`,
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
                interface: Feature.PATCHACCOUNT,
                label: 'Account Patch',
                description: "Contract's tokens are soulbound to a target address",
            },
            {
                interface: Feature.PATCH1155,
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
