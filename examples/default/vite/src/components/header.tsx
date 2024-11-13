import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
	return (
		<div className="flex justify-between items-center py-4">
			<h1 className="text-xl font-bold">My New App</h1>
			<ConnectButton />
		</div>
	);
}

export default Header;
