import { IconProps } from '@radix-ui/react-icons/dist/types';
import { FieldType, Patchwork721Interface } from './constants';

export interface Patchwork721Field {
    id: string;
    name: string;
    type: FieldType;
    cardinality: number | '';
    values?: PatchworkEnum[];
}

export interface PatchworkEnum {
    uid: string;
    value: string;
}

export interface Patchwork721Data {
    name: string;
    interfaces: Patchwork721Interface[];
    fields: Patchwork721Field[];
}

export type AssignmentNodeData = {
    name: string;
};

export type Patchwork721InterfaceDecorators = {
    [key in Patchwork721Interface]: {
        icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
    };
};
