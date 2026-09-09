import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { mapType, getPythonZeroValue } from '../typeMap';
import { orderNodes } from '../ordering';

export class PythonGenerator implements CodeGenerator {
  generate(diagram: Diagram, options: CodeOptions): string {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) {
      return '';
    }

    const orderedNodes = orderNodes(diagram.nodes);
    const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

    const hasAbc = orderedNodes.some(
      (n) => n.kind === 'ABSTRACT' || n.kind === 'INTERFACE' || n.methods.some((m) => m.isAbstract)
    );
    const hasEnum = orderedNodes.some((n) => n.kind === 'ENUM');

    const imports: string[] = [];
    if (hasAbc) {
      imports.push('from abc import ABC, abstractmethod');
    }
    if (hasEnum) {
      imports.push('from enum import Enum');
    }

    const classBlocks: string[] = [];

    for (const node of orderedNodes) {
      if (node.kind === 'ENUM') {
        classBlocks.push(this.generateEnum(node));
      } else {
        classBlocks.push(this.generateClass(node, diagram, options, nodeMap));
      }
    }

    const header = imports.length > 0 ? imports.join('\n') + '\n\n' : '';
    return header + classBlocks.join('\n\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const lines: string[] = [`class ${node.name}(Enum):`];
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    if (literals.length === 0) {
      lines.push('    pass');
    } else {
      for (const lit of literals) {
        lines.push(`    ${lit} = "${lit}"`);
      }
    }
    return lines.join('\n');
  }

  private generateClass(
    node: ClassNode,
    diagram: Diagram,
    options: CodeOptions,
    nodeMap: Map<string, ClassNode>
  ): string {
    const isAbc = node.kind === 'ABSTRACT' || node.kind === 'INTERFACE';

    // Bases from INHERIT and REALIZE
    const baseEdges = diagram.edges.filter(
      (e) => (e.type === 'INHERIT' || e.type === 'REALIZE') && e.sourceId === node.id && e.sourceId !== e.targetId
    );
    const baseNames = baseEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean) as string[];

    if (isAbc && !baseNames.includes('ABC')) {
      baseNames.push('ABC');
    }

    const heritage = baseNames.length > 0 ? `(${baseNames.join(', ')})` : '';
    const lines: string[] = [`class ${node.name}${heritage}:`];

    const bodyLines: string[] = [];

    // Doc comments
    if (options.docComments && node.note && node.note.trim()) {
      bodyLines.push(`    """${node.note.trim()}"""`);
    }

    // Attributes (inside __init__ if constructor enabled, else class-level defaults)
    const hasAttributes = node.attributes.length > 0;
    if (hasAttributes) {
      if (options.constructor) {
        bodyLines.push('    def __init__(self):');
        for (const attr of node.attributes) {
          const attrName = attr.visibility === 'public' ? attr.name : `_${attr.name}`;
          const pyType = mapType(attr.type || 'str', 'python');
          const zeroVal = getPythonZeroValue(pyType);
          bodyLines.push(`        self.${attrName}: ${pyType} = ${zeroVal}`);
        }
      } else {
        for (const attr of node.attributes) {
          const attrName = attr.visibility === 'public' ? attr.name : `_${attr.name}`;
          const pyType = mapType(attr.type || 'str', 'python');
          const zeroVal = getPythonZeroValue(pyType);
          bodyLines.push(`    ${attrName}: ${pyType} = ${zeroVal}`);
        }
      }
    }

    // Methods
    for (const method of node.methods) {
      const returnType = mapType(method.returns || 'void', 'python');
      let paramStr = '';
      if (method.parameters && method.parameters.trim()) {
        const rawParams = method.parameters.split(',').map((p) => p.trim()).filter(Boolean);
        const parsed = rawParams.map((p) => {
          const parts = p.split(/\s+/);
          if (parts.length >= 2 && parts[0] && parts[1]) {
            const pType = mapType(parts[0], 'python');
            const pName = parts[1];
            return `${pName}: ${pType}`;
          }
          return p;
        });

        paramStr = ', ' + parsed.join(', ');
      }

      const shouldBeAbstract =
        method.isAbstract || (node.kind === 'INTERFACE' && method.name !== '__init__');
      if (shouldBeAbstract) {
        bodyLines.push('    @abstractmethod');
      }
      bodyLines.push(`    def ${method.name}(self${paramStr}) -> ${returnType}:`);
      bodyLines.push('        pass');
    }

    // NOTE: Getters/Setters option is intentionally IGNORED in Python per PRD §9.10

    // __repr__ (corresponds to toString option)
    if (options.toStringM && hasAttributes) {
      const fieldList = node.attributes
        .map((a) => {
          const attrName = a.visibility === 'public' ? a.name : `_${a.name}`;
          return `${attrName}={self.${attrName}}`;
        })
        .join(', ');
      bodyLines.push('    def __repr__(self) -> str:');
      bodyLines.push(`        return f"${node.name}(${fieldList})"`);
    }

    if (bodyLines.length === 0) {
      bodyLines.push('    pass');
    }

    lines.push(bodyLines.join('\n'));
    return lines.join('\n');
  }
}

export const pythonGenerator = new PythonGenerator();
