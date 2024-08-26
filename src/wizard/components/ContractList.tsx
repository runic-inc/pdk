import { Button } from '../primitives/button';
import Icon from '../primitives/icon';
import useStore from '../store';
import { Reorder } from 'framer-motion';
import _ from 'lodash';
import { boxShadow } from 'tailwindcss/defaultTheme';
import { UContractConfig } from '../types';

const ContractList = () => {
    const { contractsConfig, setEditor, editor, addNewContract, updateContractsConfig } = useStore();

    const handleContractSort = (newOrder: UContractConfig[]) => {
        updateContractsConfig(newOrder);
    };

    return (
        <div className='flex gap-[1px] text-sm ring-1 ring-muted-foreground relative rounded [&>:first-child]:!rounded-l [&>:first-child>:first-child>:first-child]:!rounded-l [&>:last-child]:rounded-r'>
            <Reorder.Group values={contractsConfig} onReorder={(newOrder) => handleContractSort(newOrder)} axis='x' className='flex gap-[1px]'>
                {contractsConfig.map((contract, i) => (
                    <Reorder.Item
                        key={contract._uid}
                        value={contract}
                        className={`flex relative ${contract._uid == editor ? '!z-[2]' : 'z-0'}`}
                        initial={{ boxShadow: 'none', borderRadius: '0', z: contract._uid == editor ? 2 : 1 }}
                        whileDrag={{ boxShadow: boxShadow.lg, borderRadius: '2px', z: 500 }}
                    >
                        <div
                            onClick={() => setEditor(contract._uid)}
                            className={`px-3 ring-1 flex gap-2 items-center font-medium cursor-pointer relative z-[1] ${
                                editor == contract._uid ? 'bg-background ring-foreground dotted' : 'bg-muted ring-muted-foreground text-muted-foreground'
                            }`}
                        >
                            <Icon icon='fa-file' />
                            {contract.name}
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <Button
                variant={'ghost'}
                className='rounded-none ring-1 ring-muted-foreground bg-muted gap-2 text-muted-foreground shadow-none px-4'
                onClick={() => {
                    const newId = addNewContract();
                    setEditor(newId);
                }}
            >
                <Icon icon='fa-plus' />
                {contractsConfig.length == 0 ? 'Create a new contract' : ''}
            </Button>
        </div>
    );
};

export default ContractList;
