import { characterTraits } from '../ponder.schema';
import { patchwork } from './generated/patchwork';

patchwork.after('CharacterTraits:Transfer', async ({ event, context }) => {
	const [trait_id, trait_name, trait_type] = await Promise.all([
		context.client.readContract({
			abi: context.contracts.CharacterTraits.abi,
			address: context.contracts.CharacterTraits.address,
			functionName: 'loadTraitid',
			args: [event.args.tokenId],
		}),
		context.client.readContract({
			abi: context.contracts.CharacterTraits.abi,
			address: context.contracts.CharacterTraits.address,
			functionName: 'loadTraitname',
			args: [event.args.tokenId],
		}),
		context.client.readContract({
			abi: context.contracts.CharacterTraits.abi,
			address: context.contracts.CharacterTraits.address,
			functionName: 'loadTraittype',
			args: [event.args.tokenId],
		}),
	]);
	await context.db
		.update(characterTraits, {
			id: `${event.log.address}:${event.args.tokenId}`,
		})
		.set({
			trait_id,
			trait_name,
			trait_type,
		});
});
