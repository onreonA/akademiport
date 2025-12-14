/* eslint-disable no-console */

type LogArgs = unknown[];

const shouldMuteInfo = process.env.NODE_ENV === 'test';

function log(level: 'info' | 'warn' | 'error' | 'debug', ...args: LogArgs) {
  if ((level === 'info' || level === 'debug') && shouldMuteInfo) {
    return;
  }

  if (level === 'error') {
    console.error(...args);
    return;
  }

  if (level === 'warn') {
    console.warn(...args);
    return;
  }

  if (level === 'debug') {
    // In development, use console.debug, otherwise use console.log
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    } else {
      console.log(...args);
    }
    return;
  }

  console.log(...args);
}

export const logger = {
  info: (...args: LogArgs) => log('info', ...args),
  warn: (...args: LogArgs) => log('warn', ...args),
  error: (...args: LogArgs) => log('error', ...args),
  debug: (...args: LogArgs) => log('debug', ...args),
};

export default logger;
