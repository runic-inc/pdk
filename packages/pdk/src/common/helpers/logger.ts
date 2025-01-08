import { ListrTaskWrapper } from 'listr2';
import path from 'node:path';
import * as pico from 'picocolors';
import pino from 'pino';
import sourceMapSupport from 'source-map-support';
import { PDKContext } from '../../types';

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            messageFormat: '{msg}',
            ignore: 'pid,hostname,time',
            colorize: true,
        },
    },
    level: 'info', // Default level
});
export const setLogLevel = (level: pino.LevelWithSilent): void => {
    logger.level = level;
};

export class TaskLogger {
    private _task: ListrTaskWrapper<PDKContext, any, any> | undefined;
    private _projectRoot: string;

    constructor(task: ListrTaskWrapper<PDKContext, any, any>) {
        this._task = task;
        this._projectRoot = process.cwd();
        if (logger.level === 'debug') {
            sourceMapSupport.install();
        }
    }

    private getCallerInfo(depth = 1): string {
        try {
            const error = new Error();
            const stack = error.stack?.split('\n')[2 + depth];
            const match = stack?.match(/(?:.*?\s+\()?([^:]+):(\d+):(\d+)/);
            if (!match) return '';

            const [, file, line, col] = match;
            let relativePath = '';
            if (file.includes('pdk/src')) {
                relativePath = '@patchworkdev/pdk/src' + file.split('pdk/src')[1];
            } else {
                relativePath = path.relative(this._projectRoot, file);
            }
            return `${relativePath}:${line}:${col}:  `;
        } catch {
            return '';
        }
    }

    transport(level: 'info' | 'debug' | 'warn' | 'error', log: string) {
        if (this._task) {
            this._task.output = `${colors[level](level.toUpperCase() + ':')} ${log}`;
        } else {
            logger[level](log);
        }
    }

    debug(...args: any[]) {
        if (logger.level !== 'debug') return;
        const msg = `${pico.blue(this.getCallerInfo())}${pico.cyan(args.join('  '))}`;
        this.transport('debug', msg);
    }

    info(...args: any[]) {
        const msg = `${args.join('  ')}`;
        this.transport('info', msg);
    }

    warn(...args: any[]) {
        const msg = `${pico.yellow(this.getCallerInfo())}${pico.yellow(args.join('  '))}`;
        this.transport('warn', msg);
    }

    error(...args: any[]) {
        const msg = `${pico.red(this.getCallerInfo())}${pico.red(args.join('  '))}`;
        this.transport('error', msg);
    }
}

const colors = {
    info: pico.dim,
    debug: pico.blue,
    warn: pico.yellow,
    error: pico.red,
};
