import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 }, // ramp-up to 50 users
    { duration: '3h', target: 50 }, // stay at 50 users for 3 hours
    { duration: '2m', target: 0 }, // ramp-down
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
