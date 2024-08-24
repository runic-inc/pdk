import { Checkbox } from '@/wizard/primitives/checkbox';
import Icon from '@/wizard/primitives/icon';
import { Label } from '@/wizard/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/wizard/primitives/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useState } from 'react';
import { Feature, FeatureConfig } from '@/types';
import { Badge } from '@/wizard/primitives/badge';
import _ from 'lodash';
import useStore from '@/wizard/store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/wizard/primitives/tooltip';
import { nanoid } from 'nanoid';

const FeatureItem = memo(({ feature }: { feature: FeatureConfig }) => {
    const { contractConfig, updateContractConfig } = useStore();
    const featureEnums = feature.interfaces.map((iface) => iface.interface);
    const primaryFeatures = feature.interfaces.filter((iface) => !iface.optional);
    const optionalFeatures = feature.interfaces.filter((iface) => iface.optional);

    const defaultFeature = primaryFeatures.find((iface) => iface.default)?.interface;

    const [selected, setSelected] = useState<boolean>(_.intersection(contractConfig.features ?? [], featureEnums).length > 0);
    const [currentPrimaryFeature, setcurrentPrimaryFeature] = useState<Feature | undefined>(defaultFeature);
    const [additionalFeatures, setadditionalFeatures] = useState<Feature[]>([]);

    const getInterfaceByValue = (value: string): Feature => {
        const enumEntries = Object.entries(Feature) as [Feature, string][];
        const found = enumEntries.find(([_, val]) => val === value)!;
        return found[0];
    };

    const handleFeatureToggle = (checked: boolean) => {
        setSelected(checked);
    };

    const handlePrimaryInterfaceToggle = (value: string) => {
        const featureToToggle = getInterfaceByValue(value);
        setcurrentPrimaryFeature(featureToToggle);
    };

    const handleOptionalInterfaceToggle = (value: string) => {
        const featureToToggle = getInterfaceByValue(value);
        setadditionalFeatures((prev) => {
            return _.xor(prev, [featureToToggle]);
        });
    };

    useEffect(() => {
        if (feature.autoToggle && feature.validator) {
            if (feature.validator(contractConfig)) {
                setSelected(true);
            } else {
                setSelected(false);
            }
        }
    }, [contractConfig]);

    const _featureUID = nanoid(10);

    useEffect(() => {
        const contractFeatures = contractConfig.features ?? [];
        _.pull(contractFeatures, ...featureEnums);
        if (selected) {
            contractFeatures.push(...additionalFeatures);
            if (currentPrimaryFeature) contractFeatures.push(currentPrimaryFeature);
        }
        updateContractConfig({
            ...contractConfig,
            features: contractFeatures,
        });
    }, [selected, currentPrimaryFeature, additionalFeatures]);

    return (
        <div
            data-disabled={feature.validator && !feature.validator(contractConfig)}
            className={`dotted relative bg-white rounded border border-black data-[disabled=true]:border-muted-foreground data-[disabled=true]:text-muted-foreground shadow text-sm transition-all font-medium leading-none`}
        >
            <div className={`relative flex w-full items-center`}>
                <label htmlFor={_featureUID} className='cursor-pointer flex gap-4 grow text-left p-3 pr-4 disabled:cursor-auto'>
                    <div className=''>
                        <Checkbox
                            id={_featureUID}
                            disabled={feature.autoToggle || (feature.validator ? !feature.validator(contractConfig) : false)}
                            checked={selected}
                            onCheckedChange={(checked) => handleFeatureToggle(!!checked)}
                        />
                    </div>
                    <div className='grow flex flex-col gap-1.5'>
                        <div className='flex gap-1.5 pt-[1.5px]'>
                            <Icon icon={feature.icon} />
                            <span>{feature.name}</span>
                        </div>
                        <div>
                            <p className='text-muted-foreground text-[12px] font-normal leading-4'>
                                {feature.description} <span className='underline decoration-dotted'>{feature.validatorMessage}</span>
                            </p>
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
                        {primaryFeatures.length > 1 && (
                            <RadioGroup defaultValue={currentPrimaryFeature} onValueChange={(value) => handlePrimaryInterfaceToggle(value)}>
                                {primaryFeatures.map((iface) => (
                                    <div className='flex gap-4 items-start' key={iface.interface}>
                                        <div className='pt-1'>
                                            <RadioGroupItem
                                                value={iface.interface}
                                                id={iface.interface}
                                                disabled={iface.validator ? !iface.validator(contractConfig) : false}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={iface.interface} className='inline-flex items-center gap-2'>
                                                {iface.label}
                                                {iface.default && <Badge>Default</Badge>}
                                            </Label>
                                            <p className='font-normal text-sm text-muted-foreground'>
                                                {iface.description} <span className='underline decoration-dotted'>{iface.validatorMessage}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        {optionalFeatures.length > 0 && (
                            <div>
                                <p className='text-sm font-medium'>Options</p>
                                <div className='flex flex-col gap-2 pt-2'>
                                    {optionalFeatures.map((iface) => (
                                        <div className='flex gap-4 items-start' key={iface.interface}>
                                            <div className='pt-1'>
                                                <Checkbox
                                                    id={iface.interface}
                                                    onCheckedChange={() => handleOptionalInterfaceToggle(iface.interface)}
                                                    defaultChecked={additionalFeatures.includes(iface.interface)}
                                                    disabled={iface.autoToggle || (iface.validator ? !iface.validator(contractConfig) : false)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={iface.interface} className='inline-flex items-center gap-2'>
                                                    {iface.label}
                                                </Label>
                                                <p className='font-normal text-sm text-muted-foreground'>
                                                    {iface.description} <span className='underline decoration-dotted'>{iface.validatorMessage}</span>
                                                </p>
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

export default FeatureItem;
