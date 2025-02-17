import { useAccount } from 'wagmi';
import Header from './components/Header';
import {
	useWriteCharacterForge,
	useWriteCharacterTraitsMintBatch,
} from './generated/hooks/wagmi';
import { useState } from 'react';
import { TraitBar } from './components/TraitBar';
import { Address, Hex, parseEther } from 'viem';
import { useCharacterTraitsGetPaginated } from './generated/hooks/trpc';
import { TraitExtended } from './types';
import { TraitCollector } from './components/TraitCollector';
import { twMerge } from 'tailwind-merge';

function App() {
	const { address } = useAccount();
	const { writeContract: mintTraits, isPending: mintTraitsPending } =
		useWriteCharacterTraitsMintBatch();
	const {
		writeContract: mintCharacter,
		isPending: mintCharacterPending,
		failureReason,
		data,
	} = useWriteCharacterForge();

	const { data: userTraits } = useCharacterTraitsGetPaginated({
		limit: 100,
		owner: address!,
	});

	const [selectedTraits, setSelectedTraits] = useState<TraitExtended[]>([]);
	const [color, setColor] = useState<string>('#f8f1fc');

	const handleTraitSelect = (trait: TraitExtended) => {
		setSelectedTraits(
			selectedTraits
				.filter((t) => t.trait_type !== trait.trait_type)
				.concat(trait)
		);
	};

	const handleForge = () => {
		const addresses: Address[] = [];
		const tokenIds: bigint[] = [];
		selectedTraits.forEach((trait, i) => {
			addresses[i] = trait.contractId as Address;
			tokenIds[i] = trait.tokenId;
		});
		const bg = color.replace('#', '0x00000000') + 'ff';
		console.log([addresses, tokenIds, bg as Hex]);
		mintCharacter({
			args: [addresses, tokenIds, bg as Hex],
		});
	};

	return (
		<div id='wrapper'>
			<div className='w-full h-full relative flex flex-col gap-6 items-center justify-center'>
				<Header />

				<div className='relative mx-auto p-4 w-80 rounded-3xl flex flex-col items-center gap-2 bg-white shadow-xl shadow-gray-800/10 border border-black'>
					<TraitCollector
						selectedTraits={selectedTraits}
						selectedColor={color}
					/>

					<TraitBar
						traits={userTraits}
						selectedTraits={selectedTraits}
						handler={handleTraitSelect}
						color={color}
						colorHandler={setColor}
					/>

					<button
						className={twMerge(
							'rounded-xl w-full py-2.5 font-bold bg-black text-white',
							mintCharacterPending &&
								'opacity-90 bg-gray-800 pointer-events-none'
						)}
						onClick={handleForge}
					>
						Mint this PFP
					</button>
					<div>{JSON.stringify(failureReason)}</div>
					<div>{data}</div>
				</div>
				<button
					className={twMerge(
						'rounded-xl w-48 box-content transition-all py-2 bg-white ring-1 ring-black font-semibold shadow-xl hover:scale-105',
						mintTraitsPending &&
							'opacity-90 bg-gray-200 pointer-events-none'
					)}
					onClick={() =>
						mintTraits({
							args: [address!, address!, 5n],
							value: parseEther('0.000555'),
						})
					}
				>
					{mintTraitsPending ? 'Minting...' : 'Mint traits'}
				</button>
			</div>
		</div>
	);
}

export default App;
