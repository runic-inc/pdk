import { Button } from '../primitives/button';
import Icon from '../primitives/icon';
import useStore from '../store';

const ContractList = () => {
    const { contractsConfig, setEditor, editor, addNewContract } = useStore();
    return (
        <div className='flex gap-0 text-sm border border-muted-foreground rounded [&>:first-child]:rounded-l [&>:last-child]:rounded-r'>
            {contractsConfig.map((contract) => (
                <>
                    <div
                        key={contract._uid}
                        onClick={() => setEditor(contract._uid)}
                        className={`px-4 ring-1 flex items-center font-medium cursor-pointer dottedd z-[1] ${
                            editor == contract._uid ? 'bg-background ring-foreground' : 'bg-muted ring-transparent text-muted-foreground'
                        }`}
                    >
                        {contract.name}
                    </div>
                    <div className='w-[1px] h-full bg-muted-foreground z-[0]' />
                </>
            ))}
            <Button variant={'ghost'} className='rounded-none bg-muted gap-2 text-muted-foreground shadow-none px-4' onClick={() => addNewContract()}>
                <Icon icon='fa-plus' />
            </Button>
        </div>
    );
};

export default ContractList;
