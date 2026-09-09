import { Diagram, Issue, Language } from '../../types';

export function interfaceNonPublicMember(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];

  for (const node of diagram.nodes) {
    if (node.kind === 'INTERFACE') {
      for (const attr of node.attributes) {
        if (attr.visibility && attr.visibility !== 'public') {
          issues.push({
            id: `r6-${node.id}-attr-${attr.id}`,
            severity: 'warning',
            subjectNodeId: node.id,
            subjectName: node.name,
            message: `Interface "${node.name}" declares a non-public member "${attr.name}".`,
            ruleId: 'r6-interface-non-public-member',
          });
        }
      }

      for (const method of node.methods) {
        if (method.visibility && method.visibility !== 'public') {
          issues.push({
            id: `r6-${node.id}-method-${method.id}`,
            severity: 'warning',
            subjectNodeId: node.id,
            subjectName: node.name,
            message: `Interface "${node.name}" declares a non-public member "${method.name}".`,
            ruleId: 'r6-interface-non-public-member',
          });
        }
      }
    }
  }

  return issues;
}
