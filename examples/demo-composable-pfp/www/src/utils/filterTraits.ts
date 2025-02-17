import { TraitType } from '#/assets/traits';
import { CharacterTraits, TraitExtended } from '@/types';
import extendTrait from './extendTrait';

export default function filterTraits(
	traits: CharacterTraits,
	type: TraitType
): TraitExtended[] {
	return traits.items
		.filter((trait) => trait.trait_type === type)
		.map((trait) => extendTrait(trait));
}
