import { Diagram, Issue, Language } from '../../types';

const LANGUAGE_LABELS: Record<Language, string> = {
  java: 'Java',
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  cpp: 'C++',
  csharp: 'C#',
};

const COMMON_RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete',
  'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new',
  'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
  'with', 'abstract', 'boolean', 'byte', 'char', 'double', 'final', 'float',
  'goto', 'implements', 'import', 'int', 'interface', 'long', 'native', 'package',
  'private', 'protected', 'public', 'short', 'static', 'super', 'synchronized',
  'throws', 'transient', 'volatile', 'def', 'elif', 'except', 'exec', 'from',
  'global', 'is', 'lambda', 'pass', 'print', 'raise', 'yield', 'async', 'await',
]);

function isValidIdentifier(name: string, lang: Language): boolean {
  if (!name || name.trim() === '') return false;
  
  if (lang === 'python') {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return false;
  } else {
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) return false;
  }

  return !COMMON_RESERVED.has(name.toLowerCase());
}

export function invalidIdentifier(diagram: Diagram, language: Language = 'java'): Issue[] {
  const issues: Issue[] = [];
  const langLabel = LANGUAGE_LABELS[language] || 'Java';

  for (const node of diagram.nodes) {
    if (node.name && node.name.trim() !== '') {
      if (!isValidIdentifier(node.name, language)) {
        issues.push({
          id: `r13-${node.id}-name`,
          severity: 'info',
          subjectNodeId: node.id,
          subjectName: node.name,
          message: `"${node.name}" isn't a valid ${langLabel} identifier.`,
          ruleId: 'r13-invalid-identifier',
        });
      }
    }

    for (const attr of node.attributes) {
      if (attr.name && !isValidIdentifier(attr.name, language)) {
        issues.push({
          id: `r13-${node.id}-attr-${attr.id}`,
          severity: 'info',
          subjectNodeId: node.id,
          subjectName: node.name,
          message: `"${attr.name}" isn't a valid ${langLabel} identifier.`,
          ruleId: 'r13-invalid-identifier',
        });
      }
    }

    for (const method of node.methods) {
      if (method.name && !isValidIdentifier(method.name, language)) {
        issues.push({
          id: `r13-${node.id}-method-${method.id}`,
          severity: 'info',
          subjectNodeId: node.id,
          subjectName: node.name,
          message: `"${method.name}" isn't a valid ${langLabel} identifier.`,
          ruleId: 'r13-invalid-identifier',
        });
      }
    }
  }

  return issues;
}
