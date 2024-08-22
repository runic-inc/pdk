import { useState } from 'react';
import { FieldType, Patchwork721Interface } from '../types/constants';
import { Patchwork721Data, Patchwork721Field } from '../types/types';


const ContractPanel = () => {
    const [contractData, setContractData] = useState<Patchwork721Data>();

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        //const { name, value } = e.currentTarget!;
        //setContractData((prevData) => (prevData && { ...prevData, [name]: value }));
    };

    // Interfaces change handler
    const handleIntefacesChange = (opts: Patchwork721Interface[]) => {
        setContractData((prevData) => (prevData && { ...prevData, interfaces: opts }));
    }

    // Field change handler
    const handleFieldSort = (fields: Patchwork721Field[]) => {
        setContractData((prevData) => (prevData && { ...prevData, fields }));
    }
    const handleAddField = () => {
        setContractData((prevData) => (prevData && {
            ...prevData,
            fields: [...prevData.fields, { id: 'field_' + Math.round(Math.random() * 100000), name: '', type: FieldType.empty, cardinality: '' }]
        }));
    }

    return (
        <div className="rounded dotted bg-white border border-black w-[28rem] p-7 grid grid-flow-row auto-rows-[min-content_1fr_min-content] shadow-[0.5rem_0.5rem_0] shadow-gray-800/10">
            <div className="flex items-center justify-center relative z-[999]">
                <div className="text-2xl font-bold grow">Contract editor</div>
                <button className="rounded-full bg-black aspect-square w-8 text-white flex items-center justify-center leading-4 transition-all shadow--hover" onClick={() => {}}>
                    x
                </button>
                <div className="absolute top-full w-full h-10 bg-gradient-to-b from-white to-white/0" />
            </div>


            <div className="grow overflow-scroll p-7 -mx-7 pb-16 flex flex-col items-stretch gap-6">
                <div className="flex flex-col gap-2.5 items-stretch justify-stretch">
                    <div className="grid grid-cols-[2fr_1fr]">
                        <label className="form-label" htmlFor='field-name'>Contract name</label>
                        <label className="form-label" htmlFor='field-symbol'>Contract symbol</label>
                    </div>
                    <div className="grid grid-cols-[2fr_1fr] shadow rounded">
                        <input
                            className="form-input h-12 p-3 text-lg font-semibold rounded-r-none shadow-none w-auto"
                            type="text"
                            name="name"
                            id="field-name"
                            placeholder='Name your contract'
                            value={contractData?.name || ''}
                            onChange={handleInputChange} />
                        <input
                            className="form-input h-12 p-3 text-lg font-semibold rounded-l-none shadow-none border-l-0 cursor-not-allowed"
                            type="text"
                            name="symbol"
                            id='field-symbol'
                            placeholder='Symbol'
                            disabled
                            value={''}
                            onChange={(handleInputChange)} />
                    </div>
                </div>

                <label className="flex flex-col gap-2.5 items-stretch justify-stretch">
                    <span className="form-label">Patchwork interfaces</span>
                </label>

                <div className="flex flex-col gap-2.5 items-stretch justify-stretch">
                    <span className="form-label">Data fields</span>
                   <button onClick={handleAddField} className="p-3 text-sm transition-all border border-dashed border-gray-300 text-gray-400 font-medium rounded-md leading-none w-full">Add a new field</button>
                </div>
            </div>

            <div className="relative z-[99999] w-full">
                <div className="absolute bottom-full w-full h-16 bg-gradient-to-t from-white to-white/0" />
                <button onClick={() => {}} className="p-3 bg-black rounded text-white font-medium transition-all shadow-md shadow--hover w-full">Save contract changes</button>
            </div>
        </div>
    );
};

export default ContractPanel;