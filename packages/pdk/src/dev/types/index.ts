export type DeployConfig = {
    rpcUrl?: string;
    privateKey?: string;
    owner?: string;
    patchworkProtocol?: string;
    network?: string; //TODO: can switch this to viem/chains type, but need to special case 'local' because it's a fork of base and should use base as the newtwork
};

export type DeploymentInfo = {
    deployedAddress: string;
    bytecodeHash: string;
};

export type DeploymentAddresses = {
    [contractName: string]: DeploymentInfo;
};
