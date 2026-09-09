import { Diagram, Issue, Language } from '../../types';

export function enumWithoutLiterals(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    if (node.kind === 'ENUM' && node.attributes.length === 0) {
      issues.push({
        id: `r9-${node.id}`,
        severity: 'warning',
        subjectNodeId: node.id,
        subjectName: node.name,
        message: `Enum "${node.name}" has no values.`,
        ruleId: 'r9-enum-no-values',
      });
    }
  }

  return issues;
}
