export type DeployConfig = {
    rpcUrl?: string;
    privateKey?: string;
    owner?: string;
    patchworkProtocol?: string;
};

export type DeploymentInfo = {
    deployedAddress: string;
    bytecodeHash: string;
};

export type DeploymentAddresses = {
    [contractName: string]: DeploymentInfo;
};
