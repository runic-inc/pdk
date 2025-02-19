import { Trait } from '#/assets/traits';
import { AppRouter } from '#/ponder/src/api';
import { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
export type Character = RouterOutput['character']['getById'];
export type Characters = RouterOutput['character']['getPaginated'];
export type CharacterTrait = RouterOutput['characterTraits']['getById'];
export type CharacterTraits = RouterOutput['characterTraits']['getPaginated'];

export type TraitExtended = CharacterTrait & {
	raw: Trait;
};
