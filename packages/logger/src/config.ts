import { oneOf } from '@app/config';

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
};
