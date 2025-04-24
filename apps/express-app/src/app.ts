import express from 'express';
import packageJson from '../package.json';
import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

import os from 'os';

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

app.use('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Express App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          padding: 1rem;
        }
      </style>
    </head>
    <body>
    <p>Version: ${packageJson.version}</p>
    <p>Node.js Version: ${process.version}</p>
    <p>Hostname: ${os.hostname()}</p>
    <p>Request ID: ${req.get('x-request-id')}</p>
    <p>Request Method: ${req.method}</p>
    <p>Request URL: ${req.url}</p>
    <p>Request Headers: ${JSON.stringify(req.headers, null, 2)}</p>
    <p>Request Body: ${JSON.stringify(req.body, null, 2)}</p>
    <p>Request Query: ${JSON.stringify(req.query, null, 2)}</p>
    </body>
    </html>
`)
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

app.use((error, req, res, next) => {
  res.status(500).send(error.message);
});

export default app;
