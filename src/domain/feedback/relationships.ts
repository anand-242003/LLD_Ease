import { Diagram } from '../types';
import { FeedbackFinding } from './types';
import { isNameMatch } from '../scoring/nameMatch';
import { matchClassNodes } from '../scoring';

export function analyzeRelationships(
  userDiagram: Diagram,
  referenceDiagram: Diagram
): FeedbackFinding[] {
  const findings: FeedbackFinding[] = [];
  const refNodes = referenceDiagram.nodes;
  const userNodes = userDiagram.nodes;
  const refEdges = referenceDiagram.edges;
  const userEdges = userDiagram.edges;

  // Build 1-to-1 node match mapping: refId -> userNode
  const matchedPairs = matchClassNodes(userNodes, refNodes);
  const refToUserMap = new Map<string, typeof userNodes[0]>();
  for (const pair of matchedPairs) {
    refToUserMap.set(pair.refNode.id, pair.userNode);
  }

  let positiveCount = 0;

  // Check coupling to concrete classes instead of abstractions
  for (const userEdge of userEdges) {
    const userSrc = userNodes.find((n) => n.id === userEdge.sourceId);
    const userTgt = userNodes.find((n) => n.id === userEdge.targetId);
    if (!userSrc || !userTgt) continue;

    // Is user target a concrete class that implements an interface in the reference?
    const matchedRefTarget = refNodes.find((rn) => isNameMatch(userTgt.name, rn.name));
    if (matchedRefTarget && matchedRefTarget.kind === 'CLASS') {
      // Check if reference has an interface that this class realizes
      const refRealizeEdge = refEdges.find(
        (e) => e.sourceId === matchedRefTarget.id && e.type === 'REALIZE'
      );
      if (refRealizeEdge) {
        const refInterface = refNodes.find((n) => n.id === refRealizeEdge.targetId);
        if (refInterface) {
          findings.push({
            id: `rel-coupled-concrete-${userEdge.id}`,
            lens: 'relationships',
            severity: 'suggestion',
            subjectNodeIds: [userSrc.id, userTgt.id],
            subjectEdgeIds: [userEdge.id],
            title: `Coupled to concrete class: ${userSrc.name} → ${userTgt.name}`,
            explanation: `You connected \`${userSrc.name}\` directly to concrete class \`${userTgt.name}\`. In the reference, this association points to the \`${refInterface.name}\` interface, decoupling \`${userSrc.name}\` from specific implementations.`,
            suggestedFix: `Associate \`${userSrc.name}\` with the \`${refInterface.name}\` interface instead.`,
          });
        }
      }
    }
  }

  // Compare relationships between matched endpoints
  for (const refEdge of refEdges) {
    const userSrc = refToUserMap.get(refEdge.sourceId);
    const userTgt = refToUserMap.get(refEdge.targetId);
    const refSrc = refNodes.find((n) => n.id === refEdge.sourceId);
    const refTgt = refNodes.find((n) => n.id === refEdge.targetId);

    if (!refSrc || !refTgt) continue;

    // If both endpoints are present in user attempt
    if (userSrc && userTgt) {
      const userDirectEdge = userEdges.find(
        (e) => e.sourceId === userSrc.id && e.targetId === userTgt.id
      );

      if (userDirectEdge) {
        if (userDirectEdge.type === refEdge.type) {
          if (positiveCount < 3) {
            findings.push({
              id: `rel-matched-${refEdge.id}`,
              lens: 'relationships',
              severity: 'positive',
              subjectNodeIds: [userSrc.id, userTgt.id],
              subjectEdgeIds: [userDirectEdge.id],
              title: `Accurate relationship: ${userSrc.name} → ${userTgt.name}`,
              explanation: `Correctly modeled ${refEdge.type.toLowerCase()} relationship from \`${userSrc.name}\` to \`${userTgt.name}\`.`,
            });
            positiveCount++;
          }
        } else {
          findings.push({
            id: `rel-wrong-type-${refEdge.id}`,
            lens: 'relationships',
            severity: 'suggestion',
            subjectNodeIds: [userSrc.id, userTgt.id],
            subjectEdgeIds: [userDirectEdge.id],
            title: `Relationship type mismatch: ${userSrc.name} → ${userTgt.name}`,
            explanation: `You used **${userDirectEdge.type}** between \`${userSrc.name}\` and \`${userTgt.name}\`, whereas the reference models this as **${refEdge.type}**.`,
            suggestedFix: `Update relationship type to ${refEdge.type}.`,
          });
        }
      } else {
        // Check if inverted
        const userInvertedEdge = userEdges.find(
          (e) => e.sourceId === userTgt.id && e.targetId === userSrc.id
        );

        if (userInvertedEdge) {
          findings.push({
            id: `rel-inverted-${refEdge.id}`,
            lens: 'relationships',
            severity: 'suggestion',
            subjectNodeIds: [userSrc.id, userTgt.id],
            subjectEdgeIds: [userInvertedEdge.id],
            title: `Inverted relationship direction: ${userTgt.name} → ${userSrc.name}`,
            explanation: `The arrow points from \`${userTgt.name}\` to \`${userSrc.name}\`, but the reference directs dependency from \`${userSrc.name}\` to \`${userTgt.name}\`.`,
            suggestedFix: `Reverse the relationship direction.`,
          });
        } else {
          // Missing relationship between existing classes
          findings.push({
            id: `rel-missing-${refEdge.id}`,
            lens: 'relationships',
            severity: 'concern',
            subjectNodeIds: [userSrc.id, userTgt.id],
            subjectEdgeIds: [],
            title: `Missing relationship: ${userSrc.name} → ${userTgt.name}`,
            explanation: `Both \`${userSrc.name}\` and \`${userTgt.name}\` exist in your diagram, but are not connected. The reference connects them with a ${refEdge.type.toLowerCase()} relationship.`,
            suggestedFix: `Add a ${refEdge.type.toLowerCase()} relationship from \`${userSrc.name}\` to \`${userTgt.name}\`.`,
          });
        }
      }
    }
  }

  return findings;
}
