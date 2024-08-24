import { Checkbox } from '@wizard/primitives/checkbox';
import Icon from '@wizard/primitives/icon';
import { Label } from '@wizard/primitives/label';
import { RadioGroup, RadioGroupItem } from '@wizard/primitives/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { Feature, FeatureConfig } from '../../types';
import { Badge } from '@wizard/primitives/badge';
import _ from 'lodash';
import useStore from '@wizard/store';

const FeatureEntry = memo(({ feature }: { feature: FeatureConfig }) => {
    const { contractConfig, updateContractConfig } = useStore();
    const interfaceEnums = feature.interfaces.map((iface) => iface.interface);
    const primaryInterfaces = feature.interfaces.filter((iface) => !iface.optional);
    const optionalInterfaces = feature.interfaces.filter((iface) => iface.optional);
    const defaultInterface = primaryInterfaces.find((iface) => iface.default)?.interface ?? feature.interfaces[0].interface;

    const [selected, setSelected] = useState<boolean>(_.intersection(contractConfig.features ?? [], interfaceEnums).length > 0);
    const [currentInterface, setCurrentInterface] = useState<Feature>(defaultInterface);
    const [additionalInterfaces, setAdditionalInterfaces] = useState<Feature[]>([]);

    const getInterfaceByValue = (value: string): Feature => {
        const enumEntries = Object.entries(Feature) as [Feature, string][];
        const found = enumEntries.find(([_, val]) => val === value)!;
        return found[0];
    };

    const handleFeatureToggle = (checked: boolean) => {
        setSelected(checked);
    };

    const handlePrimaryInterfaceToggle = (value: string) => {
        const interfaceToToggle = getInterfaceByValue(value);
        setCurrentInterface(interfaceToToggle);
    };

    const handleOptionalInterfaceToggle = (value: string) => {
        const interfaceToToggle = getInterfaceByValue(value);
        setAdditionalInterfaces((prev) => {
            return _.without(prev, interfaceToToggle);
        });
    };

    useEffect(() => {
        const contractFeatures = contractConfig.features ?? [];
        _.pull(contractFeatures, ...interfaceEnums);
        if (selected) {
            contractFeatures.push(...additionalInterfaces, currentInterface);
        }
        updateContractConfig({
            ...contractConfig,
            features: contractFeatures,
        });
    }, [selected, currentInterface, additionalInterfaces]);

    return (
        <div className={`dotted relative bg-white rounded border border-black shadow text-sm transition-all font-medium leading-none`}>
            <div className={`relative flex w-full items-center`}>
                <label className='cursor-pointer flex gap-4 grow text-left p-3 pr-4 disabled:cursor-auto'>
                    <div className=''>
                        <Checkbox defaultChecked={selected} onCheckedChange={(checked) => handleFeatureToggle(!!checked)} />
                    </div>
                    <div className='grow flex flex-col gap-1.5'>
                        <div className='flex gap-1.5 pt-[1.5px]'>
                            <Icon icon={feature.icon} />
                            <span>{feature.name}</span>
                        </div>
                        <div>
                            <p className='text-muted-foreground text-[12px] font-normal leading-4'>{feature.description}</p>
                        </div>
                    </div>
                </label>
            </div>
            <AnimatePresence>
                {selected && (feature.options.length || feature.interfaces.length > 1) && (
                    <motion.div
                        className='bg-muted/50 rounded-b border-t border-muted-foreground/50 p-3 pb-4 dotted flex flex-col gap-4'
                        key={'feature_' + feature.name}
                    >
                        {primaryInterfaces.length > 1 && (
                            <RadioGroup defaultValue={currentInterface} onValueChange={(value) => handlePrimaryInterfaceToggle(value)}>
                                {primaryInterfaces.map((iface) => (
                                    <div className='flex gap-4 items-start' key={iface.interface}>
                                        <div className='pt-1'>
                                            <RadioGroupItem value={iface.interface} id={iface.interface} />
                                        </div>
                                        <div>
                                            <Label htmlFor={iface.interface} className='inline-flex items-center gap-2'>
                                                {iface.label}
                                                {iface.default && <Badge>Default</Badge>}
                                            </Label>
                                            <p className='font-normal text-sm text-muted-foreground'>{iface.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        {optionalInterfaces.length > 0 && (
                            <div>
                                <p className='text-sm font-medium'>Options</p>
                                <div className='flex flex-col gap-2 pt-2'>
                                    {optionalInterfaces.map((iface) => (
                                        <div className='flex gap-4 items-start' key={iface.interface}>
                                            <div className='pt-1'>
                                                <Checkbox
                                                    id={iface.interface}
                                                    onCheckedChange={(checked) => handleOptionalInterfaceToggle(iface.interface)}
                                                    defaultChecked={additionalInterfaces.includes(iface.interface)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={iface.interface} className='inline-flex items-center gap-2'>
                                                    {iface.label}
                                                </Label>
                                                <p className='font-normal text-sm text-muted-foreground'>{iface.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default FeatureEntry;
