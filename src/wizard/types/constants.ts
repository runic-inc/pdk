import { Patchwork721InterfaceDecorators } from './types';
import { FrameIcon, MarginIcon, PaddingIcon } from '@radix-ui/react-icons';

export enum Patchwork721Interface {
    Assignee = 1,
    Assignable,
    Patch,
}

export enum FieldType {
    empty,
    BOOLEAN,
    INT8,
    INT16,
    INT32,
    INT64,
    INT128,
    INT256,
    UINT8,
    UINT16,
    UINT32,
    UINT64,
    UINT128,
    UINT256,
    CHAR8,
    CHAR16,
    CHAR32,
    CHAR64,
    LITEREF,
    ADDRESS,
    STRING,
    ENUM,
}

export const InterfaceDecorators: Patchwork721InterfaceDecorators = {
    [Patchwork721Interface.Assignee]: {
        icon: PaddingIcon,
    },
    [Patchwork721Interface.Assignable]: {
        icon: MarginIcon,
    },
    [Patchwork721Interface.Patch]: {
        icon: FrameIcon,
    },
};
