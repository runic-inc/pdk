import { useEffect, useState } from 'react';
import { ContractConfig, Feature, FieldConfig, FunctionConfig } from '../../types';
import { Label } from '@wizard/primitives/label';
import { Input } from '@wizard/primitives/input';
import { Reorder } from 'framer-motion';
import { Field } from './Field';
import { nanoid } from 'nanoid';

const InputFields = ({ setContractConfig }: { setContractConfig: (config: ContractConfig) => void }) => {
    const [config, setConfig] = useState<ContractConfig>({
        scopeName: 'test',
        name: 'AccountPatch',
        symbol: 'AP',
        baseURI: 'https://mything/my/',
        schemaURI: 'https://mything/my-metadata.json',
        imageURI: 'https://mything/my/{tokenID}.png',
        fields: [],
        features: [],
    });

    useEffect(() => {
        setContractConfig(config);
    }, [config]);

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setConfig((prev) => ({ ...prev, [target.name]: target.value }));
    };

    const handleFeatureToggle = (feature: Feature) => {
        setConfig((prev) => ({
            ...prev,
            features: prev.features?.includes(feature) ? prev.features.filter((f) => f !== feature) : [...(prev.features || []), feature],
        }));
    };

    const handleAddField = () => {
        setConfig(
            (prevData) =>
                prevData && {
                    ...prevData,
                    fields: [
                        ...prevData.fields,
                        {
                            _uid: 'field_' + nanoid(),
                            id: prevData.fields.length + 1,
                            key: '',
                            description: '',
                            fieldType: 'char32',
                            arrayLength: 1,
                            functionConfig: FunctionConfig.ALL,
                        },
                    ],
                },
        );
    };

    // Field change handler
    const handleFieldSort = (fields: FieldConfig[]) => {
        fields = fields.map((field, index) => ({ ...field, id: index + 1 }));
        setConfig((prevData) => prevData && { ...prevData, fields });
    };

    useEffect(() => {
        handleAddField();
    }, []);

    return (
        <div className='space-y-4'>
            <div>
                <Label htmlFor='scopeName'>Scope name</Label>
                <Input name='scopeName' id='scopeName' defaultValue={config.scopeName} onChange={handleInputChange} placeholder='Scope Name' />
            </div>

            <div>
                <Label htmlFor='name'>Contract name</Label>
                <Input name='name' id='name' defaultValue={config.name} onChange={handleInputChange} placeholder='Contract name' />
            </div>

            <div>
                <Label htmlFor='symbol'>Contract symbol</Label>
                <Input name='symbol' id='symbol' defaultValue={config.symbol} onChange={handleInputChange} placeholder='Contract symbol' />
            </div>

            <div className='space-y-2'>
                <Label>Contract URIs</Label>
                <div className='flex items-center'>
                    <Label htmlFor='baseURI' className='w-28 text-xs'>
                        Base URI
                    </Label>
                    <Input name='baseURI' id='baseURI' value={config.baseURI} onChange={handleInputChange} placeholder='Base URI' className='text-xs' />
                </div>
                <div className='flex items-center'>
                    <Label htmlFor='baseURI' className='w-28 text-xs'>
                        Schema URI
                    </Label>
                    <Input name='schemaURI' id='schemaURI' value={config.schemaURI} onChange={handleInputChange} placeholder='Schema URI' className='text-xs' />
                </div>
                <div className='flex items-center'>
                    <Label htmlFor='baseURI' className='w-28 text-xs'>
                        Image URI
                    </Label>
                    <Input name='imageURI' id='imageURI' value={config.imageURI} onChange={handleInputChange} placeholder='Image URI' className='text-xs' />
                </div>
            </div>

            <div>
                <h3 className='font-bold'>Features</h3>
                {Object.values(Feature).map((feature) => (
                    <label key={feature} className='flex items-center'>
                        <input type='checkbox' checked={config.features?.includes(feature)} onChange={() => handleFeatureToggle(feature)} className='mr-2' />
                        {feature}
                    </label>
                ))}
            </div>

            <div className='flex flex-col gap-2.5 items-stretch justify-stretch'>
                <span className='form-label'>Data fields</span>
                <Reorder.Group
                    axis='y'
                    values={config?.fields || []}
                    onReorder={(newOrder: FieldConfig[]) => handleFieldSort(newOrder)}
                    className='flex flex-col gap-2'
                >
                    {config?.fields?.map((field) => (
                        <Field key={field._uid} field={field} setter={setConfig} />
                    ))}
                </Reorder.Group>
                <button
                    onClick={handleAddField}
                    className='p-3 text-sm transition-all border border-dashed border-gray-300 text-gray-400 font-medium rounded-md leading-none w-full'
                >
                    Add a new field
                </button>
            </div>

            <div>
                <h3 className='font-bold'>Fields</h3>
                {/*config.fields.map((field, index) => (
                    <div key={index} className='space-y-2 mt-2'>
                        <input
                            value={field.key}
                            onChange={(e) => handleFieldChange(index, { key: (e.target as HTMLInputElement).value })}
                            placeholder='Key'
                            className='w-full p-2 border rounded'
                        />
                        <select
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(index, { fieldType: (e.target as HTMLSelectElement).value })}
                            className='w-full p-2 border rounded'
                        >
                            {fieldTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <input
                            value={field.description}
                            onChange={(e) => handleFieldChange(index, { description: (e.target as HTMLInputElement).value })}
                            placeholder='Description'
                            className='w-full p-2 border rounded'
                        />
                        <select
                            value={field.functionConfig}
                            onChange={(e) => handleFieldChange(index, { functionConfig: (e.target as HTMLSelectElement).value as FunctionConfig })}
                            className='w-full p-2 border rounded'
                        >
                            {Object.values(FunctionConfig).map((config) => (
                                <option key={config} value={config}>
                                    {config}
                                </option>
                            ))}
                        </select>
                    </div>
                ))*/}
                <button onClick={handleAddField} className='mt-2 p-2 bg-blue-500 text-white rounded'>
                    Add Field
                </button>
            </div>
        </div>
    );
};

export default InputFields;
