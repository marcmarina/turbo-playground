import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

import http from 'http';
import { createHttpTerminator } from 'http-terminator';

import { logger } from '@app/logger';

import app from './app';
import * as config from './config';

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception. Exiting process.');

  process.exit(1);
});

process.on('unhandledRejection', async (cause) => {
  logger.error(cause, 'Unhandled rejection. Exiting process.');

  process.exit(1);
});

const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});

const terminator = createHttpTerminator({
  server: server,
  gracefulTerminationTimeout: 10000,
});

const shutdownHandler = async (signal: NodeJS.Signals) => {
  logger.info(`Received ${signal}. Shutting down server.`);

  await terminator.terminate();

  logger.info('Server terminated. Exiting process.');
  process.exit(0);
};

const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

signals.forEach((signal) => {
  process.on(signal, () => shutdownHandler(signal));
});
