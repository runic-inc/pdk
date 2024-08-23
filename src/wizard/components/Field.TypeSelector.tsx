import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@wizard/primitives/command';
import { Popover, PopoverContent, PopoverTrigger } from '@wizard/primitives/popover';
import { Button } from '@wizard/primitives/button';
import { useState } from 'react';
import { ContractConfig, FieldConfig, FieldType } from '@wizard/../types';
import Icon from '@wizard/primitives/icon';
import { cn } from '@wizard/lib/utils';

type FieldTypeInfo = {
    value: FieldType;
    label: string;
    description?: string;
    icon: `fa-${string}`;
};

const icons: Record<string, `fa-${string}`> = {
    string: 'fa-input-text',
    number: 'fa-input-numeric',
    boolean: 'fa-toggle-large-on',
    literef: 'fa-grid-2-plus',
    address: 'fa-at',
    enum: 'fa-list-ol',
};

const fieldTypeInfo: FieldTypeInfo[] = [
    {
        value: FieldType.LITEREF,
        label: 'literef',
        description: 'A 64-bit reference to a Patchwork assignment',
        icon: icons.literef,
    },
    {
        value: FieldType.ENUM,
        label: 'enum',
        description: 'A contrained set of predefined values. Can be used for creating assignment rules',
        icon: icons.enum,
    },
    {
        value: FieldType.ADDRESS,
        label: 'address',
        description: 'A 160-bit address',
        icon: icons.address,
    },
    {
        value: FieldType.BOOLEAN,
        label: 'boolean',
        description: 'A boolean type (true or false)',
        icon: icons.boolean,
    },
    {
        value: FieldType.INT8,
        label: 'int8',
        description: 'An 8-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.INT16,
        label: 'int16',
        description: 'A 16-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.INT32,
        label: 'int32',
        description: 'A 32-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.INT64,
        label: 'int64',
        description: 'A 64-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.INT128,
        label: 'int128',
        description: 'A 128-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.INT256,
        label: 'int256',
        description: 'A 256-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT8,
        label: 'uint8',
        description: 'An 8-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT16,
        label: 'uint16',
        description: 'A 16-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT32,
        label: 'uint32',
        description: 'A 32-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT64,
        label: 'uint64',
        description: 'A 64-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT128,
        label: 'uint128',
        description: 'A 128-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.UINT256,
        label: 'uint256',
        description: 'A 256-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldType.CHAR8,
        label: 'char8',
        description: 'An 8-character string (64 bits)',
        icon: icons.string,
    },
    {
        value: FieldType.CHAR16,
        label: 'char16',
        description: 'A 16-character string (128 bits)',
        icon: icons.string,
    },
    {
        value: FieldType.CHAR32,
        label: 'char32',
        description: 'A 32-character string (256 bits)',
        icon: icons.string,
    },
    {
        value: FieldType.CHAR64,
        label: 'char64',
        description: 'A 64-character string (512 bits)',
        icon: icons.string,
    },
    {
        value: FieldType.STRING,
        label: 'string',
        description: 'A dynamically-sized string',
        icon: icons.string,
    },
];

const FieldTypeSelector = ({ field, setField }: { field: FieldConfig; setField: React.Dispatch<React.SetStateAction<ContractConfig>> }) => {
    const [open, setOpen] = useState(false);

    const handleComboboxChange = (value: string) => {
        setField((prevData) => {
            return (
                prevData && {
                    ...prevData,
                    fields: prevData.fields.map((_f) => (_f._uid === field._uid ? { ..._f, fieldType: value } : _f)),
                }
            );
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='input'
                    size='input'
                    role='combobox'
                    aria-expanded={open}
                    className={`w-full justify-between ${field.fieldType ? 'text-foreground' : 'text-muted-foreground font-normal'}`}
                >
                    {field.fieldType ?? 'Select a field type'}
                    <Icon icon='fa-angles-up-down' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0'>
                <Command defaultValue={field.fieldType}>
                    <CommandInput placeholder='Search field types...' />
                    <CommandList>
                        <CommandEmpty>Type not found.</CommandEmpty>
                        <CommandGroup>
                            {fieldTypeInfo.map((_f) => (
                                <CommandItem
                                    key={'fieldtype' + _f.label}
                                    value={_f.label}
                                    defaultChecked={_f.label === field.fieldType}
                                    onSelect={() => {
                                        handleComboboxChange(_f.label);
                                        setOpen(false);
                                    }}
                                    className='flex flex-col items-start relative text-sm'
                                >
                                    <div className='font-mono flex justify-between items-center w-full'>
                                        <span className='grow'>{_f.label}</span>
                                        <Icon icon='fa-check' className={cn('mr-2 h-4 w-4', field.fieldType === _f.label ? 'opacity-100' : 'opacity-0')} />
                                    </div>
                                    <div className='opacity-50 leading-4 font-normal'>{_f.description}</div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default FieldTypeSelector;
