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
   pnpm install
   ```

## Testing Your Environment

To ensure your environment is set up correctly, you can run the following tests:

- Using npm:

  ```shell
  pnpm test
  ```

- Using Foundry:

  ```shell
  forge test
  ```

## Using the PDK

To use the Patchwork Development Kit (PDK), run:

```shell
pnpm dlx create-patchwork
```

## Development

For development tasks such as building the TypeScript project and linking the executable, follow these steps:

1. **Build TypeScript to JavaScript**:

   ```shell
   pnpm build
   ```

2. **Link the Executable**:

   ```shell
   pnpm link --global
   ```

3. **Using the PDK**:
   After linking, you can use the `pdk` command to access the Patchwork Development Kit:

   ```shell
   pnpm dlx create-patchwork
   ```
