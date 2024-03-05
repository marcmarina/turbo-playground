import express from 'express';
import packageJson from '../package.json';

const app = express();

app.use(express.json());

app.get('/favicon.ico', (req, res) => {
  return res.status(204).send();
});

app.get('/_health', (req, res) => {
  res.send(`OK`);
});

app.get('/', (req, res) => {
  res.send(packageJson);
});

app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

export default app;
