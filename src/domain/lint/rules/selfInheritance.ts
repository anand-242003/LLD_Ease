import { Diagram, Issue, Language } from '../../types';

export function selfInheritance(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  for (const edge of diagram.edges) {
    if ((edge.type === 'INHERIT' || edge.type === 'REALIZE') && edge.sourceId === edge.targetId) {
      const node = nodeMap.get(edge.sourceId);
      if (node) {
        issues.push({
          id: `r11-${edge.id}`,
          severity: 'error',
          subjectNodeId: node.id,
          subjectName: node.name,
          message: `"${node.name}" can't inherit from itself.`,
          ruleId: 'r11-self-inheritance',
        });
      }
    }
  }

  return issues;
}
