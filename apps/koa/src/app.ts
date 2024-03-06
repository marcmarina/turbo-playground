import Koa from 'koa';
import Router from 'koa-router';
import morgan from 'morgan';

import * as config from './config';

const app = new Koa();

const router = new Router();

app.use((ctx, next) => {
  morgan(config.morganFormat)(ctx.req, ctx.res, next);
});

router.get('/', (ctx) => {
  ctx.body = 'Hello, world!';
});

app.use(router.routes());

app.use(async (ctx) => {
  ctx.status = 400;
  ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
});

export default app;
