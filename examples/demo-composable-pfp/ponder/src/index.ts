import { characterTraits } from '../ponder.schema';
import { patchwork } from './generated/patchwork';
import type Sharp from 'sharp';
import { traits } from '../../assets/traits';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

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

patchwork.after('Character:Forge', async ({ event, context }) => {
	const assignedTraits = await Promise.all(
		event.args.traitTokenIds.map(async (tokenId, i) => {
			const id = `${event.args.traitAddresses[i]}:${tokenId}`;
			const fragment = await context.db.find(characterTraits, { id });
			// await context.db.update(characterTraits, { id }).set({
			// 	characterId: `${event.log.address}:${event.args.tokenId}`,
			// });
			return traits[fragment!.trait_id!]!;
		})
	);

	const imageDir = path.resolve(__dirname, '../../assets');
	const width = 264;
	const height = 280;
	const bg = event.args.bgColor.slice(10, 16);

	const traitSvgs = await Promise.all(
		assignedTraits.map(async (trait) => {
			const svgPath = path.resolve(imageDir, trait.image);
			return fs.readFile(svgPath, 'utf8');
		})
	);
	const compositeSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#${bg}" />
      ${traitSvgs.join('\n')}
    </svg>
  `;
	const filename = event.args.tokenId.toString() + '.svg';
	await fs.writeFile(
		path.resolve(__dirname, '../assets/images/characters', filename),
		compositeSvg
	);
});
