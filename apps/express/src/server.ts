import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import promBundle from 'express-prom-bundle';
import http from 'http';
import os from 'os';
import { ZodError } from 'zod';

import { httpContextWrapper, updateStore } from '@app/context';
import { httpLogger, logger } from '@app/logger';

import { resourcesRouter } from './routes/resources';
import { userRouter } from './routes/user';

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
      buckets: [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
      includeUp: true,
      promClient: {
        collectDefaultMetrics: {},
      },
    }),
  );

  app.use(
    promBundle({
      excludeRoutes: ['/_health'],
      normalizePath: (req) => req.route?.path ?? 'unknown',
      buckets: [
        0.001, 0.0025, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 30,
        60,
      ],
      httpDurationMetricName: 'http_request_highr_duration_seconds',
      includeUp: false,
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

    updateStore({
      requestId,
    });

    next();
  });

  app.use(httpLogger);

  app.use(userRouter);
  app.use(resourcesRouter);

  app.get('/favicon.ico', (req, res) => {
    return res.status(204).send();
  });

  app.get('/_health', (req, res, _next) => {
    res.sendStatus(200);
  });

  app.get('/host', (req, res) => {
    res.send(os.hostname());
  });

  app.use((req, res) => {
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
  });

  app.use((error: unknown, req: Request, res: Response, _: NextFunction) => {
    logger.error(error, 'Internal server error');

    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    res.status(500).send('Internal server error');
  });

  return http.createServer(app);
}
