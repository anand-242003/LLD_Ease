import { Diagram, Issue, Language } from '../../types';

export function inheritanceCycle(diagram: Diagram, _language?: Language): Issue[] {
  const issues: Issue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  // Adjacency for INHERIT edges (source inherits from target, so source -> target)
  const adj = new Map<string, string[]>();
  for (const edge of diagram.edges) {
    if (edge.type === 'INHERIT' && edge.sourceId !== edge.targetId) {
      const list = adj.get(edge.sourceId) ?? [];
      list.push(edge.targetId);
      adj.set(edge.sourceId, list);
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const reportedPairs = new Set<string>();

  function dfs(nodeId: string, path: string[]) {
    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adj.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      } else if (inStack.has(neighbor)) {
        // Cycle detected between neighbor and nodeId
        const pairKey = [nodeId, neighbor].sort().join(':');
        if (!reportedPairs.has(pairKey)) {
          reportedPairs.add(pairKey);
          const nodeA = nodeMap.get(nodeId);
          const nodeB = nodeMap.get(neighbor);
          if (nodeA && nodeB) {
            issues.push({
              id: `r4-${nodeA.id}-${nodeB.id}`,
              severity: 'error',
              subjectNodeId: nodeA.id,
              subjectName: nodeA.name,
              message: `"${nodeA.name}" and "${nodeB.name}" inherit from each other.`,
              ruleId: 'r4-inherit-cycle',
            });
          }
        }
      }
    }

    path.pop();
    inStack.delete(nodeId);
  }

  for (const node of diagram.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return issues;
}
