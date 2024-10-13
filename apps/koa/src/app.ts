import Koa from 'koa';
import Router from 'koa-router';
import morgan from 'morgan';

import * as config from './config';
import { getStore, httpContextWrapper } from '@app/context';

const app = new Koa();

app.use((ctx, next) => {
  httpContextWrapper(next);
});

app.use((ctx, next) => {
  const requestId = ctx.get('x-request-id') || crypto.randomUUID();

  ctx.set('x-request-id', requestId);

  const store = getStore();

  store?.set('requestId', requestId);

  next();
});

app.use((ctx, next) => {
  morgan(config.morganFormat)(ctx.req, ctx.res, next);
});

const router = new Router();

app.use(router.routes());

router.get('/_health', (ctx) => {
  ctx.body = 'OK';
});

app.use((ctx) => {
  ctx.status = 404;
  ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
});

export default app;
