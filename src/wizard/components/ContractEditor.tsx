import { FunctionConfig } from '@/types';
import features from '@/wizard/lib/features';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/wizard/primitives/alert-dialog';
import { Button } from '@/wizard/primitives/button';
import { Input } from '@/wizard/primitives/input';
import { Label } from '@/wizard/primitives/label';
import useStore, { useConfig } from '@/wizard/store';
import { Reorder } from 'framer-motion';
import { nanoid } from 'nanoid';
import { memo, useEffect } from 'react';
import Icon from '../primitives/icon';
import { UFieldConfig } from '../types';
import FeatureEntry from './editorPanel/FeatureItem';
import Field from './editorPanel/FieldItem';
import NameInput from './editorPanel/NameInput';

const ContractEditor = memo(() => {
    const { updateContractConfig, deleteContract } = useStore();
    const contractConfig = useConfig()!;

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

    const handleFieldSort = (fields: UFieldConfig[]) => {
        fields = fields.map((field, index) => ({ ...field, id: index + 1 }));
        updateContractConfig({
            ...contractConfig,
            fields,
        });
    };

    useEffect(() => {
        if (contractConfig.fields.length === 0) {
            handleAddField();
        }
    }, []);

    return (
        contractConfig && (
            <div className='flex flex-col gap-4'>
                <div className='hidden'>
                    <Label htmlFor='scopeName'>Scope name</Label>
                    <Input name='scopeName' id='scopeName' value={contractConfig.scopeName} onChange={handleInputChange} placeholder='Scope Name' />
                </div>

                <div className='flex flex-col gap-4'>
                    <h3 className='font-medium -mx-6 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                        Contract details
                    </h3>

                    <NameInput key={contractConfig._uid} />

                    <div className='hidden'>
                        <Label htmlFor='scopeName'>Scope name</Label>
                        <Input name='scopeName' id='scopeName' defaultValue={contractConfig.scopeName} onChange={handleInputChange} placeholder='Scope name' />
                        <p data-description className='mt-2 text-sm text-muted-foreground'>
                            Scopes are application-level Patchwork namespaces for configuring settings and permissions or your app.
                        </p>
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
                    <h3 className='font-medium -mx-6 my-3 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                        Patchwork features
                    </h3>
                    {features.map((feature) => (
                        <FeatureEntry key={feature.name + contractConfig._uid} feature={feature} />
                    ))}
                </div>

                <div className='flex flex-col gap-2 items-stretch justify-stretch'>
                    <h3 className='font-medium -mx-6 my-3 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                        Data fields
                    </h3>

                    <Reorder.Group
                        axis='y'
                        values={contractConfig?.fields || []}
                        onReorder={(newOrder: UFieldConfig[]) => handleFieldSort(newOrder)}
                        className='flex flex-col gap-2'
                    >
                        {contractConfig?.fields?.map((field: UFieldConfig) => <Field key={field._uid} field={field as UFieldConfig} />)}
                    </Reorder.Group>
                    <Button onClick={handleAddField} variant={'outline'} className='w-full'>
                        Add a new field
                    </Button>
                </div>

                <div className='flex flex-col gap-2 items-stretch justify-stretch'>
                    <h3 className='font-medium -mx-6 my-3 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                        Other settings
                    </h3>

                    <div className='flex justify-between items-center'>
                        <Label>Delete contract</Label>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant={'destructive'}>
                                    <Icon icon='fa-trash' />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className='border-destructive'>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this contract?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant={'destructive'}
                                            className='bg-destructive hover:bg-destructive/90'
                                            onClick={() => {
                                                deleteContract(contractConfig._uid);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <footer className='-mx-6 p-3 pt-1 mt-4 sticky bottom-0 bg-background z-[1] hidden'>
                    <Button className='w-full gap-2'>
                        <Icon icon='fa-check' />
                        Done editing
                    </Button>
                    <div className='h-10 absolute bottom-full left-0 right-0 bg-gradient-to-b from-background/0 to-background pointer-events-none' />
                </footer>
            </div>
        )
    );
});

export default ContractEditor;
