import { Diagram, Issue, Language, ClassNode } from '../../types';

export function unimplementedAbstract(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  // Adjacency for INHERIT: child (source) -> parent (target)
  const parentsMap = new Map<string, string[]>();
  for (const edge of diagram.edges) {
    if (edge.type === 'INHERIT' && edge.sourceId !== edge.targetId) {
      const list = parentsMap.get(edge.sourceId) ?? [];
      list.push(edge.targetId);
      parentsMap.set(edge.sourceId, list);
    }
  }

  function getAncestors(startId: string): ClassNode[] {
    const ancestors: ClassNode[] = [];
    const queue = [...(parentsMap.get(startId) ?? [])];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const ancestorNode = nodeMap.get(currentId);
      if (ancestorNode) {
        ancestors.push(ancestorNode);
        for (const nextParentId of parentsMap.get(currentId) ?? []) {
          if (!visited.has(nextParentId)) {
            queue.push(nextParentId);
          }
        }
      }
    }

    return ancestors;
  }

  for (const node of diagram.nodes) {
    if (node.kind === 'CLASS') {
      const ancestors = getAncestors(node.id);
      for (const parent of ancestors) {
        for (const method of parent.methods) {
          if (method.isAbstract) {
            const hasOverride = node.methods.some((m) => m.name === method.name);
            if (!hasOverride) {
              issues.push({
                id: `r8-${node.id}-${parent.id}-${method.id}`,
                severity: 'warning',
                subjectNodeId: node.id,
                subjectName: node.name,
                message: `"${node.name}" doesn't implement "${method.name}()" from "${parent.name}".`,
                ruleId: 'r8-unimplemented-abstract-method',
              });
            }
          }
        }
      }
    }
  }

  return issues;
}
