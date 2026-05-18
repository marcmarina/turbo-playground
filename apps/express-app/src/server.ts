import cors from 'cors';
import express from 'express';
import promBundle from 'express-prom-bundle';
import http from 'http';
import os from 'os';
import { z, ZodError } from 'zod/v4';

import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger, logger } from '@app/logger';

const createUserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
});

const leaks: Buffer[] = [];

function simulateDbLatency(): Promise<void> {
  // 10% chance of an outlier (500–2000ms), otherwise 50–250ms
  const isOutlier = Math.random() < 0.1;

  const delay = isOutlier
    ? 500 + Math.random() * 1500
    : 50 + Math.random() * 200;

  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function createServer() {
  const app = express();

  app.use(cors());

  app.use(
    promBundle({
      excludeRoutes: ['/_health'],
      includeMethod: true,
      includePath: true,
      includeStatusCode: true,
      normalizePath: (req) => req.route?.path ?? 'unknown',
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

  app.post('/user', async (req, res) => {
    const body = createUserSchema.parse(req.body);

    await simulateDbLatency();

    res.json(body);
  });

  app.get('/favicon.ico', (req, res) => {
    return res.status(204).send();
  });

  app.get('/_health', (req, res, _next) => {
    res.send(`OK`);
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
    logger.error(error, 'Request error');

    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    res.status(500).send(error.message);
  });

  return http.createServer(app);
}
