/**
 * Confidence Scoring & Deduplication (Tasks 4.7 + 4.8)
 *
 * Takes the raw `DetectionResult[]` emitted by all parsers and produces
 * a deduplicated `ScoredDetection[]` — one entry per unique service —
 * with a final confidence score derived from:
 *
 *   1. **Base score** per detection source:
 *        import  → 0.90
 *        dependency → 0.85
 *        config  → 0.80
 *        cicd    → 0.70
 *        envVar  → 0.50
 *
 *   2. **Multi-source boost**: when multiple distinct source types
 *      detect the same service, each additional source adds a
 *      +0.05 bonus (capped at 1.0).
 *
 * The best (highest base-score) detection is kept as the primary
 * evidence; all contributing sources are recorded in `allSources`.
 */

import type { DetectionSource } from "./registry";
import type { DetectionResult, ScoredDetection } from "./types";

// ---------------------------------------------------------------------------
// Base score table  (Task 4.7)
// ---------------------------------------------------------------------------

/** Base confidence score assigned to each detection source type. */
const BASE_SCORES: Record<DetectionSource, number> = {
  import: 0.9,
  dependency: 0.85,
  config: 0.8,
  cicd: 0.7,
  envVar: 0.5,
};

/**
 * Bonus added for each **additional** distinct detection source
 * beyond the first one (e.g. found via both import AND dependency).
 */
const MULTI_SOURCE_BOOST = 0.05;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the base confidence score for a single raw detection.
 *
 * @param source - The detection source type
 * @returns A number between 0 and 1
 */
export function getBaseScore(source: DetectionSource): number {
  return BASE_SCORES[source] ?? 0.5;
}

/**
 * Score and deduplicate an array of raw detections.
 *
 * This is the main entry point used by the scan orchestrator (Task 4C).
 *
 * Algorithm:
 *   1. Group raw detections by canonical service name.
 *   2. For each group, determine the highest base score among all
 *      detections and identify the best evidence.
 *   3. Apply a multi-source boost: +0.05 per additional unique
 *      source type (capped at 1.0).
 *   4. Return one `ScoredDetection` per unique service.
 *
 * @param rawDetections - All raw detections from all parsers
 * @returns Deduplicated array sorted by confidence score (desc)
 */
export function scoreAndDeduplicate(
  rawDetections: DetectionResult[],
): ScoredDetection[] {
  // ---- Step 1: Group by service name ----
  const groups = new Map<string, DetectionResult[]>();

  for (const det of rawDetections) {
    const key = det.serviceName;
    const existing = groups.get(key);
    if (existing) {
      existing.push(det);
    } else {
      groups.set(key, [det]);
    }
  }

  // ---- Step 2 + 3: Score each group ----
  const scored: ScoredDetection[] = [];

  for (const [, detections] of groups) {
    // Collect unique source types
    const uniqueSources = new Set<DetectionSource>();
    for (const d of detections) {
      uniqueSources.add(d.detectionSource);
    }

    // Find the detection with the highest base score (best evidence)
    let bestDetection = detections[0];
    let highestBase = getBaseScore(detections[0].detectionSource);

    for (let i = 1; i < detections.length; i++) {
      const base = getBaseScore(detections[i].detectionSource);
      if (base > highestBase) {
        highestBase = base;
        bestDetection = detections[i];
      }
    }

    // Multi-source boost: +0.05 for each extra unique source type
    const extraSources = Math.max(0, uniqueSources.size - 1);
    const boost = extraSources * MULTI_SOURCE_BOOST;
    const finalScore = Math.min(1.0, highestBase + boost);

    scored.push({
      serviceName: bestDetection.serviceName,
      provider: bestDetection.provider,
      serviceCategory: bestDetection.serviceCategory,
      confidenceScore: parseFloat(finalScore.toFixed(4)),
      detectionSource: bestDetection.detectionSource,
      evidenceFile: bestDetection.evidenceFile,
      evidenceLine: bestDetection.evidenceLine,
      evidenceSnippet: bestDetection.evidenceSnippet,
      allSources: Array.from(uniqueSources),
      rawDetectionCount: detections.length,
    });
  }

  // ---- Step 4: Sort by confidence (descending), then by name ----
  scored.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return a.serviceName.localeCompare(b.serviceName);
  });

  return scored;
}
