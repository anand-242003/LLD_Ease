import { ClassNode, ClassKind } from '../types';

const KIND_ORDER: Record<ClassKind, number> = {
  ENUM: 0,
  INTERFACE: 1,
  ABSTRACT: 2,
  RECORD: 3,
  CLASS: 3,
};

export function orderNodes(nodes: ClassNode[]): ClassNode[] {
  return [...nodes].sort((a, b) => {
    const orderA = KIND_ORDER[a.kind] ?? 3;
    const orderB = KIND_ORDER[b.kind] ?? 3;
    return orderA - orderB;
  });
}
