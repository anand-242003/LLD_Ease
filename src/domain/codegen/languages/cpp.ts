import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { mapType } from '../typeMap';
import { orderNodes } from '../ordering';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCppParams(params: string): string {
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
        const mapped = mapType(rawType, 'cpp');
        const isRef = mapped === 'std::string' || mapped.startsWith('std::vector');
        return isRef ? `const ${mapped}& ${pName}` : `${mapped} ${pName}`;
      }
      return p;
    })
    .join(', ');
}

export class CppGenerator implements CodeGenerator {
  generate(diagram: Diagram, options: CodeOptions): string {
    if (!diagram || !diagram.nodes || diagram.nodes.length === 0) {
      return '';
    }

    const orderedNodes = orderNodes(diagram.nodes);
    const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

    let usesVector = false;
    let usesString = false;
    for (const node of orderedNodes) {
      for (const a of node.attributes) {
        if (a.type?.includes('List')) usesVector = true;
        if (a.type?.toLowerCase().includes('string')) usesString = true;
      }
      for (const m of node.methods) {
        if (m.returns?.includes('List')) usesVector = true;
        if (m.returns?.toLowerCase().includes('string')) usesString = true;
      }
    }

    const headers: string[] = [];
    if (usesString) headers.push('#include <string>');
    if (usesVector) headers.push('#include <vector>');
    if (options.toStringM) headers.push('#include <sstream>');

    const classBlocks: string[] = [];

    for (const node of orderedNodes) {
      if (node.kind === 'ENUM') {
        classBlocks.push(this.generateEnum(node));
      } else {
        classBlocks.push(this.generateClass(node, diagram, options, nodeMap));
      }
    }

    const header = headers.length > 0 ? headers.join('\n') + '\n\n' : '';
    return header + classBlocks.join('\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    if (literals.length === 0) {
      return `enum class ${node.name} {};`;
    }
    const lines = literals.map((lit) => `    ${lit},`);
    return `enum class ${node.name} {\n${lines.join('\n')}\n};`;
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

    const baseEdges = diagram.edges.filter(
      (e) => (e.type === 'INHERIT' || e.type === 'REALIZE') && e.sourceId === node.id && e.sourceId !== e.targetId
    );
    const baseNames = baseEdges.map((e) => nodeMap.get(e.targetId)?.name).filter(Boolean);
    const heritage = baseNames.length > 0 ? ` : ${baseNames.map((b) => `public ${b}`).join(', ')}` : '';

    lines.push(`class ${node.name}${heritage} {`);

    const privateLines: string[] = [];
    for (const attr of node.attributes) {
      const type = mapType(attr.type || 'std::string', 'cpp');
      privateLines.push(`    ${type} ${attr.name};`);
    }

    if (privateLines.length > 0) {
      lines.push('private:');
      lines.push(privateLines.join('\n'));
    }

    const publicSections: string[] = [];

    // Constructor
    if (options.constructor && node.attributes.length > 0) {
      const params = node.attributes
        .map((a) => `${mapType(a.type || 'std::string', 'cpp')} ${a.name}`)
        .join(', ');
      const inits = node.attributes.map((a) => `${a.name}(${a.name})`).join(', ');
      publicSections.push(`    ${node.name}(${params}) : ${inits} {}`);
    }

    // Getters & Setters
    if (options.gettersSetters && node.attributes.length > 0) {
      const accessors: string[] = [];
      for (const attr of node.attributes) {
        const type = mapType(attr.type || 'std::string', 'cpp');
        const cap = capitalize(attr.name);
        accessors.push(
          `    ${type} get${cap}() const { return ${attr.name}; }\n    void set${cap}(const ${type}& value) { this->${attr.name} = value; }`
        );
      }
      publicSections.push(accessors.join('\n\n'));
    }

    // Methods
    const isInterfaceOrAbstract = node.kind === 'INTERFACE' || node.kind === 'ABSTRACT';
    if (node.methods.length > 0) {
      const methodLines: string[] = [];
      for (const method of node.methods) {
        const returnType = mapType(method.returns || 'void', 'cpp');
        const params = formatCppParams(method.parameters || '');
        if (method.isAbstract || isInterfaceOrAbstract) {
          methodLines.push(`    virtual ${returnType} ${method.name}(${params}) = 0;`);
        } else {
          methodLines.push(`    virtual ${returnType} ${method.name}(${params}) {\n        // TODO\n    }`);
        }
      }
      publicSections.push(methodLines.join('\n\n'));
    }

    // toString
    if (options.toStringM) {
      const parts = node.attributes.map((a) => `"${a.name}=" << ${a.name}`).join(' << ", " << ');
      publicSections.push(
        `    std::string toString() const {\n        std::stringstream ss;\n        ss << "${node.name}{" << ${parts.length > 0 ? parts : '""'} << "}";\n        return ss.str();\n    }`
      );
    }

    // equals (operator==)
    if (options.equalsHashCode && node.attributes.length > 0) {
      const comparisons = node.attributes
        .map((a) => `${a.name} == other.${a.name}`)
        .join(' && ');
      publicSections.push(
        `    bool operator==(const ${node.name}& other) const {\n        return ${comparisons};\n    }`
      );
    }

    if (publicSections.length > 0) {
      lines.push('public:');
      lines.push(publicSections.join('\n\n'));
    }

    lines.push('};');
    return lines.join('\n');
  }
}

export const cppGenerator = new CppGenerator();
