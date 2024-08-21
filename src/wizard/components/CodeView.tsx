import { useState, useEffect, FC } from 'hono/jsx'
import { parseJson } from "../../codegen/contractSchemaJsonParser";
import { MainContractGen } from "../../codegen/mainContractGen";
import { UserContractGen } from '../../codegen/userContractGen';
import { JSONSchemaGen } from '../../codegen/jsonSchemaGen';

const CodeView: FC = ({viewType, contractConfig}) => {
  const [solidityCode, setSolidityCode] = useState("");

  useEffect(() => {
    try {
      if (viewType === "userCode") {
        setSolidityCode(new UserContractGen().gen(contractConfig));
        return;
      } else if (viewType === "genCode") {
        setSolidityCode(new MainContractGen().gen(contractConfig));
        return;
      } else if (viewType === "schema") {
        setSolidityCode(new JSONSchemaGen().gen(contractConfig));
        return;
      }
      // TODO generate contract configuration json / ts (file)
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