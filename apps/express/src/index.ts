import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

import { createHttpTerminator } from 'http-terminator';

import { logger } from '@app/logger';

import * as config from './config';
import { createServer } from './server';

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception. Exiting process.');

  process.exit(1);
});

process.on('unhandledRejection', async (cause) => {
  logger.error(cause, 'Unhandled rejection. Exiting process.');

  process.exit(1);
});

async function main() {
  const server = createServer();

  await new Promise<void>((res) => {
    server.listen(config.port, res);
  });

  logger.info(`Server listening on port ${config.port}`);

  const terminator = createHttpTerminator({
    server: server,
    gracefulTerminationTimeout: 30000,
  });

  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async (signal) => {
      logger.info(`Received ${signal}. Shutting down server.`);

      await terminator.terminate();

      logger.info('Server terminated. Exiting process.');
      process.exit(0);
    });
  });
}

void main();
