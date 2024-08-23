import equal from 'fast-deep-equal';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    OnConnect,
    OnEdgesChange,
    OnNodesChange,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
} from 'reactflow';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { defaultEdgeProps } from '../edges';
import { Patchwork721Field } from '../types/types';

export type RFState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    getNode: (id: string) => Node | undefined;
    updateNode: (id: string, newNode: Node) => void;
    updateNodeData: (id: string, newNodeData: unknown) => void;
    addNode: (node: Node) => void;
};

type BuilderState = {
    editor: string | null;
    setEditor: (id: string | null) => void;
    fields: Patchwork721Field[];
    getField: (id: string) => Patchwork721Field | undefined;
    updateField: (id: string, newField: Patchwork721Field) => void;
};

export type StoreState = RFState & BuilderState;

/*
let lastTime: number;
const logAndSetNewTime = () => {
    const now = Date.now();
    console.log('Time since last update:', now - lastTime);
    lastTime = now;
};
let lastState: StoreState;
*/

const useStore = create<StoreState>()(
    persist(
        temporal(
            (set, get) => ({
                // RF store
                nodes: [],
                edges: [],
                getNode: (id: string) => get().nodes.find((node) => node.id === id),
                updateNode: (id: string, newNode: Node) => {
                    set({
                        nodes: get().nodes.map((node) => {
                            if (node.id === id) {
                                return newNode;
                            }
                            return node;
                        }),
                    });
                },
                updateNodeData: (id: string, newNodeData: unknown) => {
                    set({
                        nodes: get().nodes.map((node) => {
                            if (node.id === id) {
                                return { ...node, data: newNodeData };
                            }
                            return node;
                        }),
                    });
                },
                onNodesChange: (changes: NodeChange[]) => {
                    set({
                        nodes: applyNodeChanges(changes, get().nodes),
                    });
                },
                onEdgesChange: (changes: EdgeChange[]) => {
                    set({
                        edges: applyEdgeChanges(changes, get().edges),
                    });
                },
                onConnect: (connection: Connection) => {
                    set({
                        edges: addEdge(
                            {
                                ...connection,
                                ...defaultEdgeProps,
                            },
                            get().edges,
                        ),
                    });
                },
                setNodes: (nodes: Node[]) => {
                    set({ nodes });
                },
                setEdges: (edges: Edge[]) => {
                    set({ edges });
                },
                addNode: (node: Node) => {
                    set({ nodes: [...get().nodes, node] });
                },

                // Builder store
                editor: null,
                setEditor: (id: string | null) => {
                    set({ editor: id });
                },
                fields: [],
                getField: (id: string) => get().fields.find((field) => field.id === id),
                updateField: (id: string, newField: Patchwork721Field) => {
                    set({
                        fields: get().fields.map((field) => {
                            if (field.id === id) {
                                return { ...field, ...newField };
                            }
                            return field;
                        }),
                    });
                },
                createOrUpdateField: (newField: Patchwork721Field) => {
                    const field = get().fields.find((f) => f.id === newField.id);
                    if (field) {
                        get().updateField(newField.id, newField);
                    } else {
                        set({ fields: [...get().fields, newField] });
                    }
                },
            }),
            {
                wrapTemporal: (storeInitializer) => persist(storeInitializer, { name: 'playground-history' }),
                partialize: (state) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { nodes, edges } = state;
                    return { nodes, edges };
                },
                equality: (pastState, currentState) => {
                    const oldNodes: Partial<Node>[] = [];
                    const newNodes: Partial<Node>[] = [];
                    pastState.nodes.forEach((node) => oldNodes.push(node.data));
                    currentState.nodes.forEach((node) => newNodes.push(node.data));
                    return equal(oldNodes, newNodes) && equal(pastState.edges, currentState.edges);
                },
            },
        ),
        {
            name: 'playground-store',
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
            }),
        },
    ),
);

export default useStore;
