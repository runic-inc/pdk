import { memo, useEffect } from 'react';
import { FieldConfig, FunctionConfig } from '@/types';
import { Label } from '@/wizard/primitives/label';
import { Input } from '@/wizard/primitives/input';
import { Reorder } from 'framer-motion';
import Field from './editorPanel/FieldItem';
import { nanoid } from 'nanoid';
import features from '@/wizard/lib/features';
import FeatureEntry from './editorPanel/FeatureItem';
import useStore from '@/wizard/store';
import { Button } from '@/wizard/primitives/button';

const ContractEditor = memo(() => {
    const { contractConfig, updateContractConfig } = useStore();

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateContractConfig({
            ...contractConfig,
            [target.name]: target.value,
        });
    };

    const handleAddField = () => {
        updateContractConfig({
            ...contractConfig,
            fields: [
                ...contractConfig.fields,
                {
                    _uid: 'field_' + nanoid(),
                    id: contractConfig.fields.length + 1,
                    key: '',
                    description: '',
                    fieldType: 'char32',
                    arrayLength: 1,
                    functionConfig: FunctionConfig.ALL,
                },
            ],
        });
    };

    // Field change handler
    const handleFieldSort = (fields: FieldConfig[]) => {
        fields = fields.map((field, index) => ({ ...field, id: index + 1 }));
        updateContractConfig({
            ...contractConfig,
            fields,
        });
    };

    useEffect(() => {
        handleAddField();
    }, []);

    return (
        <div className='flex flex-col gap-4'>
            <div className='hidden'>
                <Label htmlFor='scopeName'>Scope name</Label>
                <Input name='scopeName' id='scopeName' defaultValue={contractConfig.scopeName} onChange={handleInputChange} placeholder='Scope Name' />
            </div>

            <div className='flex flex-col gap-4'>
                <h3 className='font-medium -mx-6 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky -top-6 z-50'>
                    Contract details
                </h3>

                <div>
                    <div className='grid grid-cols-[2fr_1fr]'>
                        <Label htmlFor='name'>Contract name</Label>
                        <Label htmlFor='symbol'>Contract symbol</Label>
                    </div>
                    <div className='grid grid-cols-[2fr_1fr]'>
                        <Input
                            name='name'
                            id='name'
                            defaultValue={contractConfig.name}
                            onChange={handleInputChange}
                            placeholder='Contract name'
                            className='text-lg rounded-r-none focus:z-10'
                        />
                        <Input
                            name='symbol'
                            id='symbol'
                            defaultValue={contractConfig.symbol}
                            onChange={handleInputChange}
                            placeholder='Symbol'
                            className='text-lg rounded-l-none -ml-[1px] focus:z-10'
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor='scopeName'>Scope name</Label>
                    <Input name='scopeName' id='scopeName' defaultValue={contractConfig.scopeName} onChange={handleInputChange} placeholder='Scope name' />
                </div>

                <div className=''>
                    <Label>Contract URIs</Label>
                    <div className='space-y-1.5 rounded bg-muted/50 border p-3 dotted shadow'>
                        <div className='flex items-center'>
                            <Label htmlFor='baseURI' className='w-28 text-xs'>
                                Base URI
                            </Label>
                            <Input
                                name='baseURI'
                                id='baseURI'
                                value={contractConfig.baseURI}
                                onChange={handleInputChange}
                                placeholder='Base URI'
                                className='text-xs'
                            />
                        </div>
                        <div className='flex items-center'>
                            <Label htmlFor='baseURI' className='w-28 text-xs'>
                                Schema URI
                            </Label>
                            <Input
                                name='schemaURI'
                                id='schemaURI'
                                value={contractConfig.schemaURI}
                                onChange={handleInputChange}
                                placeholder='Schema URI'
                                className='text-xs'
                            />
                        </div>
                        <div className='flex items-center'>
                            <Label htmlFor='baseURI' className='w-28 text-xs'>
                                Image URI
                            </Label>
                            <Input
                                name='imageURI'
                                id='imageURI'
                                value={contractConfig.imageURI}
                                onChange={handleInputChange}
                                placeholder='Image URI'
                                className='text-xs'
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-2 items-stretch justify-stretch'>
                <h3 className='font-medium -mx-6 my-3 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky -top-6 z-50'>
                    Patchwork features
                </h3>
                {features.map((feature) => (
                    <FeatureEntry key={feature.name} feature={feature} />
                ))}
            </div>

            <div className='flex flex-col gap-2 items-stretch justify-stretch'>
                <h3 className='font-medium -mx-6 my-3 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky -top-6 z-50'>
                    Data fields
                </h3>

                <Reorder.Group
                    axis='y'
                    values={contractConfig?.fields || []}
                    onReorder={(newOrder: FieldConfig[]) => handleFieldSort(newOrder)}
                    className='flex flex-col gap-2'
                >
                    {contractConfig?.fields?.map((field) => (
                        <Field key={field._uid} field={field} />
                    ))}
                </Reorder.Group>
                <Button onClick={handleAddField} variant={'outline'} className='w-full'>
                    Add a new field
                </Button>
            </div>
        </div>
    );
});

export default ContractEditor;
