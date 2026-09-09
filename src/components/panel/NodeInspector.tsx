import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Attribute, ClassKind, ClassNode, Method } from '../../domain/types';
import { useAppStore } from '../../store';
import MemberRow from './MemberRow';
import AddRowButton from './AddRowButton';
import DangerButton from './DangerButton';

export interface NodeInspectorProps {
  node: ClassNode;
  isReadOnly?: boolean;
}

const CLASS_KINDS: Array<{ kind: ClassKind; label: string }> = [
  { kind: 'CLASS', label: 'Class' },
  { kind: 'ABSTRACT', label: 'Abstract' },
  { kind: 'INTERFACE', label: 'Interface' },
  { kind: 'ENUM', label: 'Enum' },
  { kind: 'RECORD', label: 'Record' },
];

export function NodeInspector({ node, isReadOnly = false }: NodeInspectorProps) {
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const updateNode = useAppStore((state) => state.updateNode);
  const removeNode = useAppStore((state) => state.removeNode);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);

  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const handleFieldChange = <K extends keyof ClassNode>(key: K, value: ClassNode[K]) => {
    if (isReadOnly || !activeDocumentId) return;
    updateNode(node.id, { [key]: value }, activeDocumentId);
  };

  const handleAddAttribute = () => {
    if (isReadOnly || !activeDocumentId) return;
    const newId = nanoid();
    const newAttr: Attribute = {
      id: newId,
      visibility: 'private',
      name: '',
      type: '',
      isStatic: false,
      isFinal: false,
    };
    setNewlyAddedId(newId);
    updateNode(node.id, { attributes: [...node.attributes, newAttr] }, activeDocumentId);
  };

  const handleUpdateAttribute = (id: string, patch: Partial<Attribute>) => {
    if (isReadOnly || !activeDocumentId) return;
    const updated = node.attributes.map((a) => (a.id === id ? { ...a, ...patch } : a));
    updateNode(node.id, { attributes: updated }, activeDocumentId);
  };

  const handleRemoveAttribute = (id: string) => {
    if (isReadOnly || !activeDocumentId) return;
    const updated = node.attributes.filter((a) => a.id !== id);
    updateNode(node.id, { attributes: updated }, activeDocumentId);
  };

  const handleAddMethod = () => {
    if (isReadOnly || !activeDocumentId) return;
    const newId = nanoid();
    const newMethod: Method = {
      id: newId,
      visibility: 'public',
      name: '',
      parameters: '',
      returns: 'void',
      isStatic: false,
      isAbstract: false,
    };
    setNewlyAddedId(newId);
    updateNode(node.id, { methods: [...node.methods, newMethod] }, activeDocumentId);
  };

  const handleUpdateMethod = (id: string, patch: Partial<Method>) => {
    if (isReadOnly || !activeDocumentId) return;
    const updated = node.methods.map((m) => (m.id === id ? { ...m, ...patch } : m));
    updateNode(node.id, { methods: updated }, activeDocumentId);
  };

  const handleRemoveMethod = (id: string) => {
    if (isReadOnly || !activeDocumentId) return;
    const updated = node.methods.filter((m) => m.id !== id);
    updateNode(node.id, { methods: updated }, activeDocumentId);
  };

  const handleDeleteClass = () => {
    if (isReadOnly || !activeDocumentId) return;
    removeNode(node.id, activeDocumentId);
    setSelectedElement(null);
  };

  const inputClass =
    'w-full h-[38px] px-3 rounded-[var(--r-md)] bg-surface-2 border border-border font-mono text-[14px] text-text placeholder:text-text-faint hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-fast disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-5 select-none" data-testid="node-inspector">
      {/* 1. NAME + KIND (2-column side-by-side per PRD §9.7 / §10.5.1) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="inspector-node-name"
            className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
          >
            NAME
          </label>
          <input
            id="inspector-node-name"
            type="text"
            value={node.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={isReadOnly}
            className={inputClass}
            data-testid="inspector-input-name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="inspector-node-kind"
            className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
          >
            KIND
          </label>
          <select
            id="inspector-node-kind"
            value={node.kind}
            onChange={(e) => handleFieldChange('kind', e.target.value as ClassKind)}
            disabled={isReadOnly}
            className={`${inputClass} font-sans cursor-pointer`}
            data-testid="inspector-select-kind"
          >
            {CLASS_KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. TYPE PARAMETERS (GENERICS) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-node-generics"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          TYPE PARAMETERS (GENERICS)
        </label>
        <input
          id="inspector-node-generics"
          type="text"
          value={node.generics ?? ''}
          onChange={(e) => handleFieldChange('generics', e.target.value)}
          placeholder="e.g. T or K, V"
          disabled={isReadOnly}
          className={inputClass}
          data-testid="inspector-input-generics"
        />
      </div>

      {/* 3. ATTRIBUTES */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase">
            ATTRIBUTES
          </span>
          <span className="text-[11px] font-mono text-text-faint">
            {node.attributes.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {node.attributes.map((attr) => (
            <MemberRow
              key={attr.id}
              memberType="attribute"
              item={attr}
              onChange={(patch) => handleUpdateAttribute(attr.id, patch)}
              onRemove={() => handleRemoveAttribute(attr.id)}
              disabled={isReadOnly}
              autoFocus={newlyAddedId === attr.id}
            />
          ))}

          {!isReadOnly && (
            <AddRowButton
              label="+ attribute"
              onClick={handleAddAttribute}
              disabled={isReadOnly}
            />
          )}
        </div>
      </div>

      {/* 4. METHODS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase">
            METHODS
          </span>
          <span className="text-[11px] font-mono text-text-faint">
            {node.methods.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {node.methods.map((method) => (
            <MemberRow
              key={method.id}
              memberType="method"
              item={method}
              onChange={(patch) => handleUpdateMethod(method.id, patch)}
              onRemove={() => handleRemoveMethod(method.id)}
              disabled={isReadOnly}
              autoFocus={newlyAddedId === method.id}
            />
          ))}

          {!isReadOnly && (
            <AddRowButton
              label="+ method"
              onClick={handleAddMethod}
              disabled={isReadOnly}
            />
          )}
        </div>
      </div>

      {/* 5. NOTE / DOC COMMENT */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-node-note"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          NOTE / DOC COMMENT
        </label>
        <textarea
          id="inspector-node-note"
          rows={3}
          value={node.note ?? ''}
          onChange={(e) => handleFieldChange('note', e.target.value)}
          placeholder="Add notes or doc comment..."
          disabled={isReadOnly}
          className="w-full p-2.5 rounded-[var(--r-md)] bg-surface-2 border border-border font-mono text-[13px] text-text placeholder:text-text-faint hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-fast resize-y min-h-[72px] disabled:opacity-60 disabled:cursor-not-allowed"
          data-testid="inspector-input-note"
        />
      </div>

      {/* 6. Delete class button (hidden when read-only per PRD §8.2 / AC-I5) */}
      {!isReadOnly && (
        <div className="pt-2">
          <DangerButton
            label="Delete class"
            onClick={handleDeleteClass}
            disabled={isReadOnly}
          />
        </div>
      )}
    </div>
  );
}

export default NodeInspector;
