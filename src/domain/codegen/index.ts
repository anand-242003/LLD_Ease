import { Diagram, Language, CodeOptions } from '../types';
import { CodeGenerator } from './types';
import { javaGenerator } from './languages/java';
import { pythonGenerator } from './languages/python';
import { typeScriptGenerator } from './languages/typescript';
import { javaScriptGenerator } from './languages/javascript';
import { cppGenerator } from './languages/cpp';
import { cSharpGenerator } from './languages/csharp';

export * from './types';
export * from './typeMap';
export * from './ordering';
export * from './languages/java';
export * from './languages/python';
export * from './languages/typescript';
export * from './languages/javascript';
export * from './languages/cpp';
export * from './languages/csharp';

const GENERATORS: Record<Language, CodeGenerator> = {
  java: javaGenerator,
  python: pythonGenerator,
  typescript: typeScriptGenerator,
  javascript: javaScriptGenerator,
  cpp: cppGenerator,
  csharp: cSharpGenerator,
};

export function generateCode(
  diagram: Diagram,
  language: Language,
  options: CodeOptions
): string {
  const generator = GENERATORS[language];
  if (!generator) {
    return `// Code generation for ${language} is not supported.`;
  }
  return generator.generate(diagram, options);
}

