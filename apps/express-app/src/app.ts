import express, { Request, Response } from 'express';
import packageJson from '../package.json';
import morgan from 'morgan';
import { morganFormat } from './config';
import { getStore, httpContextMiddleware } from './context';

const app = express();

app.use(express.json());

app.use(httpContextMiddleware);

app.use((req, res, next) => {
  const requestId = req.get('x-request-id') ?? crypto.randomUUID();

  res.set('x-request-id', requestId);

  const store = getStore();

  store?.set('requestId', requestId);

  next();
});

app.get('/favicon.ico', (req, res) => {
  return res.status(204).send();
});

app.get('/_health', (req, res) => {
  res.send(`OK`);
});

app.use(morgan(morganFormat));

app.get('/', (req, res) => {
  res.send(packageJson);
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

export default app;
