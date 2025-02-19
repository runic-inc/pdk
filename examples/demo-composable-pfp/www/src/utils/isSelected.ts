import { TraitExtended } from '@/types';

export default function isSelected(
	selectedTraits: TraitExtended[],
	trait: TraitExtended
): boolean {
	return selectedTraits.some(
		(selectedTrait) => selectedTrait.id === trait.id
	);
}
