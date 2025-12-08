import path from "node:path";

import dotenv from "dotenv";

const isDocker = process.env.IS_DOCKER === "true";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: !isDocker });
