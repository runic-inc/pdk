import { useCharacterGetPaginated } from '@/generated/hooks/trpc';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function Header() {
	const { address } = useAccount();

	const { data: userChars } = useCharacterGetPaginated({
		limit: 100,
		owner: address!,
	});

	return (
		<header className='flex justify-between items-center header-wrapper gap-4 w-full'>
			<h1 className='text-xl font-bold'>PFP</h1>
			<div className='flex gap-4 grow justify-end'>
				{userChars?.items.map((char) => (
					<div key={char.id}>
						<img
							src={`${import.meta.env.VITE_PUBLIC_PONDER_URL}/assets/images/characters/${char.tokenId}.svg`}
							className='h-10 rounded-xl ring-1 ring-black shadow-lg'
						/>
					</div>
				))}
			</div>
			<ConnectButton showBalance={false} data-id='me' />
		</header>
	);
}

export default Header;
