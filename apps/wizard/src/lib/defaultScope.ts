import { ScopeConfig } from '@patchworkdev/common/types';

export default {
    name: 'MyScope',
    whitelist: true,
    userAssign: false,
    userPatch: false,
    mintConfigs: new Map(),
    operators: [],
    bankers: [],
} satisfies ScopeConfig;
