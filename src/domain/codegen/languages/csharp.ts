import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { mapType } from '../typeMap';
import { orderNodes } from '../ordering';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCSharpParams(params: string): string {
  if (!params || !params.trim()) return '';
  return params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.split(/\s+/);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const rawType = parts[0];
        const pName = parts[1];
        const mapped = mapType(rawType, 'csharp');
        return `${mapped} ${pName}`;
      }
      return p;
    })
    .join(', ');
}

export class CSharpGenerator implements CodeGenerator {
  generate(diagram: Diagram, options: CodeOptions): string {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) {
      return '';
    }

    const orderedNodes = orderNodes(diagram.nodes);
    const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

    let usesList = false;
    for (const node of orderedNodes) {
      for (const a of node.attributes) {
        if (a.type?.includes('List')) usesList = true;
      }
      for (const m of node.methods) {
        if (m.returns?.includes('List')) usesList = true;
      }
    }

    const usings = ['using System;'];
    if (usesList) {
      usings.push('using System.Collections.Generic;');
    }

    const classBlocks: string[] = [];

    for (const node of orderedNodes) {
      if (node.kind === 'ENUM') {
        classBlocks.push(this.generateEnum(node));
      } else if (node.kind === 'INTERFACE') {
        classBlocks.push(this.generateInterface(node, diagram, options));
      } else {
        classBlocks.push(this.generateClass(node, diagram, options, nodeMap));
      }
    }

    return usings.join('\n') + '\n\n' + classBlocks.join('\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    if (literals.length === 0) {
      return `public enum ${node.name} {}`;
    }
    const lines = literals.map((lit) => `    ${lit},`);
    return `public enum ${node.name} {\n${lines.join('\n')}\n}`;
  }

  private generateInterface(node: ClassNode, diagram: Diagram, options: CodeOptions): string {
    const lines: string[] = [];

    if (options.docComments && node.note && node.note.trim()) {
      lines.push('/// <summary>');
      lines.push(`/// ${node.note.trim()}`);
      lines.push('/// </summary>');
    }

    const extendsNames = diagram.edges
      .filter((e) => e.sourceId === node.id && (e.type === 'INHERIT' || e.type === 'REALIZE'))
      .map((e) => diagram.nodes.find((n) => n.id === e.targetId)?.name)
      .filter(Boolean);

    const heritage = extendsNames.length > 0 ? ` : ${extendsNames.join(', ')}` : '';
    lines.push(`public interface ${node.name}${heritage} {`);

    for (const method of node.methods) {
      const returnType = mapType(method.returns || 'void', 'csharp');
      const cap = capitalize(method.name);
      const params = formatCSharpParams(method.parameters || '');
      lines.push(`    ${returnType} ${cap}(${params});`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  private generateClass(
    node: ClassNode,
    diagram: Diagram,
    options: CodeOptions,
    nodeMap: Map<string, ClassNode>
  ): string {
    const lines: string[] = [];

    if (options.docComments && node.note && node.note.trim()) {
      lines.push('/// <summary>');
      lines.push(`/// ${node.note.trim()}`);
      lines.push('/// </summary>');
    }

    const inheritEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'INHERIT' && e.sourceId !== e.targetId
    );
    const realizeEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'REALIZE' && e.sourceId !== e.targetId
    );

    const baseNames = [
      ...inheritEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean),
      ...realizeEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean),
    ];

    const heritage = baseNames.length > 0 ? ` : ${baseNames.join(', ')}` : '';
    const isAbstract = node.kind === 'ABSTRACT';
    const keyword = isAbstract ? 'public abstract class' : 'public class';

    lines.push(`${keyword} ${node.name}${heritage} {`);

    const sections: string[] = [];

    // Fields
    const fieldLines: string[] = [];
    for (const attr of node.attributes) {
      const type = mapType(attr.type || 'string', 'csharp');
      fieldLines.push(`    private ${type} ${attr.name};`);
    }
    if (fieldLines.length > 0) {
      sections.push(fieldLines.join('\n'));
    }

    // Constructor
    if (options.constructor && node.attributes.length > 0) {
      const params = node.attributes
        .map((a) => `${mapType(a.type || 'string', 'csharp')} ${a.name}`)
        .join(', ');
      const assigns = node.attributes
        .map((a) => `        this.${a.name} = ${a.name};`)
        .join('\n');
      sections.push(`    public ${node.name}(${params}) {\n${assigns}\n    }`);
    }

    // Getters & Setters
    if (options.gettersSetters && node.attributes.length > 0) {
      const accessors: string[] = [];
      for (const attr of node.attributes) {
        const type = mapType(attr.type || 'string', 'csharp');
        const cap = capitalize(attr.name);
        accessors.push(
          `    public ${type} Get${cap}() {\n        return ${attr.name};\n    }\n\n    public void Set${cap}(${type} value) {\n        this.${attr.name} = value;\n    }`
        );
      }
      sections.push(accessors.join('\n\n'));
    }

    // Methods
    if (node.methods.length > 0) {
      const methodLines: string[] = [];
      for (const method of node.methods) {
        const returnType = mapType(method.returns || 'void', 'csharp');
        const cap = capitalize(method.name);
        const params = formatCSharpParams(method.parameters || '');

        if (method.isAbstract && isAbstract) {
          methodLines.push(`    public abstract ${returnType} ${cap}(${params});`);
        } else {
          methodLines.push(
            `    public virtual ${returnType} ${cap}(${params}) {\n        // TODO\n    }`
          );
        }
      }
      sections.push(methodLines.join('\n\n'));
    }

    // toString
    if (options.toStringM) {
      const parts = node.attributes.map((a) => `${a.name}=" + ${a.name} + "`).join(', ');
      sections.push(
        `    public override string ToString() {\n        return "${node.name}{${parts}}";\n    }`
      );
    }

    // Equals & GetHashCode
    if (options.equalsHashCode && node.attributes.length > 0) {
      const comparisons = node.attributes
        .map((a) => `${a.name} == other.${a.name}`)
        .join(' && ');
      sections.push(
        `    public override bool Equals(object obj) {\n        if (obj is not ${node.name} other) return false;\n        return ${comparisons};\n    }\n\n    public override int GetHashCode() {\n        return HashCode.Combine(${node.attributes.map((a) => a.name).join(', ')});\n    }`
      );
    }

    if (sections.length > 0) {
      lines.push(sections.join('\n\n'));
    }

    lines.push('}');
    return lines.join('\n');
  }
}

export const cSharpGenerator = new CSharpGenerator();
