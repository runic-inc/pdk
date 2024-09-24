import { Reorder } from 'framer-motion';
import { useEffect } from 'react';
import { boxShadow } from 'tailwindcss/defaultTheme';
import { Button } from '../primitives/button';
import Icon from '../primitives/icon';
import useStore from '../store';

const ContractList = () => {
    const { contractsConfig, setEditor, editor, addNewContract, contractsOrder, updateContractsOrder } = useStore();

    useEffect(() => {
        console.log(contractsConfig);
    }, [contractsConfig]);

    const handleContractSort = (newOrder: string[]) => {
        updateContractsOrder(newOrder);
    };

    return (
        <div className='flex gap-[1px] text-sm ring-1 ring-muted-border relative rounded [&>:first-child]:!rounded-l [&>:first-child>:first-child>:first-child]:!rounded-l [&>:last-child]:rounded-r'>
            <Reorder.Group values={contractsOrder} onReorder={(newOrder) => handleContractSort(newOrder)} axis='x' className='flex gap-[1px]'>
                {contractsOrder.map((key, i) => (
                    <Reorder.Item
                        key={key}
                        value={key}
                        className={`flex relative ${key == editor ? '!z-[2]' : 'z-0'}`}
                        initial={{ boxShadow: 'none', borderRadius: '0', z: key == editor ? 2 : 1 }}
                        whileDrag={{ boxShadow: boxShadow.lg, borderRadius: '2px', z: 500 }}
                    >
                        <div
                            onClick={() => setEditor(key)}
                            className={`px-3 ring-1 flex gap-2 items-center font-medium cursor-pointer relative z-[1] ${
                                editor == key ? 'bg-background ring-border text-foreground dotted' : 'bg-muted ring-muted-border text-muted-foreground'
                            }`}
                        >
                            <Icon icon='fa-file' />
                            {contractsConfig[key].name}
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <Button
                variant={'ghost'}
                className='rounded-none ring-1 ring-muted-border bg-muted gap-2 text-muted-foreground shadow-none px-4'
                onClick={() => {
                    const newId = addNewContract();
                    setEditor(newId);
                }}
            >
                <Icon icon='fa-plus' />
                {contractsOrder.length == 0 ? 'Create a new contract' : ''}
            </Button>
        </div>
    );
};

export default ContractList;
