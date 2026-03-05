import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod/v4';

import { logger } from '@app/logger';

export function createServer() {
  const app = Fastify({
    loggerInstance: logger,
  })
    .withTypeProvider<ZodTypeProvider>()
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler);

  app.post(
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

  app.get('/_health', async () => {
    return 'OK';
  });

  return app;
}
