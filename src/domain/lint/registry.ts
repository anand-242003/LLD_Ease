import { Diagram, Issue, IssueSeverity, Language } from '../types';
import { realizeTargetNotInterface } from './rules/realizeTargetNotInterface';
import { duplicateClassName } from './rules/duplicateClassName';
import { emptyClassName } from './rules/emptyClassName';
import { inheritanceCycle } from './rules/inheritanceCycle';
import { multipleInheritance } from './rules/multipleInheritance';
import { interfaceNonPublicMember } from './rules/interfaceNonPublicMember';
import { interfaceHasAttribute } from './rules/interfaceHasAttribute';
import { unimplementedAbstract } from './rules/unimplementedAbstract';
import { enumWithoutLiterals } from './rules/enumWithoutLiterals';
import { emptyClass } from './rules/emptyClass';
import { selfInheritance } from './rules/selfInheritance';
import { abstractMethodInConcrete } from './rules/abstractMethodInConcrete';
import { invalidIdentifier } from './rules/invalidIdentifier';
import { inheritFromInterface } from './rules/inheritFromInterface';

export type LintRule = (diagram: Diagram, language?: Language) => Issue[];

export const LINT_RULES: LintRule[] = [
  realizeTargetNotInterface, // R1
  duplicateClassName,        // R2
  emptyClassName,            // R3
  inheritanceCycle,          // R4
  multipleInheritance,       // R5
  interfaceNonPublicMember,  // R6
  interfaceHasAttribute,     // R7
  unimplementedAbstract,     // R8
  enumWithoutLiterals,       // R9
  emptyClass,                // R10
  selfInheritance,           // R11
  abstractMethodInConcrete,  // R12
  invalidIdentifier,         // R13
  inheritFromInterface,      // R14
];

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function lint(diagram: Diagram, language: Language = 'java'): Issue[] {
  if (!diagram || !diagram.nodes) return [];

  const rawIssues = LINT_RULES.flatMap((rule) => rule(diagram, language));
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  // Stable sort: Errors first -> Warnings -> Info, stably by node Y position (top-to-bottom)
  return [...rawIssues].sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sevDiff !== 0) return sevDiff;

    const nodeA = a.subjectNodeId ? nodeMap.get(a.subjectNodeId) : undefined;
    const nodeB = b.subjectNodeId ? nodeMap.get(b.subjectNodeId) : undefined;

    const yA = nodeA?.position.y ?? Infinity;
    const yB = nodeB?.position.y ?? Infinity;
    if (yA !== yB) return yA - yB;

    const xA = nodeA?.position.x ?? Infinity;
    const xB = nodeB?.position.x ?? Infinity;
    if (xA !== xB) return xA - xB;

    return a.message.localeCompare(b.message);
  });
}
