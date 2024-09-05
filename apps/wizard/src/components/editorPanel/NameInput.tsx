import _ from 'lodash';
import { memo, useState } from 'react';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
import useStore, { Store } from '../../store';

const NameInput = memo(() => {
    const { contractsConfig, updateContractConfig } = useStore();
    const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);
    const [valid, setValid] = useState<boolean>(true);

    const validName = (name: string) => {
        const names = _.map(contractsConfig, 'name');
        if (names.filter((n) => n == name).length > 0) {
            return false;
        }
        return true;
    };

    const handleNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (!validName(target.value)) {
            setValid(false);
            return false;
        } else {
            setValid(true);
            updateContractConfig({
                ...contractConfig,
                name: target.value,
            });
        }
    };

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateContractConfig({
            ...contractConfig,
            [target.name]: target.value,
        });
    };

    return (
        <div>
            <div className='grid grid-cols-[2fr_1fr]'>
                <Label htmlFor='contract'>Contract name</Label>
                <Label htmlFor='symbol'>Contract symbol</Label>
            </div>
            <div className='grid grid-cols-[2fr_1fr]'>
                <Input
                    name='contract'
                    id='contract'
                    defaultValue={contractConfig.name}
                    onChange={handleNameChange}
                    placeholder='Contract name'
                    className={`rounded-r-none focus:z-10 ${valid ? '' : '!border-destructive !ring-destructive z-10'}`}
                />
                <Input
                    name='symbol'
                    id='symbol'
                    defaultValue={contractConfig.symbol}
                    onChange={handleInputChange}
                    placeholder='Symbol'
                    className='rounded-l-none -ml-[1px] focus:z-10'
                />
            </div>
            {!valid && <p className='text-destructive text-sm font-medium mt-1'>Contract name already exists.</p>}
        </div>
    );
});

export default NameInput;
