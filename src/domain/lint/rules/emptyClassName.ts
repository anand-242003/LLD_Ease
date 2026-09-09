import { Diagram, Issue, Language } from '../../types';

export function emptyClassName(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    if (!node.name || node.name.trim() === '') {
      issues.push({
        id: `r3-${node.id}`,
        severity: 'error',
        subjectNodeId: node.id,
        subjectName: '(unnamed)',
        message: 'This class has no name.',
        ruleId: 'r3-empty-class-name',
      });
    }
  }

  return issues;
}
