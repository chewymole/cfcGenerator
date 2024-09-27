import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { copyFile } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const sourceEnvPath = join(__dirname, envFile);
const destEnvPath = join(__dirname, "dist", ".env");

copyFile(sourceEnvPath, destEnvPath, (err) => {
  if (err) throw err;
  console.log(`${envFile} was copied to dist/.env`);
});
