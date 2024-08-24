import Icon from '@wizard/primitives/icon';
import { FieldConfig, PatchworkEnum } from '../../types';
import { Reorder } from 'framer-motion';
import { EnumEntry } from './Field.EnumEntry';
import useStore from '@wizard/store';

const EnumList = ({ field }: { field: FieldConfig }) => {
    const { contractConfig, updateContractConfig } = useStore();
    const handleEnumSort = (newOrder: PatchworkEnum[]) => {
        updateContractConfig({
            ...contractConfig,
            fields: contractConfig.fields.map((_f) => (_f._uid === field._uid ? { ..._f, values: newOrder } : _f)),
        });
    };
    const handleEnumUpdate = ({ uid, value }: PatchworkEnum) => {
        updateContractConfig({
            ...contractConfig,
            fields: contractConfig.fields.map((_f) =>
                _f._uid === field._uid ? { ..._f, values: _f.values?.map((_v) => (_v.uid === uid ? { ..._v, value } : _v)) } : _f,
            ),
        });
    };
    const handleEnumDelete = (uid: string) => {
        updateContractConfig({
            ...contractConfig,
            fields: contractConfig.fields.map((_f) => (_f._uid === field._uid ? { ..._f, values: _f.values?.filter((_v) => _v.uid !== uid) } : _f)),
        });
    };
    const handleAddNewEnum = () => {
        const newEnum = {
            uid: 'enum-' + Math.round(Math.random() * 100000),
            value: '',
        };
        updateContractConfig({
            ...contractConfig,
            fields: contractConfig.fields.map((_f) => (_f._uid === field._uid ? { ..._f, values: _f.values ? [..._f.values, newEnum] : [newEnum] } : _f)),
        });
    };

    return (
        <div className='border-t mt-1.5 pt-3 grid grid-cols-[1fr_2.5fr] gap-1 items-top'>
            <div className='form-label py-2.5 flex gap-2'>
                <Icon icon='fa-list-ol' className='shrink' />
                Enum set
            </div>
            <div>
                {!!field.values?.length && (
                    <Reorder.Group
                        axis='y'
                        values={field.values || []}
                        onReorder={(newOrder) => handleEnumSort(newOrder)}
                        className='form-input p-0 gap-0 flex-col relative'
                    >
                        <div className='w-full'>
                            {field.values?.map((item, i) => {
                                const isUnique = field.values?.filter((_v) => _v.value === item.value).length === 1;
                                return (
                                    <EnumEntry
                                        item={item}
                                        setter={handleEnumUpdate}
                                        number={isUnique ? i : 'MUST BE UNIQUE'}
                                        remover={handleEnumDelete}
                                        key={item.uid}
                                    />
                                );
                            })}
                        </div>
                        <div className='absolute bottom-0 h-1 w-full dotted' />
                    </Reorder.Group>
                )}
                <button className='text-[12px] p-1.5 border bg-black text-white rounded mt-2 first:mt-0.5' onClick={() => handleAddNewEnum()}>
                    <Icon icon='fa-plus' />
                </button>
            </div>
        </div>
    );
};

export default EnumList;
