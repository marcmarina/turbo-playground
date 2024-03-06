import Koa from 'koa';
import Router from 'koa-router';
import morgan from 'morgan';

import * as config from './config';

const app = new Koa();

const healthRouter = new Router();

healthRouter.get('/_health', (ctx) => {
  ctx.body = 'OK';
});

app.use(healthRouter.routes());

app.use((ctx, next) => {
  morgan(config.morganFormat)(ctx.req, ctx.res, next);
});

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hello, world!';
});

app.use(router.routes());

app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
});

export default app;
