import { integer, oneOf } from '@app/config';

export const morganFormat = oneOf('MORGAN_FORMAT', [
  'combined',
  'common',
  'dev',
  'short',
  'tiny',
]);

export const port = integer('PORT');
