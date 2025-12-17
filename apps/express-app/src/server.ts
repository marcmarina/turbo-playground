import express from 'express';
import promBundle from 'express-prom-bundle';
import http from 'http';
import cors from 'cors';

import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

import { webSocketManager } from './web-socket-manager';

export function createServer() {
  const app = express() as express.Express;

  app.use(cors());

  app.use(
    // @ts-expect-error This is an issue with the types
    promBundle({
      formatStatusCode: (res) => {
        return res.statusCode.toString().charAt(0) + 'xx';
      },
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

  app.get('/_health', (req, res, next) => {
    res.send(`OK`);
  });

  app.post('/message', (req, res, next) => {
    webSocketManager.broadcast(req.body);

    res.send({
      success: true,
    });
  });

  app.use((req, res) => {
    res.status(404).send(`Cannot ${req.method} ${req.url}`);
  });

  app.use((error, req, res, next) => {
    res.status(500).send(error.message);
  });

  return http.createServer(app);
}
