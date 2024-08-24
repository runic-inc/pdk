import ContractEditor from './ContractEditor';
import CodeView from './CodeView';

const Layout = () => {
    return (
        <main className='grid grid-cols-[28rem_1fr] h-[100vh]'>
            <div className='p-4 pr-0 h-[100vh] flex'>
                <div className='bg-white p-6 border border-black overflow-scroll rounded shadow-lg w-full'>
                    <h2 className='text-2xl font-bold mb-4'>Contract Editor</h2>
                    <ContractEditor />
                </div>
            </div>
            <div className='p-4 h-[100vh] flex flex-col'>
                <CodeView />
            </div>
        </main>
    );
};

export default Layout;
