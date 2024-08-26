import { Checkbox } from '@/wizard/primitives/checkbox';
import Icon from '@/wizard/primitives/icon';
import { Label } from '@/wizard/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/wizard/primitives/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useState } from 'react';
import { ContractConfig, Feature, FeatureConfig } from '@/types';
import { Badge } from '@/wizard/primitives/badge';
import _ from 'lodash';
import useStore, { useConfig } from '@/wizard/store';
import { nanoid } from 'nanoid';

const FeatureItem = memo(({ feature }: { feature: FeatureConfig }) => {
    const { updateContractConfig } = useStore();
    const contractConfig = useConfig()!;

    const featureEnums = _.map(feature.interfaces, 'interface');
    const primaryFeatures = feature.interfaces.filter((iface) => !iface.optional);
    const optionalFeatures = feature.interfaces.filter((iface) => iface.optional);
    const defaultFeature = primaryFeatures.find((iface) => iface.default)?.interface;

    const getChecked = () => !!_.intersection(contractConfig.features, featureEnums).length;
    const getPrimaryFeature = () => _.intersection(contractConfig.features, _.map(primaryFeatures, 'interface'))[0] ?? defaultFeature;
    const getOptionalFeatures = () => _.intersection(contractConfig.features, _.map(optionalFeatures, 'interface'));

    const [selected, setSelected] = useState<boolean>(getChecked());
    const [currentPrimaryFeature, setcurrentPrimaryFeature] = useState<Feature | undefined>(getPrimaryFeature());
    const [additionalFeatures, setadditionalFeatures] = useState<Feature[]>(getOptionalFeatures());

    const getInterfaceByValue = (value: string): Feature => {
        const enumEntries = Object.entries(Feature) as [Feature, string][];
        const found = enumEntries.find(([_, val]) => val === value)!;
        return found[0];
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
        const newFeatures = _.cloneDeep(contractConfig.features) ?? [];
        _.pull(newFeatures, ...featureEnums);
        if (selected) {
            newFeatures.push(...additionalFeatures);
            if (currentPrimaryFeature) newFeatures.push(currentPrimaryFeature);
        }
        const compare = _.difference(contractConfig.features, newFeatures);
        if (compare.length !== newFeatures.length) {
            updateContractConfig({
                ...contractConfig,
                features: newFeatures,
            });
        }
    }, [selected, currentPrimaryFeature, additionalFeatures]);

    const checkAutoToggle = useCallback(() => {
        if (feature.autoToggle && feature['validator']) {
            if (feature.validator({ ...contractConfig }) && !selected) {
                setSelected(true);
            } else if (!feature.validator({ ...contractConfig }) && selected) {
                setSelected(false);
            }
        }
    }, [contractConfig, selected]);

    useEffect(() => {
        checkAutoToggle();
    }, [contractConfig]);

    const _featureUID = nanoid(10);

    return (
        <div
            data-disabled={feature.validator && !feature.validator({ ...contractConfig })}
            className={`dotted relative bg-white rounded border border-black data-[disabled=true]:border-muted-foreground data-[disabled=true]:text-muted-foreground shadow text-sm transition-all font-medium leading-none`}
        >
            <div className={`relative flex w-full items-center`}>
                <label htmlFor={_featureUID} className='cursor-pointer flex gap-4 grow text-left p-3 pr-4 disabled:cursor-auto'>
                    <div className=''>
                        <Checkbox
                            id={_featureUID}
                            disabled={feature.autoToggle || (feature.validator ? !feature.validator({ ...contractConfig }) : false)}
                            checked={selected}
                            onCheckedChange={(checked) => setSelected(!!checked)}
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
                                                    checked={additionalFeatures.includes(iface.interface)}
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
