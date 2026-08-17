/**
 * Barrel export for all detection parsers.
 *
 * Import from `@/lib/detection/parsers` to get every parser's
 * public API in one place.
 */

// Dependency manifest parser (package.json, requirements.txt, go.mod, …)
export { parseDependencyFile, isDependencyFile } from "./dependencies";

// Configuration file parser (.env, vercel.json, docker-compose.yml, …)
export { parseConfigFile, isConfigFile } from "./config";

// Import statement parser (JS/TS/Python/Go/Java SDK imports)
export { parseImports, isImportableFile } from "./imports";

// Environment variable parser (process.env.*, os.environ, $VAR, …)
export { parseEnvVars, isEnvVarRelevantFile } from "./envVars";

// CI/CD pipeline parser (GitHub Actions, GitLab CI, Dockerfile, …)
export { parseCicdFile, isCicdFile } from "./cicd";
