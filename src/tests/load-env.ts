import path from "node:path";

import dotenv from "dotenv";

const isDocker = process.env.IS_DOCKER === "true";
// Load .env.test and override existing variables if NOT in Docker
dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: !isDocker });
