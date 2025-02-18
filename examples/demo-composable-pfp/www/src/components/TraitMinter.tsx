import { useWriteCharacterTraitsMintBatch } from '@/generated/hooks/wagmi';
import { twMerge } from 'tailwind-merge';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

export function TraitMinter() {
	const { address } = useAccount();
	const { writeContract: mintTraits, isPending: mintTraitsPending } =
		useWriteCharacterTraitsMintBatch();

	return (
		<div className='flex gap-2 mx-auto rounded-3xl justify-between bg-black text-white p-5 w-full'>
			<div>
				<div className='text-lg font-bold'>Mint your traits here</div>
				<div className='text-sm text-gray-400'>
					Each transaction will mint 5 assignable traits you can use
					to compose your PFP.
				</div>
			</div>
			<button
				className={twMerge(
					'rounded-xl w-48 box-content transition-all py-2 bg-white text-black ring-1 ring-black font-bold shadow-xl hover:scale-105',
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
	);
}
