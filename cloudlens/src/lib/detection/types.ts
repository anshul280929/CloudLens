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

/**
 * A scored & deduplicated detection — the output of the
 * confidence scoring + deduplication pipeline (Task 4B).
 *
 * Each `ScoredDetection` represents a **unique service** detected
 * in the repository, with its final confidence score and the best
 * piece of evidence chosen from all raw detections.
 */
export interface ScoredDetection {
  /** Canonical service name. */
  serviceName: string;

  /** Cloud provider. */
  provider: string;

  /** Functional category. */
  serviceCategory: ServiceCategory;

  /**
   * Final confidence score (0–1), computed from base scores
   * and multi-source boosting. Capped at 1.0.
   */
  confidenceScore: number;

  /**
   * The detection source that produced the **highest** base score
   * (used as the primary `detectionSource` for DB persistence).
   */
  detectionSource: DetectionSource;

  /** Evidence file from the highest-scoring detection. */
  evidenceFile: string;

  /** Evidence line from the highest-scoring detection. */
  evidenceLine?: number;

  /** Evidence snippet from the highest-scoring detection. */
  evidenceSnippet: string;

  /**
   * All distinct detection sources that contributed to this
   * service detection (e.g. ["import", "dependency", "envVar"]).
   */
  allSources: DetectionSource[];

  /** Total number of raw detections before deduplication. */
  rawDetectionCount: number;
}

