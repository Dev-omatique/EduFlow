import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("GitHub secret DATABASE_URL_TEST is missing or empty.");
  process.exit(1);
}

let target;
try {
  target = new URL(databaseUrl);
} catch {
  console.error("GitHub secret DATABASE_URL_TEST is not a valid PostgreSQL URL.");
  process.exit(1);
}

const databaseName = target.pathname.replace(/^\//, "") || "unknown";
console.log(`Checking PostgreSQL at ${target.hostname}:${target.port || 5432}/${databaseName}.`);

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
});

try {
  await sequelize.authenticate();
  console.log("PostgreSQL connection successful.");
} catch (error) {
  const code = error.original?.code || error.parent?.code || "unknown";
  let message = String(error.message || "No error message provided.")
    .replaceAll(databaseUrl, "[DATABASE_URL_TEST redacted]");
  if (target.password) message = message.replaceAll(target.password, "[password redacted]");

  console.error(`PostgreSQL connection failed (${error.name || "Error"}, ${code}): ${message}`);
  process.exitCode = 1;
} finally {
  await sequelize.close().catch(() => {});
}