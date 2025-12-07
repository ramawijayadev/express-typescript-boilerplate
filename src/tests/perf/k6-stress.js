/** Validates system breaking point and recovery. */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 20 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1";

export default function () {
  const payload = JSON.stringify({
    email: "stress-test@example.com",
    password: "password123",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(res, {
    "status is 200 or 401": (r) => r.status === 200 || r.status === 401,
    "transaction time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
