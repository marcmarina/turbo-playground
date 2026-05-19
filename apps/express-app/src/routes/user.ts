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
  const isOutlier = Math.random() < 0.1;

  const delay = isOutlier ? 50 + Math.random() * 200 : 5 + Math.random() * 50;

  return new Promise((resolve) => setTimeout(resolve, delay));
}

export const userRouter = Router();

userRouter.post('/user', async (req, res) => {
  const { body } = postUserSchema.parse(req);

  await simulateDbLatency();

  res.json(body);
});
