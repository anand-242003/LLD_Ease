import { Diagram, Issue, Language } from '../../types';

export function interfaceHasAttribute(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    if (node.kind === 'INTERFACE') {
      for (const attr of node.attributes) {
        issues.push({
          id: `r7-${node.id}-${attr.id}`,
          severity: 'warning',
          subjectNodeId: node.id,
          subjectName: node.name,
          message: `Interface "${node.name}" declares an attribute "${attr.name}" — interfaces should declare behaviour.`,
          ruleId: 'r7-interface-declares-attribute',
        });
      }
    }
  }

  return issues;
}
