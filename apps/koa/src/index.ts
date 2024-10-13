import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

import app from './app';
import * as config from './config';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const server = app.listen(config.port, () => {
  console.log(`[${process.pid}] Server listening on port ${config.port}`);
});

const shutdownHandler = (signal: any) => {
  console.log(`${signal} received. Closing server.`);

  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);
