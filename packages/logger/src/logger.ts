import pino from 'pino';
import pinoHttp from 'pino-http';

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

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const requestIdHeader = req.headers['x-request-id'];

    if (requestIdHeader) return requestIdHeader;

    return crypto.randomUUID();
  },
  customLogLevel: (req, res) => {
    if (res.statusCode >= 400) {
      return 'error';
    }

    return 'info';
  },
});
