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
    moduleOverrides?: Record<string, string>;
};

// Generic helper for commonjs default exports
export type Default<T> = {
    default: T;
};

// Added to grab the files dependencies so they can be added to the compilation
function collectDependencies(filePath: string): Set<string> {
    const deps = new Set<string>();
    const queue = [filePath];

    while (queue.length > 0) {
        const currentPath = queue.pop()!;
        if (deps.has(currentPath)) continue;

        deps.add(currentPath);

        try {
            const source = fs.readFileSync(currentPath, 'utf-8');
            // Very basic import scanning - you might want to make this more robust
            const importMatches = source.matchAll(/from\s+['"](\.[^'"]+)['"]/g);

            for (const match of importMatches) {
                const importPath = match[1];
                try {
                    // Try to resolve the TypeScript file directly
                    const resolvedPath = tryResolveTypescript(importPath, path.dirname(currentPath));
                    if (resolvedPath) {
                        queue.push(resolvedPath);
                    }
                } catch (error) {
                    logger.debug(`Could not resolve import ${importPath}: ${error}`);
                }
            }
        } catch (error) {
            logger.debug(`Error processing dependency ${currentPath}: ${error}`);
        }
    }

    return deps;
}

function tryResolveTypescript(request: string, containingPath: string): string | undefined {
    const extensions = ['.ts', '.tsx', '.d.ts'];
    const possiblePaths = [];

    // Try exact path with extensions, check for index.*
    for (const ext of extensions) {
        possiblePaths.push(path.resolve(containingPath, request + ext), path.resolve(containingPath, request, `index${ext}`));
    }

    // Also try exact path in case it already has an extension
    possiblePaths.push(path.resolve(containingPath, request));

    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
    }

    return undefined;
}

function tryResolveCompiled(request: string, containingPath: string, compiledFiles: Map<string, string>): string | undefined {
    const tsPath = tryResolveTypescript(request, containingPath);
    if (tsPath && compiledFiles.has(tsPath)) {
        return tsPath;
    }
    return undefined;
}

export function tsLoaderSync<T>(filePath: string, options?: TsLoaderOptions): T {
    try {
        //logger.debug(`Attempting to access ${filePath}`);
        fs.accessSync(filePath);
    } catch (error) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Unable to access file at ${filePath}`);
    }

    // Collect all dependencies first
    const dependencies = collectDependencies(filePath);

    // Create a new project instance with in-memory filesystem
    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.Latest,
            module: ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            ...options?.compilerOptions,
        },
        skipLoadingLibFiles: true,
        useInMemoryFileSystem: true,
    });

    // Add all files to the in-memory filesystem
    for (const depPath of dependencies) {
        const source = fs.readFileSync(depPath, 'utf-8');
        project.createSourceFile(depPath, source);
    }

    // Get all output files
    const compiledFiles = new Map<string, string>();
    project.getSourceFiles().forEach((sourceFile) => {
        const output = sourceFile.getEmitOutput();
        const compiled = output.getOutputFiles()[0].getText();
        compiledFiles.set(sourceFile.getFilePath(), compiled);
    });

    // Create a new module object for the main file
    const moduleObj = new Module(filePath) as InternalModule;
    moduleObj.filename = filePath;
    moduleObj.paths = module.paths;

    // Set up module interception
    let originalRequire: NodeRequire | undefined;
    if (options?.moduleOverrides || compiledFiles.size > 1) {
        //logger.debug(`Setting up module interception for ${compiledFiles.size} files`);
        originalRequire = Module.prototype.require;
        const newRequire = function (this: NodeModule, id: string) {
            // First check explicit overrides
            const override = options?.moduleOverrides?.[id];
            if (override) {
                return require(override);
            }

            // Then check if it's a relative import
            if (id.startsWith('.')) {
                // First try to resolve as a TypeScript file
                const resolvedTsPath = tryResolveCompiled(id, path.dirname(this.filename), compiledFiles);
                if (resolvedTsPath) {
                    const compiledCode = compiledFiles.get(resolvedTsPath)!;
                    const mod = new Module(resolvedTsPath) as InternalModule;
                    mod.filename = resolvedTsPath;
                    mod.paths = this.paths;
                    mod._compile(compiledCode, resolvedTsPath);
                    return mod.exports;
                }

                // If not found as TypeScript, try normal require
                try {
                    return originalRequire!.call(this, id);
                } catch (error: any) {
                    // If normal require fails, try one more time with .js extension
                    // This handles cases where TypeScript emits require('./file') but Node expects require('./file.js')
                    if (error.code === 'MODULE_NOT_FOUND') {
                        return originalRequire!.call(this, id + '.js');
                    }
                    throw error;
                }
            }

            // Fall back to normal require for non-relative imports
            return originalRequire!.call(this, id);
        } as NodeRequire;
        Object.assign(newRequire, originalRequire);
        Module.prototype.require = newRequire;
    }

    try {
        // Execute the compiled code
        const compiledCode = compiledFiles.get(filePath)!;
        moduleObj._compile(compiledCode, filePath);
        //logger.debug(`File compiled successfully: ${filePath}`);
        return moduleObj.exports;
    } finally {
        if (originalRequire) {
            Module.prototype.require = originalRequire;
        }
    }
}

export async function tsLoader<T>(path: string, options?: TsLoaderOptions): Promise<T> {
    return Promise.resolve(tsLoaderSync<T>(path, options));
}
