import { twMerge } from 'tailwind-merge';
import { CharacterTraitBar } from './CharacterTraitBar';
import { CharacterPreview } from './CharacterPreview';
import { useWriteCharacterForge } from '@/generated/hooks/wagmi';
import { useCharacterTraitsGetPaginated } from '@/generated/hooks/trpc';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { TraitExtended } from '@/types';
import { Address, Hex } from 'viem';
import isSelected from '@/utils/isSelected';

export function CharacterMinter() {
	const { address } = useAccount();

	// Wagmi hook to call Forge (aka mint) on the Character contract
	const { writeContract, isPending, isSuccess } = useWriteCharacterForge();

	// tRPC hook to get user's available traits
	const { data: userTraits } = useCharacterTraitsGetPaginated({
		limit: 100,
		owner: address!,
		characterId: null,
	});

	const [selectedTraits, setSelectedTraits] = useState<TraitExtended[]>([]);
	const [color, setColor] = useState<string>('#f8f1fc');
	const [forgeEnabled, setForgeEnabled] = useState<boolean>(false);

	useEffect(() => {
		if (isSuccess) {
			setSelectedTraits([]);
		}
	}, [isSuccess]);

	useEffect(() => {
		const requiredTypes = new Set([0, 1, 2, 3]);
		const presentTypes = new Set(
			selectedTraits.map((item) => item.trait_type)
		);
		const isValid = [...requiredTypes].every((type) =>
			presentTypes.has(type)
		);
		setForgeEnabled(isValid);
	}, [selectedTraits]);

	const handleTraitSelect = (trait: TraitExtended) => {
		if (isSelected(selectedTraits, trait)) {
			setSelectedTraits(selectedTraits.filter((t) => t.id !== trait.id));
		} else {
			setSelectedTraits(
				selectedTraits
					.filter((t) => t.trait_type !== trait.trait_type)
					.concat(trait)
			);
		}
	};

	const handleForge = () => {
		const addresses: Address[] = [];
		const tokenIds: bigint[] = [];
		selectedTraits.forEach((trait, i) => {
			addresses[i] = trait.contractId as Address;
			tokenIds[i] = trait.tokenId;
		});
		const bg = color.replace('#', '0x00000000') + 'ff';
		writeContract({
			args: [addresses, tokenIds, bg as Hex],
		});
	};
	return (
		<div className='relative mx-auto mt-8 p-4 w-80 rounded-3xl flex flex-col items-center gap-2 bg-white shadow-xl shadow-gray-800/10 border border-black'>
			<CharacterPreview
				selectedTraits={selectedTraits}
				selectedColor={color}
			/>

			<CharacterTraitBar
				traits={userTraits}
				selectedTraits={selectedTraits}
				handler={handleTraitSelect}
				color={color}
				colorHandler={setColor}
			/>

			<button
				className={twMerge(
					'rounded-xl w-full py-2.5 font-bold bg-black text-white',
					(isPending || !forgeEnabled) &&
						'opacity-50 bg-gray-500 pointer-events-none'
				)}
				onClick={handleForge}
			>
				{isPending ? 'Minting...' : 'Mint this PFP'}
			</button>
		</div>
	);
}
