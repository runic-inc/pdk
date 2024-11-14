import projectConfig from '#/patchwork.config';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
    return (
        <div className='flex justify-between items-center'>
            <h1 className='text-xl font-bold'>{projectConfig.name}</h1>
            <ConnectButton showBalance={false} />
        </div>
    );
}

export default Header;
