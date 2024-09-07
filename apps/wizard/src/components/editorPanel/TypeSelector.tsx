import { FieldTypeEnum } from '@patchworkdev/common/types';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../primitives/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../primitives/command';
import Icon from '../../primitives/icon';
import { Popover, PopoverContent, PopoverTrigger } from '../../primitives/popover';
import useStore, { Store } from '../../store';
import { UFieldConfig } from '../../types';

type typeInfo = {
    value: FieldTypeEnum;
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

const typeInfo: typeInfo[] = [
    {
        value: FieldTypeEnum.LITEREF,
        label: 'literef',
        description: 'A 64-bit reference to a Patchwork assignment',
        icon: icons.literef,
    },
    /*{
        value: FieldTypeEnum.ENUM,
        label: 'enum',
        description: 'A contrained set of predefined values. Can be used for creating assignment rules',
        icon: icons.enum,
    },*/
    {
        value: FieldTypeEnum.ADDRESS,
        label: 'address',
        description: 'A 160-bit address',
        icon: icons.address,
    },
    {
        value: FieldTypeEnum.BOOLEAN,
        label: 'boolean',
        description: 'A boolean type (true or false)',
        icon: icons.boolean,
    },
    {
        value: FieldTypeEnum.INT8,
        label: 'int8',
        description: 'An 8-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.INT16,
        label: 'int16',
        description: 'A 16-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.INT32,
        label: 'int32',
        description: 'A 32-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.INT64,
        label: 'int64',
        description: 'A 64-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.INT128,
        label: 'int128',
        description: 'A 128-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.INT256,
        label: 'int256',
        description: 'A 256-bit signed integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT8,
        label: 'uint8',
        description: 'An 8-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT16,
        label: 'uint16',
        description: 'A 16-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT32,
        label: 'uint32',
        description: 'A 32-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT64,
        label: 'uint64',
        description: 'A 64-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT128,
        label: 'uint128',
        description: 'A 128-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.UINT256,
        label: 'uint256',
        description: 'A 256-bit unsigned integer',
        icon: icons.number,
    },
    {
        value: FieldTypeEnum.CHAR8,
        label: 'char8',
        description: 'An 8-character string (64 bits)',
        icon: icons.string,
    },
    {
        value: FieldTypeEnum.CHAR16,
        label: 'char16',
        description: 'A 16-character string (128 bits)',
        icon: icons.string,
    },
    {
        value: FieldTypeEnum.CHAR32,
        label: 'char32',
        description: 'A 32-character string (256 bits)',
        icon: icons.string,
    },
    {
        value: FieldTypeEnum.CHAR64,
        label: 'char64',
        description: 'A 64-character string (512 bits)',
        icon: icons.string,
    },
    {
        value: FieldTypeEnum.STRING,
        label: 'string',
        description: 'A dynamically-sized string',
        icon: icons.string,
    },
];

const typeSelector = ({ field }: { field: UFieldConfig }) => {
    const [open, setOpen] = useState(false);
    const { updateContractConfig } = useStore();
    const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);

    const handleComboboxChange = (value: string) => {
        updateContractConfig({
            ...contractConfig,
            fields: contractConfig.fields.map((_f) => (_f._uid === field._uid ? { ..._f, type: value } : _f)),
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
                    className={`w-full justify-between ${field.type ? 'text-foreground' : 'text-muted-foreground font-normal'}`}
                >
                    {field.type ?? 'Select a field type'}
                    <Icon icon='fa-angles-up-down' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0'>
                <Command defaultValue={field.type}>
                    <CommandInput placeholder='Search field types...' />
                    <CommandList>
                        <CommandEmpty>Type not found.</CommandEmpty>
                        <CommandGroup>
                            {typeInfo.map((_f) => (
                                <CommandItem
                                    key={'type' + _f.label}
                                    value={_f.label}
                                    defaultChecked={_f.label === field.type}
                                    onSelect={() => {
                                        handleComboboxChange(_f.label);
                                        setOpen(false);
                                    }}
                                    className='flex flex-col items-start relative text-sm'
                                >
                                    <div className='font-mono flex justify-between items-center w-full'>
                                        <span className='grow'>{_f.label}</span>
                                        <Icon icon='fa-check' className={cn('mr-2 h-4 w-4', field.type === _f.label ? 'opacity-100' : 'opacity-0')} />
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

export default typeSelector;
