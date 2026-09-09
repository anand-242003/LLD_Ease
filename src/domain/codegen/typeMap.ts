import { Language } from '../types';

export const TYPE_MAP: Record<string, Record<Language, string>> = {
  String: {
    java: 'String',
    python: 'str',
    typescript: 'string',
    javascript: 'string',
    cpp: 'std::string',
    csharp: 'string',
  },
  string: {
    java: 'String',
    python: 'str',
    typescript: 'string',
    javascript: 'string',
    cpp: 'std::string',
    csharp: 'string',
  },
  long: {
    java: 'long',
    python: 'int',
    typescript: 'number',
    javascript: 'number',
    cpp: 'long',
    csharp: 'long',
  },
  int: {
    java: 'int',
    python: 'int',
    typescript: 'number',
    javascript: 'number',
    cpp: 'int',
    csharp: 'int',
  },
  double: {
    java: 'double',
    python: 'float',
    typescript: 'number',
    javascript: 'number',
    cpp: 'double',
    csharp: 'double',
  },
  float: {
    java: 'float',
    python: 'float',
    typescript: 'number',
    javascript: 'number',
    cpp: 'float',
    csharp: 'float',
  },
  boolean: {
    java: 'boolean',
    python: 'bool',
    typescript: 'boolean',
    javascript: 'boolean',
    cpp: 'bool',
    csharp: 'bool',
  },
  bool: {
    java: 'boolean',
    python: 'bool',
    typescript: 'boolean',
    javascript: 'boolean',
    cpp: 'bool',
    csharp: 'bool',
  },
  void: {
    java: 'void',
    python: 'None',
    typescript: 'void',
    javascript: 'void',
    cpp: 'void',
    csharp: 'void',
  },
};

export function mapType(type: string, lang: Language): string {
  if (!type || type.trim() === '') {
    return lang === 'python' ? 'None' : 'void';
  }

  const trimmed = type.trim();

  // Direct match
  const mapped = TYPE_MAP[trimmed];
  if (mapped && mapped[lang]) {
    return mapped[lang];
  }


  // Handle generic collections like List<T>
  const listMatch = trimmed.match(/^List<(.+)>$/);
  if (listMatch && listMatch[1]) {
    const inner = mapType(listMatch[1].trim(), lang);
    switch (lang) {
      case 'python':
        return `list[${inner}]`;
      case 'typescript':
      case 'javascript':
        return `${inner}[]`;
      case 'cpp':
        return `std::vector<${inner}>`;
      case 'java':
      case 'csharp':
      default:
        return `List<${inner}>`;
    }
  }


  // For Java, preserve verbatim
  if (lang === 'java') {
    return trimmed;
  }

  return trimmed;
}

export function getPythonZeroValue(pyType: string): string {
  switch (pyType) {
    case 'int':
      return '0';
    case 'str':
      return '""';
    case 'float':
      return '0.0';
    case 'bool':
      return 'False';
    case 'list':
      return '[]';
    default:
      if (pyType.startsWith('list[')) {
        return '[]';
      }
      return 'None';
  }
}
