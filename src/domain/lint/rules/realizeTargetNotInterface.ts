import { Diagram, Issue, Language } from '../../types';

export function realizeTargetNotInterface(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  for (const edge of diagram.edges) {
    if (edge.type === 'REALIZE') {
      const target = nodeMap.get(edge.targetId);
      const source = nodeMap.get(edge.sourceId);

      if (target && target.kind !== 'INTERFACE') {
        const sourceName = source ? source.name : 'Unknown';
        issues.push({
          id: `r1-${edge.id}`,
          severity: 'warning',
          subjectNodeId: target.id,
          subjectName: target.name,
          message: `"${sourceName}" realizes "${target.name}" which is not an interface.`,
          ruleId: 'r1-realize-target-interface',
        });
      }
    }
  }

  return issues;
}
