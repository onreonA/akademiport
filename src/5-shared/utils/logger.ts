/* eslint-disable no-console */

type LogArgs = unknown[];

const shouldMuteInfo = process.env.NODE_ENV === 'test';

function log(level: 'info' | 'warn' | 'error', ...args: LogArgs) {
  if (level === 'info' && shouldMuteInfo) {
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

  console.log(...args);
}

export const logger = {
  info: (...args: LogArgs) => log('info', ...args),
  warn: (...args: LogArgs) => log('warn', ...args),
  error: (...args: LogArgs) => log('error', ...args),
};

export default logger;



