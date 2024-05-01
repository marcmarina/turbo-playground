import pino from 'pino';

import * as config from './config';

export const logger = pino({
  level: config.logger.level,
  ...(config.logger.format === 'pretty' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});
