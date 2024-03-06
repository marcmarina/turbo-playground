import dotenv from 'dotenv';
import path from 'path';

import { integer, oneOf } from '@app/config';

const envFilePath = path.join(__dirname, '../.env');

dotenv.config({
  path: envFilePath,
});

export const morganFormat = oneOf('MORGAN_FORMAT', [
  'combined',
  'common',
  'dev',
  'short',
  'tiny',
]);

export const port = integer('PORT');
