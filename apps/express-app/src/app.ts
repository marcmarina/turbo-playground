import express from 'express';
import packageJson from '../package.json';
import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

const app = express();

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
