import IconExpression from '../assets/IconExpression';
import IconClothing from '../assets/IconClothing';
import IconHair from '../assets/IconHair';
import IconAccessory from '../assets/IconAccessory';
import IconBody from '../assets/IconBody';

export function TraitBar() {
    return (
        <div className='grid grid-cols-5 gap-2 text-sm text-black font-medium w-full'>
            <button className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
                <IconBody className='w-6 max-h-5' />
            </button>
            <button className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
                <IconClothing className='w-6 max-h-5' />
            </button>
            <button className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
                <IconExpression className='w-6 max-h-5' />
            </button>
            <button className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
                <IconHair className='w-6 max-h-5' />
            </button>
            <button className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
                <IconAccessory className='w-6 max-h-5' />
            </button>
        </div>
    );
}
