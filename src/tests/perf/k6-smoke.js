/**
 * K6 Smoke Test.
 * Validates system availability under minimal load.
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(99)<1500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1";

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}
