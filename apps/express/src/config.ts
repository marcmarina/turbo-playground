import { integer, oneOf } from '@app/config';
import dotenv from 'dotenv';
import path from 'path';

const envFilePath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envFilePath });

export const port = integer('PORT');

export const morganFormat = oneOf('MORGAN_FORMAT', [
  'combined',
  'common',
  'dev',
  'short',
  'tiny',
]);
