/* eslint-disable react-hooks/exhaustive-deps */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from "reactflow";
import useStore from "../store";
import { FieldType, InterfaceDecorators, Patchwork721Interface } from '../types/constants';
import { Patchwork721Data } from "../types/types";

export function Patchwork721Node({
    id,
    data,
    dragging,
}: NodeProps<Patchwork721Data>) {

    const { setEditor, updateNode, getNode } = useStore();
    const node = getNode(id)!;
    const updateNodeInternals = useUpdateNodeInternals();
    const updateHandles = useCallback(() => {
        updateNodeInternals(id);
    }, [updateNodeInternals]);
    useEffect(() => {
        updateHandles();
    }, [updateHandles]);

    useEffect(() => {
        if (dragging) {
            updateNode(id, { ...node, selected: false });
        }
    }, [dragging]);

    return (
        <div
            className={`react-flow__node-default ring-0 ring-inset ring-gray-800/10 [.selected>&]:ring-[6px] dotted bg-white relative border rounded w-[340px] text-left p-6 text-lg leading-none transition-all hover:-translate-y-0.5 ${dragging ? 'scale-[1.1] shadow-xl shadow-gray-800/40' : 'shadow-md shadow--hover'}`}
            onClick={() => setEditor(id)}>

            <div className="flex flex-col gap-y-3.5 relative">

                <div className="font-bold text-[20px]">{data.name || 'New contract'}</div>

                {!!data.interfaces?.length &&
                    <section>
                        <div className="flex gap-1.5">
                            {data.interfaces?.map((i) =>
                                <div key={i} className="rounded font-semibold text-[10px] capitalize pr-1.5 p-1 pl-[5px] leading-none border border-black shadow flex gap-1 justify-center">
                                    <FontAwesomeIcon icon={InterfaceDecorators[i].icon} />
                                    <span>{Patchwork721Interface[i]}</span>
                                </div>
                            )}
                        </div>
                    </section>
                }

                {data.interfaces?.includes(Patchwork721Interface.Assignee) &&
                    <section>
                        <div className="form-label mt-2 mb-3">
                            Assignments
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {data.fields?.filter((f) => f.type == FieldType.LITEREF).map((f) => (
                                <div className="flex gap-2 items-stretch -mr-12" key={f.id}>
                                    <button
                                        className='form-input dotted font-semibold w-auto grow form-input--hoverable shadow shadow--hover'
                                        onClick={(e) => e.stopPropagation()}>
                                        {f.name}
                                    </button>
                                    <Handle
                                        id={"assignee-" + f.id}
                                        type="target"
                                        position={Position.Right}
                                        className="handle-reset pr-2 z-[5] group">
                                        <div className="rounded w-8 h-8 bg-black text-white text-sm flex items-center justify-center shadow pointer-events-none">
                                            <FontAwesomeIcon icon={InterfaceDecorators[Patchwork721Interface.Assignee].icon} />
                                        </div>
                                    </Handle>
                                </div>
                            ))}
                        </div>
                    </section>
                }


            </div>

            {data.interfaces?.includes(Patchwork721Interface.Assignable) &&
                <Handle id={"assignable-" + id} type="source" position={Position.Left} className="!bg-black text-sm flex items-center justify-center text-white !-left-10 !rounded w-8 h-8 !border-none font-icon shadow transition-all">
                    <FontAwesomeIcon icon={InterfaceDecorators[Patchwork721Interface.Assignable].icon} className="pointer-events-none" />
                </Handle>
            }
            {data.interfaces?.includes(Patchwork721Interface.Patch) &&
                <Handle id="patch" type="source" position={Position.Top} className="!bg-white text-[12px] !-top-8 flex items-center font-medium justify-center gap-1 text-black !rounded h-6 !w-fit !border-black font-icon px-2 shadow transition-all">
                    <FontAwesomeIcon icon={InterfaceDecorators[Patchwork721Interface.Patch].icon} className="pointer-events-none" />
                    <span>Patch</span>
                </Handle>
            }
        </div>
    );
}
