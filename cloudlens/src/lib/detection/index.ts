/**
 * CloudLens Detection Engine — barrel export.
 *
 * Re-exports the registry, shared types, and all parsers from a
 * single entry point:  `import { … } from "@/lib/detection"`
 */

export { SERVICE_REGISTRY, packageToService, envPrefixToService, configPatternToService, cicdReferenceToService } from "./registry";
export type { ServiceDefinition, ServiceCategory, DetectionSource } from "./registry";

export type { DetectionResult, ScoredDetection } from "./types";

export { getBaseScore, scoreAndDeduplicate } from "./scoring";

export {
  parseDependencyFile,
  isDependencyFile,
  parseConfigFile,
  isConfigFile,
  parseImports,
  isImportableFile,
  parseEnvVars,
  isEnvVarRelevantFile,
  parseCicdFile,
  isCicdFile,
} from "./parsers";

export { scanRepository } from "./scanner";
export type { ScanResult } from "./scanner";

