import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{import.meta.env.VITE_NAME}</h1>
            <ConnectButton showBalance={false} />
        </div>
    );
}

export default Header;
