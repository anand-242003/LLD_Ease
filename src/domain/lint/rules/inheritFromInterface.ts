import { Diagram, Issue, Language } from '../../types';

export function inheritFromInterface(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  for (const edge of diagram.edges) {
    if (edge.type === 'INHERIT') {
      const target = nodeMap.get(edge.targetId);
      const source = nodeMap.get(edge.sourceId);

      if (target && target.kind === 'INTERFACE') {
        const sourceName = source ? source.name : 'Unknown';
        issues.push({
          id: `r14-${edge.id}`,
          severity: 'warning',
          subjectNodeId: target.id,
          subjectName: target.name,
          message: `"${sourceName}" inherits from interface "${target.name}" — use Realize instead.`,
          ruleId: 'r14-inherit-from-interface',
        });
      }
    }
  }

  return issues;
}
