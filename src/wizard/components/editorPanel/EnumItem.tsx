import { Reorder, useDragControls } from 'framer-motion';
import { boxShadow } from 'tailwindcss/defaultTheme';
import { PatchworkEnum } from '@/types';
import Icon from '@/wizard/primitives/icon';
import def from 'ajv/dist/vocabularies/discriminator';

const EnumItem = ({
    item,
    setter,
    remover,
    number,
}: {
    item: PatchworkEnum;
    setter: (item: PatchworkEnum) => void;
    remover: (uid: string) => void;
    number: number | string;
}) => {
    const fieldDrag = useDragControls();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setter({ ...item, value: e.target.value });
    };

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            initial={{ scale: 1, boxShadow: 'none', borderBottomWidth: '1px', borderRadius: '0' }}
            whileDrag={{ scale: 1.075, boxShadow: boxShadow.lg, borderWidth: '1px', borderRadius: '2px' }}
            dragControls={fieldDrag}
            className='relative w-full h-fit !border-b border-black !rounded-non bg-white box-border [&:last-child]:!border-b-0 [&:first-child]:!rounded-t [&:last-child]:!rounded-b'
        >
            <input
                value={item.value}
                className={`form-input rounded border-none shadow-none pl-6 ${typeof number !== 'number' ? 'text-red-600' : ''}`}
                onChange={handleChange}
            />

            <button onPointerDown={(e) => fieldDrag.start(e)} className='cursor-ns-resize flex top-0 bottom-0 items-center absolute left-0 w-6 justify-center'>
                <Icon icon='fa-grip-dots-vertical' />
            </button>
            <button className='absolute right-0 top-0 bottom-[1px] w-8 flex items-center justify-center' onClick={() => remover(item.uid)}>
                <Icon icon='fa-trash' />
            </button>
            <span
                className={`absolute right-8 top-0 h-full flex items-center shrink font-mono text-[10px] font-medium text-right ${
                    typeof number !== 'number' ? 'text-red-600' : ''
                }`}
            >
                {number}
            </span>
        </Reorder.Item>
    );
};

export default EnumItem;
