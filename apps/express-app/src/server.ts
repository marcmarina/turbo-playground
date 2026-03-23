import cors from 'cors';
import express from 'express';
import promBundle from 'express-prom-bundle';
import http from 'http';
import os from 'os';

import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

import { webSocketManager } from './web-socket-manager';

const leaks: Buffer[] = [];

export function createServer() {
  const app = express() as express.Express;

  app.use(cors());

  app.use(
    // @ts-expect-error This is an issue with the types
    promBundle({
      formatStatusCode: (res) => {
        return res.statusCode.toString().charAt(0) + 'xx';
      },
      excludeRoutes: ['/_health'],
      includeMethod: true,
      includePath: true,
      includeStatusCode: true,
      buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 15],
    }),
  );

  app.use(express.json());

  app.use((req, res, next) => {
    httpContextWrapper(next);
  });

  app.use((req, res, next) => {
    const requestId = req.get('x-request-id') ?? crypto.randomUUID();

    req.headers['x-request-id'] = requestId;
    res.set('x-request-id', requestId);

    const store = getStore();

    store?.set('requestId', requestId);

    next();
  });

  app.use(httpLogger);

  app.get('/favicon.ico', (req, res) => {
    return res.status(204).send();
  });

  app.get('/_health', (req, res, _next) => {
    res.send(`OK`);
  });

  app.post('/message', (req, res, _next) => {
    webSocketManager.broadcast(req.body);

    res.send({
      success: true,
    });
  });

  app.get('/stress/memory', (req, res) => {
    const mb = parseInt(req.query.mb as string) || 100;
    for (let i = 0; i < mb; i++) {
      leaks.push(Buffer.alloc(1024 * 1024, 1)); // fill with 1s, prevents lazy allocation
    }
    res.json({
      requested: `${mb}MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`,
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB`,
    });
  });

  app.get('/stress/memory/release', (req, res) => {
    leaks.length = 0;
    res.json({ released: true });
  });

  app.get('/stress/cpu', (req, res) => {
    const durationMs = parseInt(req.query.duration as string) || 5000;
    const end = Date.now() + durationMs;
    while (Date.now() < end) {
      Math.sqrt(Math.random());
    }
    res.json({ duration: `${durationMs}ms` });
  });

  app.get('/host', (req, res) => {
    res.send(os.hostname());
  });

  app.post('/exit', (req) => {
    process.exit(req.body.code);
  });

  app.use((req, res) => {
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
  });

  app.use((error, req, res, _next) => {
    res.status(500).send(error.message);
  });

  return http.createServer(app);
}
