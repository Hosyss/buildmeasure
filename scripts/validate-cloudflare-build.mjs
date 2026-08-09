import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PLACEHOLDER_DATABASE_ID = "00000000-0000-4000-8000-000000000000";
const DATABASE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const configPath = resolve(process.argv[2] ?? "dist/server/wrangler.json");

if (!existsSync(configPath)) {
  throw new Error(
    `Cloudflare build config is missing at ${configPath}. Run npm run build first.`,
  );
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const configDirectory = dirname(configPath);
const database = config.d1_databases?.find(
  (candidate) => candidate.binding === "DB",
);

if (config.name !== "buildmeasure") {
  throw new Error("The generated Cloudflare Worker name must be buildmeasure.");
}
if (!database) {
  throw new Error("The generated Cloudflare build is missing the DB binding.");
}
if (
  database.database_id === PLACEHOLDER_DATABASE_ID ||
  !DATABASE_ID_PATTERN.test(database.database_id)
) {
  throw new Error(
    "Set CLOUDFLARE_D1_DATABASE_ID to the production D1 database UUID before deploying.",
  );
}
if (!existsSync(resolve(configDirectory, config.main))) {
  throw new Error("The generated Cloudflare Worker entry point is missing.");
}
if (!existsSync(resolve(configDirectory, config.assets?.directory ?? ""))) {
  throw new Error("The generated Cloudflare static-assets directory is missing.");
}

console.log(
  `Cloudflare build validated for ${config.name} with D1 binding ${database.database_name}.`,
);
