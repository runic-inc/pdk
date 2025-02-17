import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
	return (
		<header className='flex justify-between items-center header-wrapper absolute top-0 left-0 right-0'>
			<h1 className='text-xl font-bold'>PFP</h1>
			<ConnectButton showBalance={false} data-id='me' />
		</header>
	);
}

export default Header;
