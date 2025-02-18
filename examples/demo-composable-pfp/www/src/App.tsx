import Header from './components/Header';
import { TraitMinter } from './components/TraitMinter';
import { CharacterMinter } from './components/CharacterMinter';

function App() {
	return (
		<div id='wrapper'>
			<div className='w-full h-full relative flex flex-col gap-6 items-center justify-between'>
				<Header />
				<CharacterMinter />
				<TraitMinter />
			</div>
		</div>
	);
}

export default App;
