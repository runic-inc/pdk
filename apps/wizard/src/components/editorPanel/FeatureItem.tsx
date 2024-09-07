import { Feature } from '@patchworkdev/common/types';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { memo, useCallback, useEffect, useState } from 'react';
import { Badge } from '../../primitives/badge';
import { Checkbox } from '../../primitives/checkbox';
import Icon from '../../primitives/icon';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
import { RadioGroup, RadioGroupItem } from '../../primitives/radio-group';
import useStore, { Store } from '../../store';
import { FeatureConfig, FeatureOption } from '../../types';

const FeatureItem = memo(({ featureGroup }: { featureGroup: FeatureConfig }) => {
    const { updateContractFeatures, removeFragmentFromContracts } = useStore();
    const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);
    if (!contractConfig) return null;

    const featureEnums = _.map(featureGroup.featureSet, 'key');

    // Break out list of available features
    const primaryFeatures = featureGroup.featureSet.filter((item) => !item.optional);
    const optionalFeatures = featureGroup.featureSet.filter((item) => item.optional);
    const defaultFeature = primaryFeatures.find((item) => item.default)?.key ?? primaryFeatures[0].key;

    // Getters used to instantiate initial state of the UI
    const getChecked = useCallback(() => !!_.intersection(contractConfig.features, featureEnums).length, [contractConfig]);
    const getPrimaryFeature = useCallback(() => _.intersection(contractConfig.features, _.map(primaryFeatures, 'key'))[0] ?? defaultFeature, [contractConfig]);
    const getOptionalFeatures = useCallback(() => _.intersection(contractConfig.features, _.map(optionalFeatures, 'key')), [contractConfig]);

    const [selected, setSelected] = useState<boolean>(getChecked());
    const [currentPrimaryFeature, setCurrentPrimaryFeature] = useState<Feature | undefined>(getPrimaryFeature());
    const [additionalFeatures, setadditionalFeatures] = useState<Feature[]>(getOptionalFeatures());

    const getInterfaceByValue = (value: string): Feature => {
        const enumEntries = Object.entries(Feature) as [Feature, string][];
        const found = enumEntries.find(([_, val]) => val === value)!;
        return found[0];
    };

    const handlePrimaryInterfaceToggle = (value: string) => {
        const featureToToggle = getInterfaceByValue(value);
        setCurrentPrimaryFeature(featureToToggle);
    };

    const handleOptionalInterfaceToggle = (value: string) => {
        const featureToToggle = getInterfaceByValue(value);
        setadditionalFeatures((prev) => {
            return _.xor(prev, [featureToToggle]);
        });
    };

    const checkAutoToggle = useCallback(() => {
        if (featureGroup.autoToggle && featureGroup['validator']) {
            if (featureGroup.validator({ ...contractConfig }) && !selected) {
                setSelected(true);
            } else if (!featureGroup.validator({ ...contractConfig }) && selected) {
                setSelected(false);
            }
        }
    }, [contractConfig, selected]);

    useEffect(() => {
        checkAutoToggle();
    }, [contractConfig]);

    useEffect(() => {
        const features = [];
        // cull and rebuild feature list
        if (selected) {
            features.push(...additionalFeatures);
            if (currentPrimaryFeature) features.push(currentPrimaryFeature);
        }
        // only update features if they don't match
        // prevents unnecessary dispatches
        const _int = _.intersection(contractConfig.features, featureEnums);
        const _diffLeft = _.difference(features, _int);
        const _diffRight = _.difference(_int, features);
        if (_diffLeft.length > 0 || _diffRight.length > 0) {
            updateContractFeatures(features, featureEnums);
        }
    }, [selected, currentPrimaryFeature, additionalFeatures]);

    const handleMainSelect = (checked: boolean) => {
        setSelected(!!checked);
        if (featureGroup.name === 'Assignable' && !checked) {
            removeFragmentFromContracts(contractConfig._uid);
        }
    };

    const _featureUID = nanoid(10);

    return (
        <div
            data-disabled={featureGroup.validator && !featureGroup.validator({ ...contractConfig })}
            className={`dotted relative bg-background rounded border border-border text-foreground data-[disabled=true]:border-muted-foreground data-[disabled=true]:text-muted-foreground shadow text-sm transition-all font-medium leading-none`}
        >
            <div className={`relative flex w-full items-center`}>
                <label htmlFor={_featureUID} className='cursor-pointer flex gap-4 grow text-left p-3 pr-4 disabled:cursor-auto'>
                    <div className=''>
                        <Checkbox
                            id={_featureUID}
                            disabled={featureGroup.autoToggle || (featureGroup.validator ? !featureGroup.validator({ ...contractConfig }) : false)}
                            checked={selected}
                            onCheckedChange={handleMainSelect}
                        />
                    </div>
                    <div className='grow flex flex-col gap-1.5'>
                        <div className='flex gap-1.5 pt-[1.5px]'>
                            <Icon icon={featureGroup.icon} />
                            <span>{featureGroup.name}</span>
                        </div>
                        <div>
                            <p className='text-muted-foreground text-[12px] font-normal leading-4'>
                                {featureGroup.description} <span className='underline decoration-dotted'>{featureGroup.validatorMessage}</span>
                            </p>
                        </div>
                    </div>
                </label>
            </div>
            <AnimatePresence>
                {selected && (featureGroup.options.length || featureGroup.featureSet.length > 1) && (
                    <motion.div
                        className='bg-muted/50 rounded-b border-t border-muted-foreground/50 p-3 pb-4 dotted flex flex-col gap-4'
                        key={'feature_' + featureGroup.name}
                    >
                        {primaryFeatures.length > 1 && (
                            <RadioGroup defaultValue={currentPrimaryFeature} onValueChange={(value) => handlePrimaryInterfaceToggle(value)}>
                                {primaryFeatures.map((featItem) => (
                                    <div className='flex gap-4 items-start' key={featItem.key}>
                                        <div className='pt-1'>
                                            <RadioGroupItem
                                                value={featItem.key}
                                                id={featItem.key}
                                                disabled={featItem.validator ? !featItem.validator(contractConfig) : false}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={featItem.key} className='inline-flex items-center gap-2'>
                                                {featItem.label}
                                                {featItem.default && <Badge>Default</Badge>}
                                            </Label>
                                            <p className='font-normal text-sm text-muted-foreground'>
                                                {featItem.description} <span className='underline decoration-dotted'>{featItem.validatorMessage}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        {optionalFeatures.length > 0 && (
                            <div>
                                <div className='flex flex-col gap-2'>
                                    {optionalFeatures.map((iface) => (
                                        <div className='flex gap-4 items-start' key={iface.key}>
                                            <div className='pt-1'>
                                                <Checkbox
                                                    id={iface.key}
                                                    onCheckedChange={() => handleOptionalInterfaceToggle(iface.key)}
                                                    checked={additionalFeatures.includes(iface.key)}
                                                    disabled={iface.autoToggle || (iface.validator ? !iface.validator(contractConfig) : false)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={iface.key} className='inline-flex items-center gap-2'>
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
                        {featureGroup.options.length > 0 && (
                            <div>
                                <div className='flex flex-col gap-2'>
                                    {featureGroup.options.map((configItem) => (
                                        <FeatureOptionItem key={configItem.key} configItem={configItem} />
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

const FeatureOptionItem = memo(({ configItem }: { configItem: FeatureOption }) => {
    const { updateContractConfig } = useStore();
    const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);
    if (!contractConfig) return null;

    const handleUpdate = (value: string) => {
        updateContractConfig({
            ...contractConfig,
            [configItem.key]: value,
        });
    };

    return (
        <>
            <div className='flex gap-4 items-start' key={configItem.key}>
                {configItem.type === 'input' && (
                    <div>
                        <Label className='pt-1'>{configItem.label}</Label>
                        <Input
                            placeholder={configItem.placeholder}
                            defaultValue={contractConfig[configItem.key as 'mintFee' | 'assignFee' | 'patchFee']}
                            onChange={(e) => handleUpdate(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </>
    );
});
