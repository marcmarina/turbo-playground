import os from 'os';
import express from 'express';
import promBundle from 'express-prom-bundle';

import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

import packageJson from '../package.json';
import { httpClient } from './http-client';

const app = express() as express.Express;

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

app.get('/get-pod-host', async (req, res, next) => {
  try {
    const response = await httpClient.get('/host');

    res.send(response.data);
  } catch (err) {
    next(err);
  }
});

app.get('/host', (req, res) => {
  res.send(`Host: ${os.hostname()}`);
});

app.get('/_health', (req, res, next) => {
  res.send(`OK`);
});

app.get('/', (req, res) => {
  res.send(packageJson);
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

app.use((error, req, res, next) => {
  res.status(500).send(error.message);
});

export default app;
