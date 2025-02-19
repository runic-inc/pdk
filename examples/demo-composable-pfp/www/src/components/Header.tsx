import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CharacterList } from './CharacterList';

function Header() {
	return (
		<header className='flex justify-between items-center header-wrapper gap-4 w-full'>
			<h1 className='text-xl font-bold'>Composable PFP Demo</h1>
			<div className='flex gap-4 grow justify-end items-center'>
				<CharacterList />
			</div>
			<ConnectButton showBalance={false} data-id='me' />
		</header>
	);
}

export default Header;
