import { Diagram, Issue, Language } from '../../types';

export function abstractMethodInConcrete(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    if (node.kind === 'CLASS') {
      for (const method of node.methods) {
        if (method.isAbstract) {
          issues.push({
            id: `r12-${node.id}-${method.id}`,
            severity: 'warning',
            subjectNodeId: node.id,
            subjectName: node.name,
            message: `"${node.name}" declares abstract "${method.name}()" but isn't abstract.`,
            ruleId: 'r12-concrete-declares-abstract',
          });
        }
      }
    }
  }

  return issues;
}
