import { useState, useEffect, FC } from 'hono/jsx'
import { parseJson } from "../../codegen/contractSchemaJsonParser";
import { MainContractGen } from "../../codegen/mainContractGen";
import { UserContractGen } from '../../codegen/userContractGen';
import { JSONSchemaGen } from '../../codegen/jsonSchemaGen';
import { ContractConfig } from '../../types';
import { ContractSchemaImpl } from '../../codegen/contractSchema';

interface CodeViewProps {
  viewType: string;
  contractConfig: ContractConfig;
}

const CodeView: FC<CodeViewProps> = ({ viewType, contractConfig }) => {
  const [solidityCode, setSolidityCode] = useState("");

  useEffect(() => {
    console.log("contract config", contractConfig);
    try {
      if (viewType === "userContract") {
        setSolidityCode(new UserContractGen().gen(new ContractSchemaImpl(contractConfig)));
      } else if (viewType === "genContract") {
        setSolidityCode(new MainContractGen().gen(new ContractSchemaImpl(contractConfig)));
      } else if (viewType === "schema") {
        setSolidityCode(new JSONSchemaGen().gen(new ContractSchemaImpl(contractConfig)));
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setSolidityCode("Error generating code");
    }
  }, [contractConfig, viewType]);

  return (
    <pre className="bg-gray-900 text-white p-4 rounded">
      <code>{solidityCode}</code>
    </pre>
  );
};

export default CodeView;