import dotenv from "dotenv";
dotenv.config();

const baseConfig = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
};

export default {
  development: baseConfig,
  preprod: baseConfig,
  production: baseConfig,
};