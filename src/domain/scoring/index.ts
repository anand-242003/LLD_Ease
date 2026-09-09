import {
  Diagram,
  ClassNode,
  ScoreResult,
  GradeBand,
  ScoreMatchedClass,
  ScoreMissingClass,
  ScoreExtraClass,
} from '../types';
import { isNameMatch, levenshteinRatio, normalise } from './nameMatch';
import {
  ClassMatchPair,
  computeClassesIdentified,
  computeCorrectKinds,
  computeRelationships,
  computeMembers,
  computeCleanliness,
} from './dimensions';

export * from './nameMatch';
export * from './dimensions';

function generateMissingHint(refNode: ClassNode): string {
  const kindName = refNode.kind.toLowerCase();
  if (refNode.methods.length > 0 && refNode.methods[0]) {
    const mainMethod = refNode.methods[0].name;
    return `The reference defines a ${kindName} \`${refNode.name}\` responsible for operations like \`${mainMethod}()\`.`;
  }
  return `The reference introduces a ${kindName} \`${refNode.name}\` to structure domain responsibilities.`;
}

export function matchClassNodes(
  userNodes: ClassNode[],
  refNodes: ClassNode[]
): ClassMatchPair[] {
  interface CandidateMatch {
    userNode: ClassNode;
    refNode: ClassNode;
    ratio: number;
  }

  const candidates: CandidateMatch[] = [];
  for (const userNode of userNodes) {
    for (const refNode of refNodes) {
      if (isNameMatch(userNode.name, refNode.name)) {
        const ratio = levenshteinRatio(
          normalise(userNode.name),
          normalise(refNode.name)
        );
        candidates.push({ userNode, refNode, ratio });
      }
    }
  }

  // Sort descending by similarity ratio
  candidates.sort((a, b) => b.ratio - a.ratio);

  const matchedPairs: ClassMatchPair[] = [];
  const matchedUserIds = new Set<string>();
  const matchedRefIds = new Set<string>();

  for (const candidate of candidates) {
    if (
      !matchedUserIds.has(candidate.userNode.id) &&
      !matchedRefIds.has(candidate.refNode.id)
    ) {
      matchedPairs.push({
        userNode: candidate.userNode,
        refNode: candidate.refNode,
      });
      matchedUserIds.add(candidate.userNode.id);
      matchedRefIds.add(candidate.refNode.id);
    }
  }

  return matchedPairs;
}

/**
 * Pure scoring function comparing user attempt diagram against the reference diagram.
 * Implements PRD §9.6 and §16.2.
 */
export function scoreAgainstReference(
  attempt: Diagram,
  reference: Diagram
): ScoreResult {
  const userNodes = attempt.nodes;
  const refNodes = reference.nodes;

  // Step 1: Pair user nodes to reference nodes greedily based on highest similarity ratio
  const matchedPairs = matchClassNodes(userNodes, refNodes);
  const matchedUserIds = new Set(matchedPairs.map((p) => p.userNode.id));
  const matchedRefIds = new Set(matchedPairs.map((p) => p.refNode.id));

  // Step 2: Build matched, missing, and extra lists
  const matched: ScoreMatchedClass[] = matchedPairs.map((p) => ({
    referenceName: p.refNode.name,
    userName: p.userNode.name,
  }));

  const missing: ScoreMissingClass[] = refNodes
    .filter((r) => !matchedRefIds.has(r.id))
    .map((r) => ({
      name: r.name,
      kind: r.kind,
      hint: generateMissingHint(r),
    }));

  const extra: ScoreExtraClass[] = userNodes
    .filter((u) => !matchedUserIds.has(u.id))
    .map((u) => ({
      name: u.name,
    }));

  // Step 3: Compute 5 dimensions
  const dimClasses = computeClassesIdentified(matchedPairs, refNodes);
  const dimKinds = computeCorrectKinds(matchedPairs);
  const dimRelationships = computeRelationships(
    matchedPairs,
    attempt.edges,
    reference.edges
  );
  const dimMembers = computeMembers(matchedPairs);
  const { dimension: dimCleanliness, issueCount } = computeCleanliness(attempt);

  const dimensions = [
    dimClasses,
    dimKinds,
    dimRelationships,
    dimMembers,
    dimCleanliness,
  ];

  // Weighted sum rounded to nearest integer (0-100)
  const weightedSum =
    dimClasses.score * dimClasses.weight +
    dimKinds.score * dimKinds.weight +
    dimRelationships.score * dimRelationships.weight +
    dimMembers.score * dimMembers.weight +
    dimCleanliness.score * dimCleanliness.weight;

  const total = Math.min(100, Math.max(0, Math.round(weightedSum)));

  // Determine grade band
  let gradeBand: GradeBand = 'Keep going';
  if (total >= 90) {
    gradeBand = 'Excellent';
  } else if (total >= 75) {
    gradeBand = 'Strong';
  } else if (total >= 60) {
    gradeBand = 'Fair';
  }

  return {
    total,
    gradeBand,
    dimensions,
    matched,
    missing,
    extra,
    issueCount,
  };
}
