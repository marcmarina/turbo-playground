import { integer, string } from '@app/config';

export const port = integer('PORT');

export const database = {
  host: string('DB_HOST'),
  port: integer('DB_PORT'),
  database: string('DB_NAME'),
  user: string('DB_USER'),
  password: string('DB_PASSWORD'),
};
