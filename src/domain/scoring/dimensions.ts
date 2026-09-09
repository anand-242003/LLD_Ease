import { Diagram, ClassNode, Relationship, ScoreDimension } from '../types';
import { lint } from '../lint';
import { isNameMatch } from './nameMatch';

export interface ClassMatchPair {
  userNode: ClassNode;
  refNode: ClassNode;
}

/**
 * Dimension 1: Classes identified (30% weight)
 * Fraction of reference classes matched by some user class.
 */
export function computeClassesIdentified(
  matchedPairs: ClassMatchPair[],
  refNodes: ClassNode[]
): ScoreDimension {
  const totalRef = refNodes.length;
  const score = totalRef === 0 ? 100 : Math.round((matchedPairs.length / totalRef) * 100);
  return {
    key: 'classes',
    label: 'Classes identified',
    score: Math.min(100, Math.max(0, score)),
    weight: 0.30,
  };
}

/**
 * Dimension 2: Correct kinds (15% weight)
 * Of matched classes, fraction whose kind equals the reference kind.
 */
export function computeCorrectKinds(
  matchedPairs: ClassMatchPair[]
): ScoreDimension {
  if (matchedPairs.length === 0) {
    return {
      key: 'kinds',
      label: 'Correct kinds',
      score: 0,
      weight: 0.15,
    };
  }

  const correct = matchedPairs.filter((p) => p.userNode.kind === p.refNode.kind).length;
  const score = Math.round((correct / matchedPairs.length) * 100);
  return {
    key: 'kinds',
    label: 'Correct kinds',
    score: Math.min(100, Math.max(0, score)),
    weight: 0.15,
  };
}

/**
 * Dimension 3: Relationships (30% weight)
 * Fraction of reference edges reproduced between matched endpoints, with the correct relationship type.
 * A present-but-wrong-type edge scores half.
 */
export function computeRelationships(
  matchedPairs: ClassMatchPair[],
  userEdges: Relationship[],
  refEdges: Relationship[]
): ScoreDimension {
  const totalRefEdges = refEdges.length;
  if (totalRefEdges === 0) {
    return {
      key: 'relationships',
      label: 'Relationships',
      score: 100,
      weight: 0.30,
    };
  }

  // Map refNodeId -> userNodeId
  const refToUserMap = new Map<string, string>();
  for (const pair of matchedPairs) {
    refToUserMap.set(pair.refNode.id, pair.userNode.id);
  }

  let totalEdgeScore = 0;

  for (const refEdge of refEdges) {
    const uSourceId = refToUserMap.get(refEdge.sourceId);
    const uTargetId = refToUserMap.get(refEdge.targetId);

    if (!uSourceId || !uTargetId) {
      // Endpoints not matched in user attempt
      continue;
    }

    // Look for matching user edge between these endpoints
    // Check exact direction first
    const directMatch = userEdges.find(
      (e) => e.sourceId === uSourceId && e.targetId === uTargetId
    );

    if (directMatch) {
      if (directMatch.type === refEdge.type) {
        totalEdgeScore += 1.0;
      } else {
        totalEdgeScore += 0.5; // present-but-wrong-type
      }
      continue;
    }

    // Check inverted direction (user drew arrow backwards or symmetric)
    const reverseMatch = userEdges.find(
      (e) => e.sourceId === uTargetId && e.targetId === uSourceId
    );

    if (reverseMatch) {
      // Inverted direction with same or different type
      totalEdgeScore += 0.5;
    }
  }

  const score = Math.round((totalEdgeScore / totalRefEdges) * 100);
  return {
    key: 'relationships',
    label: 'Relationships',
    score: Math.min(100, Math.max(0, score)),
    weight: 0.30,
  };
}

/**
 * Dimension 4: Members (15% weight)
 * Of matched classes, mean fraction of reference attribute+method names present.
 */
export function computeMembers(
  matchedPairs: ClassMatchPair[]
): ScoreDimension {
  if (matchedPairs.length === 0) {
    return {
      key: 'members',
      label: 'Members',
      score: 0,
      weight: 0.15,
    };
  }

  let totalFraction = 0;

  for (const { userNode, refNode } of matchedPairs) {
    const refMemberNames = [
      ...refNode.attributes.map((a) => a.name),
      ...refNode.methods.map((m) => m.name),
    ].filter(Boolean);

    if (refMemberNames.length === 0) {
      totalFraction += 1.0;
      continue;
    }

    const userMemberNames = [
      ...userNode.attributes.map((a) => a.name),
      ...userNode.methods.map((m) => m.name),
    ].filter(Boolean);

    let matchedMemberCount = 0;
    for (const refMem of refMemberNames) {
      const found = userMemberNames.some((userMem) => isNameMatch(userMem, refMem));
      if (found) {
        matchedMemberCount++;
      }
    }

    totalFraction += matchedMemberCount / refMemberNames.length;
  }

  const score = Math.round((totalFraction / matchedPairs.length) * 100);
  return {
    key: 'members',
    label: 'Members',
    score: Math.min(100, Math.max(0, score)),
    weight: 0.15,
  };
}

/**
 * Dimension 5: Cleanliness (10% weight)
 * 100 - 10 × (number of lint issues), floored at 0.
 */
export function computeCleanliness(
  attempt: Diagram
): { dimension: ScoreDimension; issueCount: number } {
  const issues = lint(attempt);
  const issueCount = issues.length;
  const score = Math.max(0, 100 - 10 * issueCount);
  return {
    dimension: {
      key: 'cleanliness',
      label: 'Cleanliness',
      score,
      weight: 0.10,
    },
    issueCount,
  };
}
