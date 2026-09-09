import { Diagram, Issue, Language } from '../../types';

export function duplicateClassName(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nameCounts = new Map<string, number>();

  for (const node of diagram.nodes) {
    const trimmed = node.name.trim();
    if (trimmed) {
      nameCounts.set(trimmed, (nameCounts.get(trimmed) ?? 0) + 1);
    }
  }

  for (const node of diagram.nodes) {
    const trimmed = node.name.trim();
    if (trimmed && (nameCounts.get(trimmed) ?? 0) > 1) {
      issues.push({
        id: `r2-${node.id}`,
        severity: 'error',
        subjectNodeId: node.id,
        subjectName: node.name,
        message: `Duplicate class name "${node.name}".`,
        ruleId: 'r2-duplicate-class-name',
      });
    }
  }

  return issues;
}
