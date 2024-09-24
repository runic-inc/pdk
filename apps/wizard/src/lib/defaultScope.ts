import { ScopeConfig } from '@patchworkdev/common/types';

export default {
    name: 'My Scope',
    whitelist: true,
    userAssign: false,
    userPatch: false,
    mintConfigs: {},
    operators: [],
    bankers: [],
} satisfies ScopeConfig;
