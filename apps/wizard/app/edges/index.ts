import { MarkerType, type Edge, type EdgeTypes } from 'reactflow';

export const defaultEdgeProps: Partial<Edge> = {
    type: 'smoothstep',
    style: { strokeWidth: 1, stroke: '#000000' },
    pathOptions: { borderRadius: 16, offset: 20 },
    markerEnd: {
        type: MarkerType.Arrow,
        strokeWidth: 0.7,
        color: '#000000',
        width: 32,
        height: 32,
    },
};

export const initialEdges = [
    {
        id: 'foo.items-foo.character.items',
        source: 'foo.items',
        target: 'foo.character.items',
        ...defaultEdgeProps,
    },
] satisfies Edge[];

export const edgeTypes = {} satisfies EdgeTypes;
