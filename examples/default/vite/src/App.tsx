import Header from "./components/header";

function App() {
	return (
		<div className="max-w-prose w-full text-base m-auto">
			<Header />
			<main className="py-8 border-t text-gray-500 leading-relaxed">
				<h2 className="text-black font-semibold mb-4">Get Started</h2>
				<p className="">
					We've generated a few things to get you up and running with your new
					Patchwork app. The frontend uses Vite/React + TailwindCSS and comes
					packaged with the latest WalletConnect and its dependencies. We've
					also generated a bunch of hooks that'll be useful for interacting with
					Ponder and your onchain contracts.
				</p>
			</main>
		</div>
	);
}

export default App;
