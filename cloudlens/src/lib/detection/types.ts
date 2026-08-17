/**
 * Shared types for the CloudLens detection pipeline.
 *
 * Every parser returns an array of `DetectionResult` — the orchestrator
 * (Phase 4C) aggregates, scores, and deduplicates them before persisting.
 */

import type { ServiceCategory, DetectionSource } from "./registry";

/** A single raw detection emitted by any parser. */
export interface DetectionResult {
  /** Canonical service name as defined in the registry. */
  serviceName: string;

  /** Cloud provider, e.g. "AWS", "GCP". */
  provider: string;

  /** Functional category, e.g. "database", "auth". */
  serviceCategory: ServiceCategory;

  /** How the detection was made. */
  detectionSource: DetectionSource;

  /** Relative file path where evidence was found. */
  evidenceFile: string;

  /** One-indexed line number, when applicable. */
  evidenceLine?: number;

  /** Short snippet of the matching text. */
  evidenceSnippet: string;
}
