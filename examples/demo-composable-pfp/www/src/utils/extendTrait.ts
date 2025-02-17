import { traits } from '#/assets/traits';
import { CharacterTrait, TraitExtended } from '@/types';

export default function extendTrait(trait: CharacterTrait): TraitExtended {
	return {
		...trait,
		raw: traits[trait.trait_id!],
	};
}
