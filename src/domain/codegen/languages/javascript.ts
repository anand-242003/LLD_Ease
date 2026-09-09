import { Diagram, CodeOptions, ClassNode } from '../../types';
import { CodeGenerator } from '../types';
import { orderNodes } from '../ordering';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatJsParams(params: string): string {
  if (!params || !params.trim()) return '';
  return params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.split(/\s+/);
      return parts.length >= 2 ? parts[1] : parts[0];
    })
    .join(', ');
}

export class JavaScriptGenerator implements CodeGenerator {
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
        // In plain JS, interfaces do not exist at runtime, emit JSDoc description or stub
        classBlocks.push(this.generateInterface(node));
      } else {
        classBlocks.push(this.generateClass(node, diagram, options, nodeMap));
      }
    }

    return classBlocks.join('\n\n');
  }

  private generateEnum(node: ClassNode): string {
    const literals = node.attributes.map((a) => a.name.trim()).filter(Boolean);
    if (literals.length === 0) {
      return `export const ${node.name} = Object.freeze({});`;
    }
    const lines = literals.map((lit) => `  ${lit}: '${lit}',`);
    return `export const ${node.name} = Object.freeze({\n${lines.join('\n')}\n});`;
  }

  private generateInterface(node: ClassNode): string {
    const methods = node.methods.map((m) => ` * @method ${m.name}`);
    return `/**\n * Interface ${node.name}\n${methods.join('\n')}\n */\nexport class ${node.name} {}`;
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

    const inheritEdge = diagram.edges.find(
      (e) => e.sourceId === node.id && (e.type === 'INHERIT' || e.type === 'REALIZE') && e.sourceId !== e.targetId
    );
    const parent = inheritEdge ? nodeMap.get(inheritEdge.targetId) : undefined;
    const extendsClause = parent ? ` extends ${parent.name}` : '';

    lines.push(`export class ${node.name}${extendsClause} {`);

    const sections: string[] = [];

    // 1. Private fields
    const fieldLines: string[] = [];
    for (const attr of node.attributes) {
      if (attr.visibility === 'private') {
        fieldLines.push(`  #${attr.name};`);
      } else {
        fieldLines.push(`  ${attr.name};`);
      }
    }
    if (fieldLines.length > 0) {
      sections.push(fieldLines.join('\n'));
    }

    // 2. Constructor
    if (options.constructor && node.attributes.length > 0) {
      const params = node.attributes.map((a) => a.name).join(', ');
      const assigns = node.attributes
        .map((a) => (a.visibility === 'private' ? `    this.#${a.name} = ${a.name};` : `    this.${a.name} = ${a.name};`))
        .join('\n');
      sections.push(`  constructor(${params}) {\n${parent ? '    super();\n' : ''}${assigns}\n  }`);
    }

    // 3. Getters & Setters
    if (options.gettersSetters && node.attributes.length > 0) {
      const accessors: string[] = [];
      for (const attr of node.attributes) {
        const cap = capitalize(attr.name);
        const ref = attr.visibility === 'private' ? `this.#${attr.name}` : `this.${attr.name}`;
        accessors.push(
          `  get${cap}() {\n    return ${ref};\n  }\n\n  set${cap}(value) {\n    ${ref} = value;\n  }`
        );
      }
      sections.push(accessors.join('\n\n'));
    }

    // 4. Methods
    if (node.methods.length > 0) {
      const methodLines: string[] = [];
      for (const method of node.methods) {
        const params = formatJsParams(method.parameters || '');
        methodLines.push(`  ${method.name}(${params}) {\n    // TODO\n  }`);
      }
      sections.push(methodLines.join('\n\n'));
    }

    // 5. toString
    if (options.toStringM) {
      const parts = node.attributes
        .map((a) => `${a.name}=\${${a.visibility === 'private' ? 'this.#' + a.name : 'this.' + a.name}}`)
        .join(', ');
      sections.push(`  toString() {\n    return \`${node.name}{${parts}}\`;\n  }`);
    }

    if (sections.length > 0) {
      lines.push(sections.join('\n\n'));
    }

    lines.push('}');
    return lines.join('\n');
  }
}

export const javaScriptGenerator = new JavaScriptGenerator();
