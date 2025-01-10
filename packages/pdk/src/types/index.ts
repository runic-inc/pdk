import { Command, OptionValues } from '@commander-js/extra-typings';
import { ContractConfig, Network, ScopeConfig, ValidNameIdentifier } from '@patchworkdev/common';
import { Listr, ListrTaskWrapper } from 'listr2';

export type TableData = { [key: string]: { [key: string]: string | number } };

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;
export type RequiredBy<TType, TKeys extends keyof TType> = Required<Pick<TType, TKeys>> & Omit<TType, TKeys>;

export type PatchworkProject = {
    src?: string; // Defaults to the src in stdout of forge config
    plugins: PDKPlugin[];
    name: ValidNameIdentifier;
    scopes: ScopeConfig[];
    contracts: Record<string, ContractConfig | string>;
    networks?: Record<'local' | 'testnet' | 'mainnet', Network>;
};

export type PDKContext = {
    rootDir: string;
    config: PatchworkProject;
    network: 'local' | 'testnet' | 'mainnet';
    contracts: {
        name: string;
        path: string;
        abi: string;
        bytecode: string;
        md5: string;
        address: `0x${string}`;
    }[];
    artifacts: Record<string, any>;
};

export type PatchworkSetup = {
    src: string;
    out: string;
    scripts: string;
};

export class PDKPluginCommand<Options extends OptionValues = {}> {
    private command: Command<[], Options>;
    protected _ctx?: PDKContext;

    constructor() {
        this.command = new Command<[], Options>();
    }

    name(name: string): this {
        this.command.name(name);
        return this;
    }

    option<T extends string | boolean>(flags: string, description?: string, defaultValue?: T): PDKPluginCommand<Options & { [key: string]: T }> {
        this.command.option(flags, description, defaultValue);
        return this as PDKPluginCommand<Options & { [key: string]: T }>;
    }

    withContext(ctx: PDKContext): this {
        this._ctx = ctx;
        // Store context directly on command
        (this.command as any)._ctx = ctx;

        // Propagate to subcommands
        this.command.commands.forEach((cmd) => {
            if (cmd instanceof Command) {
                (cmd as any)._ctx = ctx;
            }
        });
        return this;
    }

    protected getContext(): PDKContext {
        if (!this._ctx) {
            throw new Error('Command context not initialized');
        }
        return this._ctx;
    }

    addSubCommand<SubOptions extends OptionValues = {}>(subCommand: PDKPluginCommand<SubOptions>): PDKPluginCommand<SubOptions> {
        if (this._ctx) {
            subCommand.withContext(this._ctx);
        }
        this.command.addCommand(subCommand.command);
        return subCommand;
    }

    action(fn: (opts: Options, ctx: PDKContext) => Promise<void> | void): this {
        this.command.action(function (this: Command<[], Options>, opts: Options) {
            const ctx = (this as any)._ctx as PDKContext;
            if (!ctx) {
                throw new Error('Command context not initialized');
            }
            return fn(opts, ctx);
        });
        return this;
    }

    getCommand(): Command<[], Options> {
        // Make sure context is set on the command before returning
        if (this._ctx) {
            (this.command as any)._ctx = this._ctx;
        }
        return this.command;
    }
}

export type PDKPlugin = {
    name: string;

    /**
     * Called before any compilation/build/codegen to provide setup context to PDK
     */
    // setup?: (context: PatchworkContext) => Promise<PatchworkSetup> | PatchworkSetup;

    /**
     * Called to initialize and modify the context object.
     */
    // compile?: (context: PatchworkContext) => Promise<void> | void;

    /**
     * Called to generate code or other artifacts using the context object.
     */
    generate?: (props: {
        context: PDKContext;
        task: ListrTaskWrapper<PDKContext, any, any>;
        log?: (message: string) => void;
    }) => Promise<Listr<PDKContext>> | Listr<PDKContext>;

    /**
     * Returns one or more commands to be added to the CLI.
     */
    commands?: () => PDKPluginCommand[];

    /**
     * Called when user runs pdk network switch
     */
    onNetworkChange?: (context: PDKContext) => Promise<void> | void;

    /**
     * Called to run deploy scripts
     */
    // deploy?: (context: PatchworkContext) => Promise<void> | void;
};
