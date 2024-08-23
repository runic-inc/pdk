import { Disclosure } from '@headlessui/react';
import { Reorder, useDragControls } from 'framer-motion';
import { useEffect } from 'react';
import { boxShadow } from 'tailwindcss/defaultTheme';
import { Patchwork721Data, FunctionConfig, FieldConfig, ContractConfig } from '../../types';
import Icon from '@wizard/primitives/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@wizard/primitives/select';
import { Input } from '@wizard/primitives/input';
import FieldTypeSelector from './Field.TypeSelector';
import EnumList from './Field.EnumList';

export function Field({
    field,
    setter,
    nodeData,
}: {
    field: FieldConfig;
    setter: React.Dispatch<React.SetStateAction<ContractConfig>>;
    nodeData?: Patchwork721Data;
}) {
    const fieldDrag = useDragControls();

    const handleFieldInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setter(
            (prevData) =>
                prevData && {
                    ...prevData,
                    fields: prevData.fields.map((_f) => (_f._uid === field._uid ? { ..._f, [name]: name === 'arrayLength' ? parseInt(value) : value } : _f)),
                },
        );
    };

    const handleRemoveField = () => {
        setter(
            (prevData) =>
                prevData && {
                    ...prevData,
                    fields: prevData.fields.filter((_f) => _f._uid !== field._uid),
                },
        );
    };

    const handleFunctionChange = (value: FunctionConfig) => {
        setter((prevData) => ({
            ...prevData,
            fields: prevData.fields.map((_f) => (_f._uid === field._uid ? { ..._f, functionConfig: value } : _f)),
        }));
    };

    useEffect(() => {
        /*if (!nodeData.interfaces.includes(Patchwork721Interface.Assignee) && field.fieldType === FieldType.LITEREF) {
            handleRemoveField();
        }*/
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeData]);

    return (
        <Reorder.Item value={field} dragListener={false} whileDrag={{ scale: 1.075, boxShadow: boxShadow.lg }} dragControls={fieldDrag}>
            <Disclosure defaultOpen={true}>
                {(_, filled: boolean = field.key != '' && typeof field.arrayLength == 'number') => (
                    <div className={`dotted relative bg-white rounded border border-black shadow text-sm transition-all font-medium leading-none`}>
                        <div className={`relative flex w-full items-center p-1`}>
                            <button onPointerDown={(e) => fieldDrag.start(e)} className='cursor-ns-resize shrink p-2'>
                                <Icon icon='fa-grip-dots-vertical' />
                            </button>

                            <Disclosure.Button
                                className='cursor-pointer grid grid-cols-[6fr_3fr_3fr] grow items-center text-left p-2 pl-1 disabled:cursor-auto'
                                disabled={!filled}
                            >
                                <span className='font-semibold'>{field.key}</span>
                                <span className='font-mono text-[10px] uppercase font-semibold'>{field.fieldType != 'empty' && field.fieldType}</span>
                                <span className='font-mono text-[10px] uppercase font-semibold'>
                                    {(field.arrayLength == 0 && 'Dynamic') || (field.arrayLength == 1 && 'Single') || field.arrayLength}
                                </span>
                            </Disclosure.Button>
                        </div>

                        <Disclosure.Panel
                            static={!filled}
                            className='dotted relative rounded-b p-3 border-t border-black bg-neutral-50 cursor-auto flex flex-col gap-2'
                        >
                            <label className='grid grid-cols-[1fr_2.5fr] gap-1 items-center'>
                                <span className='form-label'>Name</span>
                                <Input
                                    type='text'
                                    name='key'
                                    defaultValue={field.key}
                                    onChange={handleFieldInputChange}
                                    placeholder='Name your field'
                                    autoComplete='off'
                                    autoCapitalize='on'
                                />
                            </label>

                            <label className='grid grid-cols-[1fr_2.5fr] gap-1 items-center'>
                                <span className='form-label'>Description</span>
                                <Input
                                    type='text'
                                    name='description'
                                    defaultValue={field.description}
                                    onChange={handleFieldInputChange}
                                    placeholder='Short description of your field'
                                    autoComplete='off'
                                    autoCapitalize='on'
                                />
                            </label>

                            <label className='grid grid-cols-[1fr_2.5fr] gap-1 items-center'>
                                <span className='form-label'>Type</span>
                                <FieldTypeSelector field={field} setField={setter} />
                            </label>

                            <label className='grid grid-cols-[1fr_2.5fr] gap-1 items-center'>
                                <span className='form-label'>Cardinality</span>
                                <Input
                                    type='number'
                                    name='arrayLength'
                                    defaultValue={field.arrayLength}
                                    min={0}
                                    onChange={handleFieldInputChange}
                                    placeholder='Max number of items stored in field'
                                />
                            </label>

                            <label className='grid grid-cols-[1fr_2.5fr] gap-1 items-center'>
                                <span className='form-label'>Functions</span>
                                <Select defaultValue={field.functionConfig} onValueChange={handleFunctionChange}>
                                    <SelectTrigger className='items-start [&_[data-description]]:hidden'>
                                        <SelectValue placeholder='Select generated functions' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={FunctionConfig.ALL}>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>All</span>
                                                <span className='text-muted-foreground' data-description>
                                                    Generate both getter and setter functions for the field
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={FunctionConfig.NONE}>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>None</span>
                                                <span className='text-muted-foreground' data-description>
                                                    Don't generate any functions for the field
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={FunctionConfig.LOAD}>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>Load</span>
                                                <span className='text-muted-foreground' data-description>
                                                    Generate getter function for the field
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={FunctionConfig.STORE}>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>Store</span>
                                                <span className='text-muted-foreground' data-description>
                                                    Generate setter function for the field
                                                </span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>

                            <div className='flex justify-end pt-1.5'>
                                <button className='p-2 w-fit rounded-md bg-gray-300/50 text-[10px]' onClick={() => handleRemoveField()}>
                                    Remove field
                                </button>
                            </div>

                            {field.fieldType === 'enum' && <EnumList field={field} setField={setter} />}
                        </Disclosure.Panel>
                    </div>
                )}
            </Disclosure>
        </Reorder.Item>
    );
}
