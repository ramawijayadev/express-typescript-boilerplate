import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // fast ramp-up to 100 users
    { duration: '5m', target: 100 }, // stay at 100 users for 5 min
    { duration: '2m', target: 0 }, // ramp-down to 0 users
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
