import log from 'electron-log';
import { APP_NAME } from './config';

// Initialize the generic system logger
// By default, electron-log persists on disk and outputs to the console.
export const logger = log.create({ logId: APP_NAME.toLowerCase() });

// Optional: you can format the strings explicitly if you want custom logic:
logger.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

// Explicitly set the file output path strategy optionally:
// logger.transports.file.resolvePathFn = () => path.join('...', 'patrol.log');

export default logger;
