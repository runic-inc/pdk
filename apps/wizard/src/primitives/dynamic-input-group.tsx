import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button } from './button';
import { Input } from './input';

interface DynamicInputGroupProps {
    onChange: (values: string[]) => void;
    defaultValues: string[];
    placeholder?: string;
}

const DynamicInputGroup: React.FC<DynamicInputGroupProps> = ({ onChange, placeholder, defaultValues }) => {
    const [inputValues, setInputValues] = useState<string[]>(defaultValues);

    const handleInputChange = (index: number, value: string) => {
        const updatedValues = [...inputValues];
        updatedValues[index] = value;
        setInputValues(updatedValues);
    };

    const addInput = () => {
        setInputValues([...inputValues, '']);
    };

    const removeInput = (index: number) => {
        const updatedValues = inputValues.filter((_, i) => i !== index);
        setInputValues(updatedValues);
    };

    useEffect(() => {
        onChange(inputValues);
    }, [inputValues]);

    return (
        <div className='flex flex-col gap-1'>
            {inputValues.map((value, index) => (
                <div key={index} className='flex gap-1'>
                    <Input
                        type='text'
                        value={value}
                        placeholder={placeholder}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                    />
                    {index === inputValues.length - 1 ? (
                        <Button variant={'ghost'} size={'icon'} onClick={addInput} className='h-auto'>
                            +
                        </Button>
                    ) : (
                        <Button variant={'ghost'} size={'icon'} onClick={() => removeInput(index)} className='h-auto'>
                            -
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DynamicInputGroup;
