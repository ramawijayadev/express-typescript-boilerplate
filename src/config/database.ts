import "dotenv/config";

export type DbConnectionName = "primary";

export const dbConfig = {
  primary: {
    url: process.env.DATABASE_URL,
  },
};
