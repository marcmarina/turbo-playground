import { integer, oneOf } from '@app/config';

export const port = integer('PORT');

export const morganFormat = oneOf('MORGAN_FORMAT', [
  'combined',
  'common',
  'dev',
  'short',
  'tiny',
]);
