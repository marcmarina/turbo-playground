import dotenv from 'dotenv';
import { createHttpTerminator } from 'http-terminator';
import path from 'path';

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

import { logger } from '@app/logger';

import * as config from './config';
import { createServer } from './server';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const server = createServer();

server.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});

const terminator = createHttpTerminator({
  server,
  gracefulTerminationTimeout: 30000,
});

const shutdownHandler = async (signal: NodeJS.Signals) => {
  logger.info(`${signal} received. Closing server.`);

  await terminator.terminate();

  process.exit(0);
};

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);
