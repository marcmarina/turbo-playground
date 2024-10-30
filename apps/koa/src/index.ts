import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

import * as config from './config';
import { logger } from '@app/logger';
import { createServer } from './app';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const server = createServer();

server.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});

const shutdownHandler = (signal: any) => {
  logger.info(`${signal} received. Closing server.`);

  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);
