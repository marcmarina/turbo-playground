import { Router } from 'express';

const leaks: Buffer[] = [];

export const resourcesRouter = Router();

resourcesRouter.get('/stress/cpu', (req, res) => {
  const durationMs = parseInt(req.query.duration as string) || 5000;
  const end = Date.now() + durationMs;
  while (Date.now() < end) {
    Math.sqrt(Math.random());
  }
  res.json({ duration: `${durationMs}ms` });
});

resourcesRouter.get('/stress/memory', (req, res) => {
  const mb = parseInt(req.query.mb as string) || 100;
  for (let i = 0; i < mb; i++) {
    leaks.push(Buffer.alloc(1024 * 1024, 1));
  }
  res.json({
    requested: `${mb}MB`,
    heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`,
    rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB`,
  });
});

resourcesRouter.get('/stress/memory/release', (_req, res) => {
  leaks.length = 0;
  global.gc?.();
  res.json({ released: true });
});

resourcesRouter.get('/stress/memory/status', (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
    rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(1)}MB`,
    leakedBuffers: leaks.length,
  });
});

// Async variant — does not block the event loop
resourcesRouter.get('/stress/cpu/async', async (req, res) => {
  const iterations = parseInt(req.query.iterations as string) || 1_000_000;
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i);
    // yield to event loop every 10k iterations
    if (i % 10_000 === 0) {
      await new Promise((r) => setImmediate(r));
    }
  }
  res.json({ iterations, result });
});

resourcesRouter.get('/stress/latency', async (req, res) => {
  const ms = parseInt(req.query.ms as string) || 1000;
  await new Promise((r) => setTimeout(r, ms));
  res.json({ delayed: `${ms}ms` });
});

resourcesRouter.get('/stress/error', (_req, _res) => {
  throw new Error('Deliberate stress error');
});
