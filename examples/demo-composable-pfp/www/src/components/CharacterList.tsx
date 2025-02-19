import {
	useCharacterGetById,
	useCharacterGetPaginated,
	useCharacterTraitsGetPaginated,
} from '@/generated/hooks/trpc';
import { useWriteCharacterBurn } from '@/generated/hooks/wagmi';
import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface CharacterCardProps {
	id: string | null;
	close: () => void;
}

function CharacterCard({ id, close }: CharacterCardProps) {
	const { data: character, isSuccess: charLoaded } = useCharacterGetById(
		id ?? ''
	);
	const { data: characterTraits } = useCharacterTraitsGetPaginated({
		limit: 6,
		characterId: id,
	});
	const { writeContract, isSuccess: charBurned } = useWriteCharacterBurn();
	const handleDismantle = async (tokenId: bigint) => {
		writeContract({
			args: [tokenId],
		});
	};
	useEffect(() => {
		if (charBurned) {
			close();
		}
	}, [charBurned, close]);
	return (
		id && (
			<Dialog
				open={!!id}
				onClose={() => close()}
				className='relative z-50'
			>
				<div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
					<DialogPanel className='w-fit border border-black rounded-3xl shadow-2xl bg-white p-5 flex flex-col'>
						{!charLoaded && <p>Loading...</p>}
						{charLoaded && (
							<>
								<div className='flex gap-10 items-center'>
									<img
										src={`${import.meta.env.VITE_PUBLIC_PONDER_URL}/assets/images/characters/${character.tokenId}.svg`}
										className='h-64 rounded-lg ring-1 ring-black -ml-16 -rotate-3'
									/>
									<div className='grid grid-cols-2 gap-y-1 gap-x-6 items-center text-sm'>
										<div className='font-bold text-lg col-span-2 mb-2'>
											Character #
											{character.tokenId.toString()}
										</div>
										<div className='text-gray-500'>
											Background
										</div>
										<div className='font-medium'>
											#
											{character.bg_color
												?.slice(2, 8)
												.toUpperCase()}
										</div>
										<div className='text-gray-500'>
											Body
										</div>
										<div className='font-medium'>
											{
												characterTraits?.items.find(
													(t) => t.trait_type === 0
												)?.trait_name
											}
										</div>
										<div className='text-gray-500'>
											Clothing
										</div>
										<div className='font-medium'>
											{
												characterTraits?.items.find(
													(t) => t.trait_type === 1
												)?.trait_name
											}
										</div>
										<div className='text-gray-500'>
											Expression
										</div>
										<div className='font-medium'>
											{
												characterTraits?.items.find(
													(t) => t.trait_type === 2
												)?.trait_name
											}
											<span></span>
										</div>
										<div className='text-gray-500'>
											Hair
										</div>
										<div className='font-medium'>
											{
												characterTraits?.items.find(
													(t) => t.trait_type === 3
												)?.trait_name
											}
										</div>
										<div className='text-gray-500'>
											Accessory
										</div>
										<div className='font-medium'>
											{characterTraits?.items.find(
												(t) => t.trait_type === 4
											)?.trait_name ?? (
												<span className='text-gray-400'>
													None
												</span>
											)}
										</div>
										<div className='col-span-2 mt-4'>
											<button
												className='bg-black text-white w-full font-medium px-4 py-2 rounded-lg'
												onClick={() =>
													handleDismantle(
														character.tokenId
													)
												}
											>
												Dismantle character
											</button>
											<p className='max-w-64 mt-2 text-xs text-gray-500'>
												This burns the minted character
												and returns the assigned traits
												back to you for reuse.
											</p>
										</div>
									</div>
								</div>
							</>
						)}
					</DialogPanel>
				</div>
			</Dialog>
		)
	);
}

export function CharacterList() {
	const [id, setId] = useState<string | null>(null);
	const { address } = useAccount();

	const { data } = useCharacterGetPaginated({
		limit: 100,
		owner: address ?? '',
	});
	return (
		<>
			{!!data?.items.length && (
				<span className='font-semibold text-sm'>Your characters</span>
			)}
			{data?.items.map((char) => (
				<div key={char.id}>
					<img
						src={`${import.meta.env.VITE_PUBLIC_PONDER_URL}/assets/images/characters/${char.tokenId}.svg`}
						onClick={() => setId(char.id)}
						className='h-10 rounded-xl ring-1 ring-black shadow-lg cursor-pointer hover:scale-105 transition-transform'
					/>
				</div>
			))}
			<CharacterCard id={id} close={() => setId(null)} />
		</>
	);
}
