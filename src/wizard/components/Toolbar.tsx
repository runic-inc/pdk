import { Popover } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Panel, XYPosition, useReactFlow } from 'reactflow';
import { defaultNodeProps } from '../nodes';
import useStore, { StoreState } from '../store';
import { useKeyDown } from '../hooks/useKeyDown';
import Icon from '@wizard/primitives/icon';

const selectors = (state: StoreState) => ({
    addNode: state.addNode,
    nodes: state.nodes,
    edges: state.edges,
});

const Toolbar = () => {
    const { addNode, nodes, edges } = useStore(selectors);
    const { undo, redo } = useStore.temporal.getState();

    const flow = useReactFlow();

    useKeyDown(() => {
        undo();
    }, ['Control', 'z']);

    useKeyDown(() => {
        redo();
    }, ['Control', 'y']);

    const getCenter = (): XYPosition => {
        const coords: XYPosition = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        return flow.screenToFlowPosition(coords);
    };

    const printState = () => {
        console.log(JSON.stringify({ nodes, edges }));
    };

    const addNewNode = (coords?: XYPosition) => {
        addNode({
            ...defaultNodeProps,
            id: 'contract' + Math.round(Math.random() * 10000),
            position: {
                x: coords ? coords.x : getCenter().x + Math.random() * 400 - 200,
                y: coords ? coords.y : getCenter().y + Math.random() * 200 - 100,
            },
        });
    };

    return (
        <Panel position='top-center' className='rounded-full text-[12px] font-medium grid grid-cols-4 justify-center items-center p-1 gap-1'>
            <motion.button
                onPan={(e) => {
                    e.stopPropagation();
                }}
                onPanEnd={(_, info) => {
                    addNewNode(flow.screenToFlowPosition(info.point));
                }}
                className='px-4 py-2 rounded-l-3xl bg-white border border-black rounded-r transition shadow shadow--hover'
                onClick={() => addNewNode()}
            >
                Add contract
            </motion.button>
            <Popover className='relative'>
                <Popover.Button
                    disabled
                    className='px-5 pointer-events-none w-full py-2 rounded bg-white border border-black transition shadow shadow--hover ui-open:shadow ui-open:translate-y-0'
                >
                    Add utility
                </Popover.Button>
                <Popover.Panel className='absolute flex flex-col gap-1 p-2 -left-14 -right-14 top-full mt-2 z-10 bg-white border border-black rounded shadow-lg'>
                    {/*<div className="w-1.5 h-2.5 left-1/2 absolute bg-white border-x border-black bottom-full" />
                <button className="text-left p-2">Field computer</button>
                <button className="text-left p-2">Field transformer</button>
                <button className="text-left p-2">Image generator</button>*/}
                </Popover.Panel>
            </Popover>
            <div className='flex gap-1'>
                <button className='px-3 py-2 rounded bg-white grow border border-black transition shadow shadow--hover' onClick={() => undo()}>
                    <Icon icon='fa-undo' />
                </button>
                <button className='px-3 py-2 rounded bg-white grow border border-black transition shadow shadow--hover' onClick={() => redo()}>
                    <Icon icon='fa-redo' />
                </button>
            </div>
            <button className='px-4 py-2 rounded-l rounded-r-3xl text-white bg-black border border-black transition shadow shadow--hover' onClick={printState}>
                Save app
            </button>
        </Panel>
    );
};
export default Toolbar;
