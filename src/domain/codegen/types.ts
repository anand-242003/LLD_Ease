import { Diagram, CodeOptions, Language } from '../types';

export interface CodeGenerator {
  generate(diagram: Diagram, options: CodeOptions): string;
}

export type GeneratorRegistry = Record<Language, CodeGenerator | undefined>;
