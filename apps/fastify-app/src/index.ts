import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

import { logger } from '@app/logger';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

const fastify = Fastify({
  loggerInstance: logger,
})
  .withTypeProvider<ZodTypeProvider>()
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler);

fastify.post(
  '/user',
  {
    schema: {
      body: z.object({
        foo: z.string(),
      }),
    },
  },
  async () => {
    return { hello: 'world' };
  },
);

fastify.get('/_health', async () => {
  return 'OK';
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
};

start();
