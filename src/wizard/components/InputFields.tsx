import { useEffect, useState } from 'react';
import { ContractConfig, Feature, FieldConfig, FunctionConfig } from '../../types'

const fieldTypes = [
  "boolean", "int8", "int16", "int32", "int64", "int128", "int256",
  "uint8", "uint16", "uint32", "uint64", "uint128", "uint256",
  "char8", "char16", "char32", "char64", "literef", "address", "string"
];

const InputFields = ({ setContractConfig }: { setContractConfig: (config: ContractConfig) => void }) => {
  const [config, setConfig] = useState<ContractConfig>({
    scopeName: 'test',
    name: 'AccountPatch',
    symbol: 'AP',
    baseURI: 'https://mything/my/',
    schemaURI: 'https://mything/my-metadata.json',
    imageURI: 'https://mything/my/{tokenID}.png',
    fields: [
      {
        id: 1,
        key: 'name',
        fieldType: 'char32',
        description: 'description',
        functionConfig: FunctionConfig.ALL
      }
    ],
    features: [Feature.PATCHACCOUNT]
  })

  useEffect(() => {
    setContractConfig(config)
  }, [config])

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    setConfig(prev => ({ ...prev, [target.name]: target.value }))
  }

  const handleFeatureToggle = (feature: Feature) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }))
  }

  const handleAddField = () => {
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: prev.fields.length + 1,
        fieldType: 'string',
        key: '',
        description: 'description',
        functionConfig: FunctionConfig.ALL
      }]
    }))
  }

  const handleFieldChange = (index: number, field: Partial<Pick<FieldConfig, 'key' | 'fieldType' | 'description' | 'functionConfig'>>) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }))
  }

  return (
    <div className="space-y-4">
      <input
        name="scopeName"
        value={config.scopeName}
        onChange={handleInputChange}
        placeholder="Scope Name"
        className="w-full p-2 border rounded"
      />
      <input
        name="name"
        value={config.name}
        onChange={handleInputChange}
        placeholder="Name"
        className="w-full p-2 border rounded"
      />
      <input
        name="symbol"
        value={config.symbol}
        onChange={handleInputChange}
        placeholder="Symbol"
        className="w-full p-2 border rounded"
      />
      <input
        name="baseURI"
        value={config.baseURI}
        onChange={handleInputChange}
        placeholder="Base URI"
        className="w-full p-2 border rounded"
      />
      <input
        name="schemaURI"
        value={config.schemaURI}
        onChange={handleInputChange}
        placeholder="Schema URI"
        className="w-full p-2 border rounded"
      />
      <input
        name="imageURI"
        value={config.imageURI}
        onChange={handleInputChange}
        placeholder="Image URI"
        className="w-full p-2 border rounded"
      />

      <div>
        <h3 className="font-bold">Features</h3>
        {Object.values(Feature).map(feature => (
          <label key={feature} className="flex items-center">
            <input
              type="checkbox"
              checked={config.features?.includes(feature)}
              onChange={() => handleFeatureToggle(feature)}
              className="mr-2"
            />
            {feature}
          </label>
        ))}
      </div>

      <div>
        <h3 className="font-bold">Fields</h3>
        {config.fields.map((field, index) => (
          <div key={index} className="space-y-2 mt-2">
            <input
              value={field.key}
              onChange={(e) => handleFieldChange(index, { key: (e.target as HTMLInputElement).value })}
              placeholder="Key"
              className="w-full p-2 border rounded"
            />
            <select
              value={field.fieldType}
              onChange={(e) => handleFieldChange(index, { fieldType: (e.target as HTMLSelectElement).value })}
              className="w-full p-2 border rounded"
            >
              {fieldTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              value={field.description}
              onChange={(e) => handleFieldChange(index, { description: (e.target as HTMLInputElement).value })}
              placeholder="Description"
              className="w-full p-2 border rounded"
            />
            <select
              value={field.functionConfig}
              onChange={(e) => handleFieldChange(index, { functionConfig: (e.target as HTMLSelectElement).value as FunctionConfig })}
              className="w-full p-2 border rounded"
            >
              {Object.values(FunctionConfig).map(config => (
                <option key={config} value={config}>{config}</option>
              ))}
            </select>
          </div>
        ))}
        <button onClick={handleAddField} className="mt-2 p-2 bg-blue-500 text-white rounded">Add Field</button>
      </div>
    </div>
  )
}

export default InputFields