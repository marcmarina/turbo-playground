import http from 'http';

import app from './app';
import { port } from './config';

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception:', err);

  process.exit(1);
});

const server = http.createServer(app);

server.listen(port, () => {
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
