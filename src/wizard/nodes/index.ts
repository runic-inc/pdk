import type { Node } from 'reactflow';
import { Patchwork721Interface } from '../types/constants';

export const defaultNodeProps = {
    type: 'patchwork721Node',
    data: {
        name: '',
        interfaces: [],
        fields: [],
    },
};

export const initialNodes = [
    {
        id: 'foo.character',
        type: 'patchwork721Node',
        data: {
            name: 'Character',
            interfaces: [Patchwork721Interface.Assignee],
            fields: [],
        },
        position: { x: 0, y: 0 },
    },

    {
        id: 'foo.items',
        type: 'patchwork721Node',
        data: {
            name: 'Items',
            interfaces: [Patchwork721Interface.Assignable],
            fields: [],
        },
        position: { x: 500, y: -40 },
    },

    {
        id: 'foo.character.items',
        parentNode: 'foo.character',
        type: 'assignmentNode',
        data: {
            name: 'Items',
        },
        position: { x: 24, y: 128 },
        draggable: false,
    },

    {
        id: 'foo.character.spells',
        parentNode: 'foo.character',
        type: 'assignmentNode',
        data: {
            name: 'Spells',
        },
        position: { x: 24, y: 174 },
        draggable: false,
    },
] as Node[];
