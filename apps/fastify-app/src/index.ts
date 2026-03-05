import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

import { createHttpTerminator } from 'http-terminator';

import { logger } from '@app/logger';

import { port } from './config';
import { createServer } from './server';

const app = createServer();

const start = async () => {
  try {
    await app.listen({ port });
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }

  const terminator = createHttpTerminator({
    server: app.server,
    gracefulTerminationTimeout: 30000,
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
};

start();
