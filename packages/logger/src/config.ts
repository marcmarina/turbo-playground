import { boolean, oneOf } from '@app/config';

export const logger = {
  level: oneOf('LOG_LEVEL', [
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
  ]),
  format: oneOf('LOG_FORMAT', ['json', 'pretty']),
  requestLogging: {
    enabled: boolean('ENABLE_REQUEST_LOGGING'),
  },
};
