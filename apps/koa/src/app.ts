import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();

const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hello, world!';
});

app.use(router.routes());

app.use(async (ctx) => {
  ctx.body = `Cannot ${ctx.method} ${ctx.path}`;
});

export default app;
