import { Diagram } from '../types';
import { FeedbackFinding } from './types';

export function analyzeTradeoffs(
  userDiagram: Diagram,
  _referenceDiagram?: Diagram
): FeedbackFinding[] {
  const findings: FeedbackFinding[] = [];
  const nodes = userDiagram.nodes;
  const edges = userDiagram.edges;

  // 1. Tight-coupling smell: a class directly associated to > 3 concrete (non-interface/non-abstract) classes
  for (const node of nodes) {
    if (node.kind === 'INTERFACE' || node.kind === 'ENUM') continue;

    const outgoingConcreteTargets = edges
      .filter((e) => e.sourceId === node.id && (e.type === 'ASSOCIATE' || e.type === 'COMPOSE' || e.type === 'AGGREGATE'))
      .map((e) => nodes.find((n) => n.id === e.targetId))
      .filter((target): target is typeof nodes[0] => Boolean(target && target.kind === 'CLASS'));

    // Unique concrete target nodes
    const uniqueConcreteTargets = Array.from(new Set(outgoingConcreteTargets.map((n) => n.id)))
      .map((id) => nodes.find((n) => n.id === id)!);

    if (uniqueConcreteTargets.length >= 4) {
      findings.push({
        id: `tradeoff-coupling-${node.id}`,
        lens: 'tradeoffs',
        severity: 'concern',
        subjectNodeIds: [node.id, ...uniqueConcreteTargets.map((t) => t.id)],
        subjectEdgeIds: [],
        title: `High concrete coupling: ${node.name}`,
        explanation: `\`${node.name}\` directly references ${uniqueConcreteTargets.length} concrete classes (${uniqueConcreteTargets.map((t) => `\`${t.name}\``).join(', ')}). High fan-out to concrete implementations increases ripple effects when requirements change.`,
        suggestedFix: `Introduce intermediate interfaces or facade/strategy patterns to invert dependencies (Dependency Inversion Principle).`,
      });
    }
  }

  // 2. Missing-factory smell: class methods with names like create*, get* returning subtype or taking type param
  for (const node of nodes) {
    for (const method of node.methods) {
      const lowerMethod = method.name.toLowerCase();
      if (
        (lowerMethod.startsWith('create') || lowerMethod.startsWith('build') || lowerMethod.startsWith('get')) &&
        typeof method.parameters === 'string' &&
        method.parameters.toLowerCase().includes('type')
      ) {
        findings.push({
          id: `tradeoff-factory-smell-${node.id}-${method.id}`,
          lens: 'tradeoffs',
          severity: 'suggestion',
          subjectNodeIds: [node.id],
          subjectEdgeIds: [],
          title: `Potential creation smell: ${node.name}.${method.name}()`,
          explanation: `Method \`${method.name}()\` appears to instantiate and return instances based on a type parameter. Hardcoding instantiation inside \`${node.name}\` couples it to concrete subtypes.`,
          suggestedFix: `Extract object instantiation into a dedicated Factory class (Factory Method / Abstract Factory).`,
        });
      }
    }
  }

  // 3. Positive pattern check: Strategy / Polymorphic abstraction referenced by a client class
  const interfacesWithRealizers = nodes.filter((n) => {
    if (n.kind !== 'INTERFACE' && n.kind !== 'ABSTRACT') return false;
    const realizers = edges.filter(
      (e) => e.targetId === n.id && (e.type === 'REALIZE' || e.type === 'INHERIT')
    );
    return realizers.length >= 2;
  });

  for (const iface of interfacesWithRealizers) {
    // Check if another class references this interface
    const clientEdges = edges.filter(
      (e) => e.targetId === iface.id && (e.type === 'ASSOCIATE' || e.type === 'AGGREGATE' || e.type === 'DEPEND')
    );
    const firstEdge = clientEdges[0];
    if (firstEdge) {
      const clientNode = nodes.find((n) => n.id === firstEdge.sourceId);
      findings.push({
        id: `tradeoff-positive-strategy-${iface.id}`,
        lens: 'tradeoffs',
        severity: 'positive',
        subjectNodeIds: clientNode ? [clientNode.id, iface.id] : [iface.id],
        subjectEdgeIds: clientEdges.map((e) => e.id),
        title: `Decoupled design: ${iface.name} abstraction`,
        explanation: `Using the \`${iface.name}\` ${iface.kind.toLowerCase()} allows clients${clientNode ? ` like \`${clientNode.name}\`` : ''} to switch implementations at runtime without modifying client code (Strategy Pattern / Open-Closed Principle).`,
      });
    }
  }

  return findings;
}
