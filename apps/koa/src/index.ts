import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

import app from './app';
import * as config from './config';
import { logger } from '@app/logger';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const server = app.listen(config.port, () => {
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
