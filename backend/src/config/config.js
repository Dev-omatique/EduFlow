import dotenv from "dotenv";
dotenv.config();

export default {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },

  preprod: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },

  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
};
