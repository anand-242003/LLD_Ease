import { Diagram } from '../types';
import { FeedbackFinding } from './types';
import { isNameMatch } from '../scoring/nameMatch';

export function analyzeAbstractions(
  userDiagram: Diagram,
  referenceDiagram: Diagram
): FeedbackFinding[] {
  const findings: FeedbackFinding[] = [];
  const refNodes = referenceDiagram.nodes;
  const userNodes = userDiagram.nodes;
  const refEdges = referenceDiagram.edges;

  // Find polymorphic abstractions in the reference (INTERFACE or ABSTRACT with >= 2 implementations)
  const polymorphicRefNodes = refNodes.filter((rn) => {
    if (rn.kind !== 'INTERFACE' && rn.kind !== 'ABSTRACT') return false;
    const implementers = refEdges.filter(
      (e) =>
        e.targetId === rn.id && (e.type === 'REALIZE' || e.type === 'INHERIT')
    );
    return implementers.length >= 2;
  });

  for (const refAbs of polymorphicRefNodes) {
    const userMatch = userNodes.find((un) => isNameMatch(un.name, refAbs.name));

    if (userMatch) {
      if (userMatch.kind === 'INTERFACE' || userMatch.kind === 'ABSTRACT') {
        findings.push({
          id: `abs-positive-${refAbs.id}`,
          lens: 'abstractions',
          severity: 'positive',
          subjectNodeIds: [userMatch.id],
          subjectEdgeIds: [],
          title: `Effective abstraction: ${userMatch.name}`,
          explanation: `Your design correctly introduces the \`${userMatch.name}\` ${userMatch.kind.toLowerCase()} to capture variation cleanly through polymorphism.`,
        });
      } else {
        findings.push({
          id: `abs-concrete-variation-${refAbs.id}`,
          lens: 'abstractions',
          severity: 'suggestion',
          subjectNodeIds: [userMatch.id],
          subjectEdgeIds: [],
          title: `Concrete abstraction: ${userMatch.name}`,
          explanation: `\`${userMatch.name}\` is modelled as a concrete Class. In the reference, this is an ${refAbs.kind.toLowerCase()} to enforce the contract and prevent direct instantiation.`,
          suggestedFix: `Change kind of \`${userMatch.name}\` to ${refAbs.kind === 'INTERFACE' ? 'Interface' : 'Abstract Class'}.`,
        });
      }
    } else {
      // Missing abstraction! Find which user node likely absorbs the responsibility
      // Look at reference nodes that associate or depend on this abstraction (e.g. ParkingLot -> FeeStrategy)
      const callerRefEdges = refEdges.filter(
        (e) => e.targetId === refAbs.id && (e.type === 'ASSOCIATE' || e.type === 'COMPOSE' || e.type === 'AGGREGATE')
      );
      const callerRefNodeIds = callerRefEdges.map((e) => e.sourceId);
      const matchedCallerUserNodes = userNodes.filter((un) =>
        callerRefNodeIds.some((cid) => {
          const rn = refNodes.find((r) => r.id === cid);
          return rn && isNameMatch(un.name, rn.name);
        })
      );

      const firstCaller = matchedCallerUserNodes[0];
      const firstUser = userNodes[0];
      const subjectNodeIds = firstCaller ? [firstCaller.id] : firstUser ? [firstUser.id] : [];

      findings.push({
        id: `abs-missing-${refAbs.id}`,
        lens: 'abstractions',
        severity: 'concern',
        subjectNodeIds,
        subjectEdgeIds: [],
        title: `Missing abstraction: ${refAbs.name}`,
        explanation: `The reference introduces a \`${refAbs.name}\` ${refAbs.kind.toLowerCase()} because domain behavior varies across multiple strategies. Your design doesn't have an equivalent abstraction; consider extracting one so new variants don't require modifying existing classes (Open/Closed Principle).`,
        suggestedFix: `Create an \`${refAbs.name}\` ${refAbs.kind.toLowerCase()} and program to this interface instead of hardcoding variants.`,
      });
    }
  }

  return findings;
}
