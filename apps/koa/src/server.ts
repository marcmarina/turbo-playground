import http from 'http';
import Koa from 'koa';
import Router from 'koa-router';

import { httpContextWrapper, updateStore } from '@app/context';
import { httpLogger, logger } from '@app/logger';

export function createServer() {
  const app = new Koa();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      logger.error(err, 'Internal server error');

      ctx.status = 500;
    }
  });

  app.use(async (ctx, next) => {
    await httpContextWrapper(next);
  });

  app.use(async (ctx, next) => {
    const requestId = ctx.get('x-request-id') || crypto.randomUUID();

    ctx.set('x-request-id', requestId);

    updateStore({
      requestId,
    });

    await next();
  });

  app.use(async (ctx, next) => {
    httpLogger(ctx.req, ctx.res);

    await next();
  });

  const router = new Router();

  app.use(router.routes());

  router.get('/error', async () => {
    throw new Error('Test error');
  });

  router.get('/_health', async (ctx) => {
    ctx.body = 'OK';
  });

  app.use((ctx) => {
    ctx.status = 404;
    ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
  });

  return http.createServer(app.callback());
}
