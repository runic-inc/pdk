# Patchwork Development Kit

## Setup

To set up your development environment, follow these steps:

1. **Install Foundry**:
   Foundry is a smart contract development toolchain. You can install it by following the instructions at [Foundry's installation guide](https://book.getfoundry.sh/getting-started/installation).

   ```shell
   forge install
   ```

2. **Install Node.js dependencies**:

   ```shell
   npm install
   ```

## Testing Your Environment

To ensure your environment is set up correctly, you can run the following tests:

- Using npm:

  ```shell
  npm test
  ```

- Using Foundry:

  ```shell
  forge test
  ```

## Using the PDK

To use the Patchwork Development Kit (PDK), run:

```shell
npx pdk
```

## Development

For development tasks such as building the TypeScript project and linking the executable, follow these steps:

1. **Build TypeScript to JavaScript**:

   ```shell
   npm run build
   ```

2. **Link the Executable**:

   ```shell
   npm link
   ```

3. **Using the PDK**:
   After linking, you can use the `pdk` command to access the Patchwork Development Kit:

   ```shell
   pdk
   ```
