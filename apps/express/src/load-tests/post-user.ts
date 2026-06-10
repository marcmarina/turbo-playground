import { check, sleep } from 'k6';
import http from 'k6/http';
import { RefinedResponse, ResponseType } from 'k6/http';
import { Rate, Trend } from 'k6/metrics';
import { Options } from 'k6/options';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time', true);

const BASE_URL = 'https://turbo-express.marc-lab.dev';
// const BASE_URL =   'http://localhost:8080';

export const options: Options = {
  stages: [
    { duration: '30s', target: 100 }, // ramp up
    { duration: '1m', target: 100 }, // steady state
    { duration: '30s', target: 500 }, // spike
    { duration: '1m', target: 500 }, // hold spike
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<30', 'p(99)<30'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.0001'],
  },
};

export default function (): void {
  const res: RefinedResponse<ResponseType> = http.post(
    `${BASE_URL}/user`,
    JSON.stringify({
      userId: '1',
      name: 'John Doe',
      email: 'john@doe.com',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  responseTime.add(res.timings.duration);

  const ok = check(res, {
    'status is 200': (r) => {
      return r.status === 200;
    },
  });
  errorRate.add(!ok);

  sleep(1);
}
