import { Diagram, Issue, Language } from '../../types';

export function multipleInheritance(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const inheritCount = new Map<string, number>();

  for (const edge of diagram.edges) {
    if (edge.type === 'INHERIT') {
      inheritCount.set(edge.sourceId, (inheritCount.get(edge.sourceId) ?? 0) + 1);
    }
  }

  for (const node of diagram.nodes) {
    if ((inheritCount.get(node.id) ?? 0) > 1) {
      issues.push({
        id: `r5-${node.id}`,
        severity: 'warning',
        subjectNodeId: node.id,
        subjectName: node.name,
        message: `"${node.name}" inherits from more than one class.`,
        ruleId: 'r5-multiple-inheritance',
      });
    }
  }

  return issues;
}
