import { Command } from '@commander-js/extra-typings';

// Define log levels
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel = LogLevel.INFO;
    
    private constructor() {}
    
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    
    setLevel(level: LogLevel) {
        this.currentLevel = level;
    }
    
    error(message: string, ...args: any[]) {
        if (this.currentLevel >= LogLevel.ERROR) {
            console.error('Error:', message, ...args, '\x1b[0m');
        }
    }
    
    warn(message: string, ...args: any[]) {
        if (this.currentLevel >= LogLevel.WARN) {
            console.warn('Warning:', message, ...args, '\x1b[0m');
        }
    }
    
    info(message: string, ...args: any[]) {
        if (this.currentLevel >= LogLevel.INFO) {
            console.log('Info: ', message, ...args, '\x1b[0m');
        }
    }
    
    debug(message: string, ...args: any[]) {
        if (this.currentLevel >= LogLevel.DEBUG) {
            console.log('Debug:', message, ...args, '\x1b[0m');
        }
    }
    
    success(message: string, ...args: any[]) {
        if (this.currentLevel >= LogLevel.INFO) {
            console.log('Success: ', message, ...args, '\x1b[0m');
        }
    }
}

export const logger = Logger.getInstance();

// Command-line option helper
export function addVerboseOption<T extends unknown[]>(command: Command<T, any>): Command<T, any> {
    return command.option('-v, --verbose', 'enable verbose logging')
        .hook('preAction', (thisCommand) => {
            const opts = thisCommand.opts();
            logger.setLevel(opts.verbose ? LogLevel.DEBUG : LogLevel.INFO);
        });
}