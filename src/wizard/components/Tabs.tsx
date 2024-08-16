import { useState } from 'hono/jsx';
import CodeView from './CodeView';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('solidity');

  const codeStub = `function schema() external pure override returns (MetadataSchema memory) {
    MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](4);
    entries[0] = MetadataSchemaEntry(0, 0, FieldType.UINT8, 1, FieldVisibility.PUBLIC, 0, 0, "attributeType");
    entries[1] = MetadataSchemaEntry(1, 1, FieldType.UINT16, 1, FieldVisibility.PUBLIC, 0, 8, "attributeId");
    entries[2] = MetadataSchemaEntry(2, 2, FieldType.UINT8, 1, FieldVisibility.PUBLIC, 0, 24, "tier");
    entries[3] = MetadataSchemaEntry(3, 3, FieldType.CHAR16, 1, FieldVisibility.PUBLIC, 0, 32, "name");
    return MetadataSchema(1, entries);
}`;

  return (
    <div>
      <div className="flex space-x-4">
        <button
          className={`py-2 px-4 ${activeTab === 'solidity' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('solidity')}
        >
          Solidity
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'schema' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Schema
        </button>
      </div>
      <div className="mt-4">
        {activeTab === 'solidity' ? <CodeView content={codeStub} /> : <CodeView content="Schema Hello World!" />}
      </div>
    </div>
  );
};

export default Tabs;