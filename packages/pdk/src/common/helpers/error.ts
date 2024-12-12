export enum ErrorCode {
    DIR_NOT_FOUND = 'DIR_NOT_FOUND',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    PROJECT_CONFIG_ERROR = 'PROJECT_CONFIG_ERROR',
    MOCK_NOT_FOUND = 'MOCK_NOT_FOUND',
    ABI_IMPORT_ERROR = 'ABI_IMPORT_ERROR',
    PROJECT_CONFIG_MISSING_NETWORKS = 'PROJECT_CONFIG_MISSING_NETWORKS',
    FILE_SAVE_ERROR = 'FILE_SAVE_ERROR',
    DEPLOYMENT_NOT_FOUND = 'DEPLOYMENT_NOT_FOUND',
    PDK_ERROR = 'PDK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    FILE_READ_ERROR = 'FILE_READ_ERROR',
    COMPILATION_ERROR = 'COMPILATION_ERROR',
}

export class PDKError extends Error {
    public readonly code: ErrorCode;
    public readonly details?: any;

    constructor(code: ErrorCode, message: string, details?: any) {
        super(message);
        this.code = code;
        this.details = details;

        // This is necessary for proper prototype chain inheritance
        Object.setPrototypeOf(this, PDKError.prototype);
    }

    public serialize() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
