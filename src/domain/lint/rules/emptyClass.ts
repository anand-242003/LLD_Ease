import { Diagram, Issue, Language } from '../../types';

export function emptyClass(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    const hasParentClass = diagram.edges.some(
      (e) => e.type === 'INHERIT' && e.sourceId === node.id
    );

    if (
      node.kind !== 'ENUM' &&
      node.attributes.length === 0 &&
      node.methods.length === 0 &&
      !hasParentClass
    ) {
      issues.push({
        id: `r10-${node.id}`,
        severity: 'warning',
        subjectNodeId: node.id,
        subjectName: node.name,
        message: `"${node.name}" is empty.`,
        ruleId: 'r10-empty-class',
      });
    }
  }

  return issues;
}
