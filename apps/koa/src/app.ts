import http from 'http';
import Koa from 'koa';
import Router from 'koa-router';

import { getStore, httpContextWrapper } from '@app/context';
import { httpLogger } from '@app/logger';

export function createServer() {
  const app = new Koa();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  });

  app.use(async (ctx, next) => {
    await httpContextWrapper(next);
  });

  app.use(async (ctx, next) => {
    const requestId = ctx.get('x-request-id') || crypto.randomUUID();

    ctx.set('x-request-id', requestId);

    const store = getStore();

    store?.set('requestId', requestId);

    await next();
  });

  app.use(async (ctx, next) => {
    httpLogger(ctx.req, ctx.res);

    await next();
  });

  const router = new Router();

  app.use(router.routes());

  router.get('/_health', async (ctx) => {
    ctx.body = 'OK';
  });

  app.use((ctx) => {
    ctx.status = 404;
    ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
  });

  return http.createServer(app.callback());
}
