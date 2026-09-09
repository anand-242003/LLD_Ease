import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Attribute, Method } from '../../domain/types';
import VisibilityButton from './VisibilityButton';
import MiniToggle from './MiniToggle';

export interface AttributeRowProps {
  memberType: 'attribute';
  item: Attribute;
  onChange: (patch: Partial<Attribute>) => void;
  onRemove: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface MethodRowProps {
  memberType: 'method';
  item: Method;
  onChange: (patch: Partial<Method>) => void;
  onRemove: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export type MemberRowProps = AttributeRowProps | MethodRowProps;

export function MemberRow(props: MemberRowProps) {
  const { memberType, item, onChange, onRemove, disabled = false, autoFocus = false } = props;
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [autoFocus]);

  const inputClass =
    'w-full h-[32px] px-2.5 rounded-[var(--r-sm)] bg-surface-3 border border-border font-mono text-[13px] text-text placeholder:text-text-faint focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-fast disabled:opacity-60 disabled:cursor-not-allowed';

  if (memberType === 'attribute') {
    const attr = item as Attribute;
    const updateAttr = onChange as (patch: Partial<Attribute>) => void;

    return (
      <div
        className="bg-surface-2 border border-border rounded-[var(--r-md)] p-2.5 flex flex-col gap-2 transition-colors hover:border-border-strong"
        data-testid={`attribute-row-${attr.id}`}
      >
        {/* Line 1: Visibility, Name, Delete button */}
        <div className="flex items-center gap-2">
          <VisibilityButton
            visibility={attr.visibility}
            onChange={(vis) => updateAttr({ visibility: vis })}
            disabled={disabled}
          />
          <input
            ref={nameInputRef}
            type="text"
            value={attr.name}
            onChange={(e) => updateAttr({ name: e.target.value })}
            placeholder="name"
            disabled={disabled}
            className={inputClass}
            data-testid={`attr-name-${attr.id}`}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            title="Remove attribute"
            aria-label="Remove attribute"
            className="w-[28px] h-[28px] shrink-0 rounded-[var(--r-sm)] flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Line 2: Type */}
        <div className="flex items-center">
          <input
            type="text"
            value={attr.type}
            onChange={(e) => updateAttr({ type: e.target.value })}
            placeholder="type — e.g. String, long, List<T>"
            disabled={disabled}
            className={inputClass}
            data-testid={`attr-type-${attr.id}`}
          />
        </div>

        {/* Line 3: Default value, S (static), F (final) */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={attr.defaultValue ?? ''}
            onChange={(e) => updateAttr({ defaultValue: e.target.value })}
            placeholder="= default value (optional)"
            disabled={disabled}
            className={`${inputClass} flex-1`}
            data-testid={`attr-default-${attr.id}`}
          />
          <MiniToggle
            label="S"
            title="Static"
            checked={Boolean(attr.isStatic)}
            onChange={(checked) => updateAttr({ isStatic: checked })}
            disabled={disabled}
          />
          <MiniToggle
            label="F"
            title="Final"
            checked={Boolean(attr.isFinal)}
            onChange={(checked) => updateAttr({ isFinal: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  // Method Row
  const method = item as Method;
  const updateMethod = onChange as (patch: Partial<Method>) => void;

  return (
    <div
      className="bg-surface-2 border border-border rounded-[var(--r-md)] p-2.5 flex flex-col gap-2 transition-colors hover:border-border-strong"
      data-testid={`method-row-${method.id}`}
    >
      {/* Line 1: Visibility, Name, Delete button */}
      <div className="flex items-center gap-2">
        <VisibilityButton
          visibility={method.visibility}
          onChange={(vis) => updateMethod({ visibility: vis })}
          disabled={disabled}
        />
        <input
          ref={nameInputRef}
          type="text"
          value={method.name}
          onChange={(e) => updateMethod({ name: e.target.value })}
          placeholder="name"
          disabled={disabled}
          className={inputClass}
          data-testid={`method-name-${method.id}`}
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          title="Remove method"
          aria-label="Remove method"
          className="w-[28px] h-[28px] shrink-0 rounded-[var(--r-sm)] flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Line 2: Parameters */}
      <div className="flex items-center">
        <input
          type="text"
          value={method.parameters ?? ''}
          onChange={(e) => updateMethod({ parameters: e.target.value })}
          placeholder="parameters — e.g. int id, String name"
          disabled={disabled}
          className={inputClass}
          data-testid={`method-params-${method.id}`}
        />
      </div>

      {/* Line 3: returns label + return type, S (static), A (abstract) */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-text-muted font-mono shrink-0">returns</span>
        <input
          type="text"
          value={method.returns ?? ''}
          onChange={(e) => updateMethod({ returns: e.target.value })}
          placeholder="void"
          disabled={disabled}
          className={`${inputClass} flex-1`}
          data-testid={`method-returns-${method.id}`}
        />
        <MiniToggle
          label="S"
          title="Static"
          checked={Boolean(method.isStatic)}
          onChange={(checked) => updateMethod({ isStatic: checked })}
          disabled={disabled}
        />
        <MiniToggle
          label="A"
          title="Abstract"
          checked={Boolean(method.isAbstract)}
          onChange={(checked) => updateMethod({ isAbstract: checked })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default MemberRow;
