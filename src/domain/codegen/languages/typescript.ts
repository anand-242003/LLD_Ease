import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { mapType } from '../typeMap';
import { orderNodes } from '../ordering';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTsParams(params: string): string {
  if (!params || !params.trim()) return '';
  return params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.split(/\s+/);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const pType = mapType(parts[0], 'typescript');
        const pName = parts[1];
        return `${pName}: ${pType}`;
      }
      return p;
    })
    .join(', ');
}

export class TypeScriptGenerator implements CodeGenerator {

  generate(diagram: Diagram, options: CodeOptions): string {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) {
      return '';
    }

    const orderedNodes = orderNodes(diagram.nodes);
    const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
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

    return classBlocks.join('\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    if (literals.length === 0) {
      return `export enum ${node.name} {}`;
    }
    const lines = literals.map((lit) => `  ${lit} = '${lit}',`);
    return `export enum ${node.name} {\n${lines.join('\n')}\n}`;
  }

  private generateInterface(node: ClassNode, diagram: Diagram, options: CodeOptions): string {
    const lines: string[] = [];

    if (options.docComments && node.note && node.note.trim()) {
      lines.push('/**');
      lines.push(` * ${node.note.trim()}`);
      lines.push(' */');
    }

    const extendsNames = diagram.edges
      .filter((e) => e.sourceId === node.id && (e.type === 'INHERIT' || e.type === 'REALIZE'))
      .map((e) => diagram.nodes.find((n) => n.id === e.targetId)?.name)
      .filter(Boolean);

    const extendsClause = extendsNames.length > 0 ? ` extends ${extendsNames.join(', ')}` : '';
    lines.push(`export interface ${node.name}${extendsClause} {`);

    for (const method of node.methods) {
      const returnType = mapType(method.returns || 'void', 'typescript');
      const params = formatTsParams(method.parameters || '');
      lines.push(`  ${method.name}(${params}): ${returnType};`);
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
      lines.push('/**');
      lines.push(` * ${node.note.trim()}`);
      lines.push(' */');
    }

    const inheritEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'INHERIT' && e.sourceId !== e.targetId
    );
    const realizeEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'REALIZE' && e.sourceId !== e.targetId
    );

    const extendsNames = inheritEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean);
    const implementsNames = realizeEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean);

    const isAbstract = node.kind === 'ABSTRACT';
    const classKeyword = isAbstract ? 'export abstract class' : 'export class';
    const extendsClause = extendsNames.length > 0 ? ` extends ${extendsNames[0]}` : '';
    const implementsClause = implementsNames.length > 0 ? ` implements ${implementsNames.join(', ')}` : '';

    lines.push(`${classKeyword} ${node.name}${extendsClause}${implementsClause} {`);

    const sections: string[] = [];

    // 1. Fields
    const fieldLines: string[] = [];
    for (const attr of node.attributes) {
      const vis = attr.visibility ? `${attr.visibility} ` : 'private ';
      const stat = attr.isStatic ? 'static ' : '';
      const fin = attr.isFinal ? 'readonly ' : '';
      const type = mapType(attr.type || 'string', 'typescript');
      const def = attr.defaultValue ? ` = ${attr.defaultValue}` : '';
      fieldLines.push(`  ${vis}${stat}${fin}${attr.name}: ${type}${def};`);
    }

    if (fieldLines.length > 0) {
      sections.push(fieldLines.join('\n'));
    }

    // 2. Constructor
    if (options.constructor && node.attributes.length > 0) {
      const params = node.attributes
        .map((a) => `${a.name}: ${mapType(a.type || 'string', 'typescript')}`)
        .join(', ');
      const assigns = node.attributes.map((a) => `    this.${a.name} = ${a.name};`).join('\n');
      sections.push(`  constructor(${params}) {\n${assigns}\n  }`);
    }

    // 3. Getters & Setters
    if (options.gettersSetters && node.attributes.length > 0) {
      const accessors: string[] = [];
      for (const attr of node.attributes) {
        const type = mapType(attr.type || 'string', 'typescript');
        const cap = capitalize(attr.name);
        accessors.push(
          `  public get${cap}(): ${type} {\n    return this.${attr.name};\n  }\n\n  public set${cap}(value: ${type}): void {\n    this.${attr.name} = value;\n  }`
        );
      }
      sections.push(accessors.join('\n\n'));
    }

    // 4. Methods
    if (node.methods.length > 0) {
      const methodLines: string[] = [];
      for (const method of node.methods) {
        const vis = method.visibility ? `${method.visibility} ` : 'public ';
        const stat = method.isStatic ? 'static ' : '';
        const returnType = mapType(method.returns || 'void', 'typescript');
        const params = formatTsParams(method.parameters || '');

        if (method.isAbstract && isAbstract) {
          methodLines.push(`  ${vis}abstract ${method.name}(${params}): ${returnType};`);
        } else {
          methodLines.push(
            `  ${vis}${stat}${method.name}(${params}): ${returnType} {\n    // TODO\n  }`
          );
        }

      }
      sections.push(methodLines.join('\n\n'));
    }

    // 5. toString
    if (options.toStringM) {
      const parts = node.attributes.map((a) => `${a.name}=\${this.${a.name}}`).join(', ');
      sections.push(
        `  public toString(): string {\n    return \`${node.name}{${parts}}\`;\n  }`
      );
    }

    // 6. equals
    if (options.equalsHashCode && node.attributes.length > 0) {
      const comparisons = node.attributes
        .map((a) => `this.${a.name} === other.${a.name}`)
        .join(' && ');
      sections.push(
        `  public equals(other: ${node.name}): boolean {\n    if (this === other) return true;\n    if (!other) return false;\n    return ${comparisons};\n  }`
      );
    }

    if (sections.length > 0) {
      lines.push(sections.join('\n\n'));
    }

    lines.push('}');
    return lines.join('\n');
  }
}

export const typeScriptGenerator = new TypeScriptGenerator();
