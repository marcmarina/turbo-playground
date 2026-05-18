import { Router } from 'express';
import { z } from 'zod';

const postUserSchema = z.object({
  body: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.email(),
  }),
});

function simulateDbLatency(): Promise<void> {
  // 10% chance of an outlier (500–2000ms), otherwise 50–250ms
  const isOutlier = Math.random() < 0.1;

  const delay = isOutlier
    ? 500 + Math.random() * 1500
    : 50 + Math.random() * 200;

  return new Promise((resolve) => setTimeout(resolve, delay));
}

export const userRouter = Router();

userRouter.post('/user', async (req, res) => {
  const { body } = postUserSchema.parse(req);

  await simulateDbLatency();

  res.json(body);
});
