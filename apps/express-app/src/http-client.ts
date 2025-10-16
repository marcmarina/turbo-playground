import axios from 'axios';
import http from 'http';

import * as config from './config';

export const httpClient = axios.create({
  baseURL: config.api.host,
  httpAgent: new http.Agent({
    keepAlive: false,
  }),
});
