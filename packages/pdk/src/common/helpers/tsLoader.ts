import * as fs from 'fs';
import { Module } from 'module';
import * as path from 'path';
import { CompilerOptions, ModuleKind, Project, ScriptTarget, ts } from 'ts-morph';
import { ErrorCode, PDKError } from './error';
import { logger } from './logger';

type ModuleType = InstanceType<typeof Module>;
interface InternalModule extends ModuleType {
    _compile(code: string, filename: string): any;
}

type TsLoaderOptions = {
    compilerOptions?: Partial<CompilerOptions>;
    typecheck?: boolean;
    moduleOverrides?: Record<string, string>;
};

// Generic helper for commonjs default exports
export type Default<T> = {
    default: T;
};

export async function tsLoader<T>(path: string, options?: TsLoaderOptions): Promise<T> {
    return Promise.resolve(tsLoaderSync<T>(path, options));
}

export function tsLoaderSync<T>(filePath: string, options?: TsLoaderOptions): T {
    try {
        logger.debug(`Attempting to access ${filePath}`);
        fs.accessSync(filePath);
    } catch (error) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Unable to access file at ${filePath}`);
    }

    const source = fs.readFileSync(filePath, 'utf-8');

    // Create a new project instance
    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.Latest,
            module: ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            ...options?.compilerOptions,
        },
        skipFileDependencyResolution: !!options?.typecheck,
        skipLoadingLibFiles: !!options?.typecheck,
        useInMemoryFileSystem: !!options?.typecheck,
    });

    // Add the source file to the project
    const sourceFile = project.createSourceFile(path.basename(filePath), source, { overwrite: true });

    // Get compiled source
    const output = sourceFile.getEmitOutput();
    const compiledCode = output.getOutputFiles()[0].getText();

    // Create a new module object
    const moduleObj = new Module(filePath) as InternalModule;
    moduleObj.filename = filePath;
    moduleObj.paths = module.paths;

    // Set up module interception if needed
    let originalRequire: NodeRequire | undefined;
    if (options?.moduleOverrides) {
        logger.debug(`Overriding modules: ${JSON.stringify(options.moduleOverrides)}`);
        originalRequire = Module.prototype.require;
        const newRequire = function (this: NodeModule, id: string) {
            const override = options.moduleOverrides?.[id];
            if (override) {
                return require(override);
            }
            return originalRequire!.call(this, id);
        } as NodeRequire;
        Object.assign(newRequire, originalRequire);
        Module.prototype.require = newRequire;
    }

    try {
        // Execute the compiled code in Node module context (basically simulates a require())
        moduleObj._compile(compiledCode, filePath);
        logger.debug(`File compiled successfuly: ${filePath}`);
        return moduleObj.exports;
    } finally {
        if (originalRequire) {
            Module.prototype.require = originalRequire;
        }
    }
}
