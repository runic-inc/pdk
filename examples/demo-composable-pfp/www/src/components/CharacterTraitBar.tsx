import IconExpression from '../assets/IconExpression';
import IconClothing from '../assets/IconClothing';
import IconHair from '../assets/IconHair';
import IconAccessory from '../assets/IconAccessory';
import IconBody from '../assets/IconBody';
import { CharacterTraits, TraitExtended } from '@/types';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { TraitType } from '#/assets/traits';
import filterTraits from '@/utils/filterTraits';
import { twMerge } from 'tailwind-merge';
import isSelected from '@/utils/isSelected';
import { HexColorPicker } from 'react-colorful';
import IconPaint from '@/assets/IconPaint';

interface TraitGroupProps {
	traits: CharacterTraits | undefined;
	selectedTraits: TraitExtended[];
	handler: (trait: TraitExtended) => void;
}
function TraitGroup({
	type,
	traits,
	selectedTraits,
	handler,
}: TraitGroupProps & { type: TraitType }) {
	return (
		<Popover className='relative'>
			<PopoverButton className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
				{type == TraitType.BODY && <IconBody className='w-6 max-h-5' />}
				{type == TraitType.CLOTHING && (
					<IconClothing className='w-6 max-h-5' />
				)}
				{type == TraitType.EXPRESSION && (
					<IconExpression className='w-6 max-h-5' />
				)}
				{type == TraitType.HAIR && <IconHair className='w-6 max-h-5' />}
				{type == TraitType.ACCESSORY && (
					<IconAccessory className='w-6 max-h-5' />
				)}
			</PopoverButton>
			<PopoverPanel
				anchor='bottom'
				className='mt-1 rounded-xl bg-white border border-black shadow-xl shadow-gray-900/20 w-48'
			>
				<div className='flex p-2 flex-col gap-y-2 overflow-y-scroll max-h-64'>
					{traits && filterTraits(traits, type).length > 0 ? (
						filterTraits(traits, type).map((item) => (
							<div
								key={item.id}
								className={twMerge(
									'flex gap-3 items-center w-full cursor-pointer hover:translate-x-1 transition-all',
									isSelected(selectedTraits, item) &&
										'font-semibold group'
								)}
								onClick={() => handler(item)}
							>
								<img
									src={'/assets/' + item.raw.image}
									className='size-10 group-enabled:border-2 rounded-lg border border-black'
								/>
								{item.trait_name}
							</div>
						))
					) : (
						<div className='text-sm text-center font-medium'>
							No traits found.
							<br />
							Mint some below!
						</div>
					)}
				</div>
			</PopoverPanel>
		</Popover>
	);
}

interface TraitBarProps {
	traits: CharacterTraits | undefined;
	selectedTraits: TraitExtended[];
	handler: (trait: TraitExtended) => void;
	color: string;
	colorHandler: (color: string) => void;
}

export function CharacterTraitBar({
	color,
	colorHandler,
	...rest
}: TraitBarProps) {
	return (
		<div className='w-full'>
			<div className='text-center text-xs font-medium mb-2 text-gray-400'>
				Build a PFP from your minted traits
			</div>
			<div className='grid grid-cols-6 gap-2 text-sm text-black font-medium w-full'>
				<Popover className='relative'>
					<PopoverButton className='rounded-xl bg-white shadow-md shadow-gray-200/0 w-full border border-black aspect-square flex items-center justify-center'>
						<IconPaint className='w-6 max-h-5' />
					</PopoverButton>
					<PopoverPanel
						anchor='bottom'
						className='flex flex-col mt-1 rounded-xl bg-white gap-y-2 border border-black p-2 shadow-xl shadow-gray-900/20 w-fit'
					>
						<HexColorPicker
							color={color}
							onChange={(clr) => colorHandler(clr)}
						/>
					</PopoverPanel>
				</Popover>
				<TraitGroup {...rest} type={TraitType.BODY} />
				<TraitGroup {...rest} type={TraitType.CLOTHING} />
				<TraitGroup {...rest} type={TraitType.EXPRESSION} />
				<TraitGroup {...rest} type={TraitType.HAIR} />
				<TraitGroup {...rest} type={TraitType.ACCESSORY} />
			</div>
		</div>
	);
}
