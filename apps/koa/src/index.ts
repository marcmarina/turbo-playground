import dotenv from 'dotenv';
import path from 'path';

import { integer } from '@app/config';

import app from './app';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

const port = integer('PORT');

const server = app.listen(port, () => {
  console.log(`[${process.pid}] Server listening on port ${port}`);
});

const shutdownHandler = (signal: any) => {
  console.log(`${signal} received. Closing server.`);

  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);
