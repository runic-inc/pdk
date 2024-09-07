import { Feature } from '@patchworkdev/common/types';
import { memo } from 'react';
import { Badge } from '../../primitives/badge';
import Icon from '../../primitives/icon';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
import MultipleSelector from '../../primitives/multiple-selector';
import useStore, { Store } from '../../store';

const FeatureSettings = memo(() => {
    const { updateContractConfig, deleteContract, contractsConfig, getAssignedFrom, updateContractFragments } = useStore();
    const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);

    const handleFeatureOption = (key: 'mintFee' | 'assignFee' | 'patchFee', value: string) => {
        updateContractConfig({
            ...contractConfig,
            [key]: value,
        });
    };

    return (
        <div className='after:content-[""] has-[div]:after:content-[""] after:text-sm after:text-muted-foreground'>
            {contractConfig.features.includes(Feature.MINTABLE) && (
                <div className='grid grid-cols-[1fr_3fr] mb-3'>
                    <div>
                        <Badge>
                            <Icon icon='fa-plus mr-1' />
                            Mintable
                        </Badge>
                    </div>
                    <div>
                        <Label htmlFor='mintFee'>Mint fee</Label>
                        <Input
                            name='mintFee'
                            id='mintFee'
                            onChange={(e) => handleFeatureOption('mintFee', e.target.value)}
                            value={contractConfig.mintFee}
                            placeholder='Defaults to 0 (free)'
                        />
                        <p data-description className='text-sm text-muted-foreground mt-2'>
                            The fee (in ETH) to charge for mints.
                        </p>
                    </div>
                </div>
            )}
            {contractConfig.features.includes(Feature.LITEREF) && (
                <div className='grid grid-cols-[1fr_3fr] mb-4'>
                    <div className='row-span-2'>
                        <Badge>
                            <Icon icon='fa-square-dashed mr-1' />
                            Assignee
                        </Badge>
                    </div>

                    <div>
                        <Label htmlFor='mintFee'>Assignment source</Label>
                        <MultipleSelector
                            hideClearAllButton
                            hidePlaceholderWhenSelected
                            value={getAssignedFrom().map((contract) => {
                                return {
                                    value: contract.uid,
                                    label: contract.name,
                                };
                            })}
                            onChange={(values) => updateContractFragments(values.map((value) => value.value))}
                            defaultOptions={Object.values(contractsConfig)
                                .filter(
                                    (contract) =>
                                        contract._uid !== contractConfig._uid &&
                                        (contract.features.includes(Feature.FRAGMENTSINGLE) || contract.features.includes(Feature.FRAGMENTMULTI)),
                                )
                                .map((contract) => ({
                                    label: contract.name,
                                    value: contract._uid,
                                }))}
                            placeholder='Select contract(s)'
                            badgeClassName='text-sm font-normal p-0.5 px-1.5'
                        ></MultipleSelector>
                        <p data-description className='text-sm text-muted-foreground mt-2'>
                            Accept LiteRef assignments from the specified contract.
                        </p>
                    </div>

                    <div className='mt-2'>
                        <Label htmlFor='assignFee'>Assignment fee</Label>
                        <Input
                            name='assignFee'
                            id='assignFee'
                            onChange={(e) => handleFeatureOption('assignFee', e.target.value)}
                            value={contractConfig.assignFee}
                            placeholder='Defaults to 0 (free)'
                        />
                        <p data-description className='text-sm text-muted-foreground mt-2'>
                            The fee (in ETH) to charge for each assignment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
});

export default FeatureSettings;
