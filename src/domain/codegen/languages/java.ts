import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { mapType } from '../typeMap';
import { orderNodes } from '../ordering';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class JavaGenerator implements CodeGenerator {
  generate(diagram: Diagram, options: CodeOptions): string {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) {
      return '';
    }

    const orderedNodes = orderNodes(diagram.nodes);
    const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

    // Check needed imports
    let usesList = false;
    for (const node of orderedNodes) {
      for (const attr of node.attributes) {
        if (attr.type && attr.type.includes('List')) usesList = true;
      }
      for (const method of node.methods) {
        if (method.returns && method.returns.includes('List')) usesList = true;
        if (method.parameters && method.parameters.includes('List')) usesList = true;
      }
    }

    const imports: string[] = [];
    if (usesList) {
      imports.push('import java.util.List;');
    }
    if (options.equalsHashCode) {
      imports.push('import java.util.Objects;');
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

    const header = imports.length > 0 ? imports.join('\n') + '\n\n' : '';
    return header + classBlocks.join('\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    const litString = literals.length > 0 ? `\n    ${literals.join(', ')};\n` : ' ';
    return `public enum ${node.name} {${litString}}`;
  }

  private generateInterface(node: ClassNode, diagram: Diagram, options: CodeOptions): string {
    const lines: string[] = [];

    if (options.docComments && node.note && node.note.trim()) {
      lines.push('/**');
      lines.push(` * ${node.note.trim()}`);
      lines.push(' */');
    }

    // Extended interfaces via INHERIT
    const extendsNames = diagram.edges
      .filter((e) => e.sourceId === node.id && (e.type === 'INHERIT' || e.type === 'REALIZE'))
      .map((e) => diagram.nodes.find((n) => n.id === e.targetId)?.name)
      .filter(Boolean);

    const extendsClause = extendsNames.length > 0 ? ` extends ${extendsNames.join(', ')}` : '';
    lines.push(`public interface ${node.name}${extendsClause} {`);

    const members: string[] = [];
    for (const method of node.methods) {
      const returnType = mapType(method.returns || 'void', 'java');
      const params = method.parameters || '';
      members.push(`    ${returnType} ${method.name}(${params});`);
    }

    if (members.length > 0) {
      lines.push(members.join('\n'));
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

    // Heritage: INHERIT -> extends, REALIZE -> implements
    const inheritEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'INHERIT' && e.sourceId !== e.targetId
    );
    const realizeEdges = diagram.edges.filter(
      (e) => e.sourceId === node.id && e.type === 'REALIZE' && e.sourceId !== e.targetId
    );

    const extendsNames = inheritEdges
      .map((e) => nodeMap.get(e.targetId)?.name)
      .filter(Boolean);
    const implementsNames = realizeEdges
      .map((e) => nodeMap.get(e.targetId)?.name)
      .filter(Boolean);

    const isAbstract = node.kind === 'ABSTRACT';
    const classKind = isAbstract ? 'abstract class' : 'class';
    const extendsClause = extendsNames.length > 0 ? ` extends ${extendsNames[0]}` : '';
    const implementsClause = implementsNames.length > 0 ? ` implements ${implementsNames.join(', ')}` : '';

    lines.push(`public ${classKind} ${node.name}${extendsClause}${implementsClause} {`);

    const sections: string[] = [];

    // 1. Fields / Attributes
    const fieldLines: string[] = [];
    for (const attr of node.attributes) {
      const vis = attr.visibility ? `${attr.visibility} ` : 'private ';
      const stat = attr.isStatic ? 'static ' : '';
      const fin = attr.isFinal ? 'final ' : '';
      const type = mapType(attr.type || 'String', 'java');
      const def = attr.defaultValue ? ` = ${attr.defaultValue}` : '';
      fieldLines.push(`    ${vis}${stat}${fin}${type} ${attr.name}${def};`);
    }

    // Also relationships as fields: COMPOSE, AGGREGATE, ASSOCIATE
    const relEdges = diagram.edges.filter(
      (e) =>
        e.sourceId === node.id &&
        (e.type === 'COMPOSE' || e.type === 'AGGREGATE' || e.type === 'ASSOCIATE') &&
        e.sourceId !== e.targetId
    );
    for (const edge of relEdges) {
      const target = nodeMap.get(edge.targetId);
      if (target) {
        const isList = edge.targetMultiplicity?.includes('*');
        const fieldType = isList ? `List<${target.name}>` : target.name;
        const fieldName = edge.label
          ? edge.label
          : target.name.charAt(0).toLowerCase() + target.name.slice(1);
        fieldLines.push(`    private ${fieldType} ${fieldName};`);
      }
    }

    if (fieldLines.length > 0) {
      sections.push(fieldLines.join('\n'));
    }

    // 2. Constructor (if enabled and attributes exist)
    if (options.constructor && node.attributes.length > 0) {
      const params = node.attributes
        .map((a) => `${mapType(a.type || 'String', 'java')} ${a.name}`)
        .join(', ');
      const assignments = node.attributes
        .map((a) => `        this.${a.name} = ${a.name};`)
        .join('\n');
      sections.push(`    public ${node.name}(${params}) {\n${assignments}\n    }`);
    }

    // 3. Getters and Setters (if enabled)
    if (options.gettersSetters && node.attributes.length > 0) {
      const accessorLines: string[] = [];
      for (const attr of node.attributes) {
        const type = mapType(attr.type || 'String', 'java');
        const cap = capitalize(attr.name);
        const getterPrefix = attr.type === 'boolean' || attr.type === 'bool' ? 'is' : 'get';

        accessorLines.push(
          `    public ${type} ${getterPrefix}${cap}() {\n        return ${attr.name};\n    }\n\n    public void set${cap}(${type} ${attr.name}) {\n        this.${attr.name} = ${attr.name};\n    }`
        );
      }
      sections.push(accessorLines.join('\n\n'));
    }

    // 4. Methods
    if (node.methods.length > 0) {
      const methodBlocks: string[] = [];
      for (const method of node.methods) {
        const vis = method.visibility ? `${method.visibility} ` : 'public ';
        const stat = method.isStatic ? 'static ' : '';
        const returnType = mapType(method.returns || 'void', 'java');
        const params = method.parameters || '';

        if (method.isAbstract && isAbstract) {
          methodBlocks.push(`    ${vis}abstract ${returnType} ${method.name}(${params});`);
        } else {
          methodBlocks.push(`    ${vis}${stat}${returnType} ${method.name}(${params}) {\n        // TODO\n    }`);
        }
      }
      sections.push(methodBlocks.join('\n\n'));
    }

    // 5. toString()
    if (options.toStringM) {
      const fieldParts = node.attributes.map((a) => `${a.name}=" + ${a.name} + "`).join(', ');
      const returnExpr =
        node.attributes.length > 0
          ? `"${node.name}{${fieldParts}}"`
          : `"${node.name}{}"`;
      sections.push(
        `    @Override\n    public String toString() {\n        return ${returnExpr};\n    }`
      );
    }

    // 6. equals / hashCode
    if (options.equalsHashCode) {
      const comparisons =
        node.attributes.length > 0
          ? node.attributes
              .map((a) => {
                const t = a.type?.toLowerCase();
                if (t === 'int' || t === 'long' || t === 'boolean' || t === 'double' || t === 'float') {
                  return `${a.name} == that.${a.name}`;
                }
                return `Objects.equals(${a.name}, that.${a.name})`;
              })
              .join(' && ')
          : 'true';

      const hashArgs = node.attributes.map((a) => a.name).join(', ');

      sections.push(
        `    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        if (o == null || getClass() != o.getClass()) return false;\n        ${node.name} that = (${node.name}) o;\n        return ${comparisons};\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(${hashArgs});\n    }`
      );
    }

    if (sections.length > 0) {
      lines.push(sections.join('\n\n'));
    }

    lines.push('}');
    return lines.join('\n');
  }
}

export const javaGenerator = new JavaGenerator();
