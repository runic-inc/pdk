import { ConnectButton } from '@rainbow-me/rainbowkit';
import patchworkConfig from "../../../patchwork.config";

function Header() {
	return (
		<div className="flex justify-between items-center">
			<h1 className="text-xl font-bold">{patchworkConfig.name}</h1>
			<ConnectButton showBalance={false} />
		</div>
	);
}

export default Header;
