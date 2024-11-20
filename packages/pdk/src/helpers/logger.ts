import pino from 'pino';

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
