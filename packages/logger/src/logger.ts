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
  genReqId: (req, res) => {
    const requestIdHeader =
      req.headers['x-request-id'] || res.getHeader('x-request-id');

    if (requestIdHeader) return requestIdHeader;

    return crypto.randomUUID();
  },
  customLogLevel: (req, res, err) => {
    if (400 <= res.statusCode && res.statusCode < 500) {
      return 'warn';
    } else if (500 <= res.statusCode) {
      return 'error';
    }

    return 'info';
  },
});
