import { TraitType } from '#/assets/traits';
import { TraitExtended } from '@/types';

interface TraitCollectorProps {
	selectedTraits: TraitExtended[];
	selectedColor: string;
}

function Layer({ trait }: { trait: TraitExtended | undefined }) {
	return trait ? (
		<img src={'/assets/' + trait.raw.image} className='absolute inset-0' />
	) : (
		<></>
	);
}

export function TraitCollector({
	selectedTraits,
	selectedColor,
}: TraitCollectorProps) {
	const items: Record<TraitType, TraitExtended> = Object.fromEntries(
		selectedTraits.map((trait) => [trait.trait_type, trait])
	);
	return (
		<div
			className={`rounded-full relative overflow-hidden w-60 -mt-24 mb-4 p-2 border border-black bg-white aspect-square shadow-lg shadow-gray-200 transition-all duration-200 ring-1 ring-black/0`}
		>
			<div
				className='inset-0 absolute bg-[var(--bg-color)] transition-colors'
				style={{ '--bg-color': selectedColor } as React.CSSProperties}
			/>
			<Layer trait={items[TraitType.BODY]} />
			<Layer trait={items[TraitType.CLOTHING]} />
			<Layer trait={items[TraitType.EXPRESSION]} />
			<Layer trait={items[TraitType.HAIR]} />
			<Layer trait={items[TraitType.ACCESSORY]} />
		</div>
	);
}
