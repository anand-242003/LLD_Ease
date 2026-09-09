import { Relationship, RelationshipType } from '../../domain/types';
import { useAppStore } from '../../store';
import DangerButton from './DangerButton';

export interface EdgeInspectorProps {
  edge: Relationship;
  isReadOnly?: boolean;
}

const RELATIONSHIP_TYPES: Array<{ type: RelationshipType; label: string }> = [
  { type: 'INHERIT', label: 'Inherit' },
  { type: 'REALIZE', label: 'Realize' },
  { type: 'COMPOSE', label: 'Compose' },
  { type: 'AGGREGATE', label: 'Aggregate' },
  { type: 'ASSOCIATE', label: 'Associate' },
  { type: 'DEPEND', label: 'Depend' },
];

export function EdgeInspector({ edge, isReadOnly = false }: EdgeInspectorProps) {
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const updateEdge = useAppStore((state) => state.updateEdge);
  const removeEdge = useAppStore((state) => state.removeEdge);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);

  const handleFieldChange = <K extends keyof Relationship>(key: K, value: Relationship[K]) => {
    if (isReadOnly || !activeDocumentId) return;
    updateEdge(edge.id, { [key]: value }, activeDocumentId);
  };

  const handleDeleteRelationship = () => {
    if (isReadOnly || !activeDocumentId) return;
    removeEdge(edge.id, activeDocumentId);
    setSelectedElement(null);
  };

  const inputClass =
    'w-full h-[38px] px-3 rounded-[var(--r-md)] bg-surface-2 border border-border font-mono text-[14px] text-text placeholder:text-text-faint hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-fast disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-5 select-none" data-testid="edge-inspector">
      {/* 1. RELATIONSHIP TYPE */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-edge-type"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          RELATIONSHIP TYPE
        </label>
        <select
          id="inspector-edge-type"
          value={edge.type}
          onChange={(e) => handleFieldChange('type', e.target.value as RelationshipType)}
          disabled={isReadOnly}
          className={`${inputClass} font-sans cursor-pointer`}
          data-testid="inspector-select-edge-type"
        >
          {RELATIONSHIP_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. LABEL */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-edge-label"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          LABEL
        </label>
        <input
          id="inspector-edge-label"
          type="text"
          value={edge.label ?? ''}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          placeholder="e.g. vehicle, paymentStrategy"
          disabled={isReadOnly}
          className={inputClass}
          data-testid="inspector-input-edge-label"
        />
      </div>

      {/* 3. SOURCE MULTIPLICITY */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-edge-source-mult"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          SOURCE MULTIPLICITY
        </label>
        <input
          id="inspector-edge-source-mult"
          type="text"
          value={edge.sourceMultiplicity ?? ''}
          onChange={(e) => handleFieldChange('sourceMultiplicity', e.target.value)}
          placeholder="e.g. 1, 0..1, 1..*"
          disabled={isReadOnly}
          className={inputClass}
          data-testid="inspector-input-edge-src-mult"
        />
      </div>

      {/* 4. TARGET MULTIPLICITY */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="inspector-edge-target-mult"
          className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase"
        >
          TARGET MULTIPLICITY
        </label>
        <input
          id="inspector-edge-target-mult"
          type="text"
          value={edge.targetMultiplicity ?? ''}
          onChange={(e) => handleFieldChange('targetMultiplicity', e.target.value)}
          placeholder="e.g. 1, 0..1, 1..*"
          disabled={isReadOnly}
          className={inputClass}
          data-testid="inspector-input-edge-tgt-mult"
        />
      </div>

      {/* 5. Delete relationship (hidden when read-only per PRD §8.2 / AC-I5) */}
      {!isReadOnly && (
        <div className="pt-2">
          <DangerButton
            label="Delete relationship"
            onClick={handleDeleteRelationship}
            disabled={isReadOnly}
          />
        </div>
      )}
    </div>
  );
}

export default EdgeInspector;
