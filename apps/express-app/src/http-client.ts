import axios from 'axios';
import * as config from './config';

export const httpClient = axios.create({
  baseURL: config.api.host,
});
