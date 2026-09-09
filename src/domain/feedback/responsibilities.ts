import { Diagram } from '../types';
import { FeedbackFinding } from './types';
import { normalise } from '../scoring/nameMatch';

export function analyzeResponsibilities(diagram: Diagram): FeedbackFinding[] {
  const findings: FeedbackFinding[] = [];
  const nodes = diagram.nodes;
  if (nodes.length === 0) return findings;

  // Calculate member counts
  const memberCounts = nodes.map((n) => n.attributes.length + n.methods.length);
  const sortedCounts = [...memberCounts].sort((a, b) => a - b);
  const mid = Math.floor(sortedCounts.length / 2);
  const midVal = sortedCounts[mid] ?? 0;
  const prevVal = sortedCounts[mid - 1] ?? midVal;
  const median: number =
    sortedCounts.length % 2 === 0
      ? (prevVal + midVal) / 2
      : midVal;

  // 1. God-class check: > 2x median AND >= 8 members
  for (const node of nodes) {
    const totalMembers = node.attributes.length + node.methods.length;
    if (totalMembers >= 8 && totalMembers > 2 * Math.max(median, 2)) {
      findings.push({
        id: `resp-god-class-${node.id}`,
        lens: 'responsibilities',
        severity: 'concern',
        subjectNodeIds: [node.id],
        subjectEdgeIds: [],
        title: `Oversized class: ${node.name}`,
        explanation: `\`${node.name}\` defines ${totalMembers} attributes and operations, substantially higher than the diagram median (${median}). It risks becoming a "God Class" that violates the Single Responsibility Principle (SRP).`,
        suggestedFix: `Extract related operations and state into dedicated helper or strategy classes, keeping \`${node.name}\` focused on coordination.`,
      });
    }
  }

  // 2. Misplaced responsibility check: method name matching another node's domain
  for (const node of nodes) {
    for (const method of node.methods) {
      const normMethod = normalise(method.name);
      for (const otherNode of nodes) {
        if (otherNode.id === node.id) continue;
        const normOther = normalise(otherNode.name);
        if (normOther.length > 3 && normMethod.includes(normOther)) {
          // e.g. method 'calculateFee' or 'payFee' on 'ParkingLot', while 'FeeStrategy' or 'Payment' exists
          findings.push({
            id: `resp-misplaced-${node.id}-${method.id}`,
            lens: 'responsibilities',
            severity: 'suggestion',
            subjectNodeIds: [node.id, otherNode.id],
            subjectEdgeIds: [],
            title: `Potential misplaced responsibility: ${method.name}()`,
            explanation: `Method \`${method.name}()\` on \`${node.name}\` appears to handle domain logic belonging to \`${otherNode.name}\`. Centralising operations on the manager increases coupling.`,
            suggestedFix: `Delegate this operation to \`${otherNode.name}\` to maintain clear boundaries and encapsulation.`,
          });
          break; // Avoid multiple flags for same method
        }
      }
    }
  }

  // 3. Positive findings: small, cohesive, focused classes
  let positiveCount = 0;
  for (const node of nodes) {
    const totalMembers = node.attributes.length + node.methods.length;
    if (totalMembers >= 2 && totalMembers <= 6 && node.kind !== 'ENUM') {
      if (positiveCount < 2) {
        findings.push({
          id: `resp-cohesive-${node.id}`,
          lens: 'responsibilities',
          severity: 'positive',
          subjectNodeIds: [node.id],
          subjectEdgeIds: [],
          title: `Cohesive responsibility: ${node.name}`,
          explanation: `\`${node.name}\` has a tight, focused set of ${totalMembers} members with a clear conceptual boundary.`,
        });
        positiveCount++;
      }
    }
  }

  return findings;
}
