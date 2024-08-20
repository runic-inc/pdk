import { useState, useEffect, FC } from 'hono/jsx'
import { parseJson } from "../../codegen/contractSchemaJsonParser";
import { MainContractGen } from "../../codegen/mainContractGen";

const CodeView: FC = () => {
  const [solidityCode, setSolidityCode] = useState("");
  const [accountJson] = useState({
    "scopeName": "test",
    "name": "AccountPatch",
    "symbol": "AP",
    "baseURI": "https://mything/my/",
    "schemaURI": "https://mything/my-metadata.json",
    "imageURI": "https://mything/my/{tokenID}.png",
    "features": ["accountpatch"],
    "fields": [
      {
        "id": 1,
        "key": "name",
        "type": "char32",
        "description": "Name",
        "functionConfig": "all"
      }
    ]
  });

  console.log("Account JSON:", accountJson);
  useEffect(() => {
    try {
      const schema = parseJson(accountJson);
      const generatedCode = new MainContractGen().gen(schema);
      console.log("Generated code:", generatedCode);  // This will now log in the browser console
      setSolidityCode(generatedCode);
    } catch (error) {
      console.error("Error generating code:", error);
      setSolidityCode("Error generating code");
    }
  }, [accountJson]);

  return (
    <pre className="bg-gray-900 text-white p-4 rounded">
      <code>{solidityCode}</code>
    </pre>
  );
};

export default CodeView;