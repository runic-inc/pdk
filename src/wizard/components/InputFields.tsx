import { FC } from "hono/jsx";

const InputFields: FC = (setContractConfig) => {
    return (
      <div>
        <label className="block mb-2">
          Name:
          <input type="text" className="block w-full border rounded p-2 mt-1" />
        </label>
        <label className="block mb-2">
          Symbol:
          <input type="text" className="block w-full border rounded p-2 mt-1" />
        </label>
      </div>
    );
  };
  
  export default InputFields;
