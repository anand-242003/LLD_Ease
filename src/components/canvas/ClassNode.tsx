import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Attribute, ClassKind, ClassNode as ClassNodeType, Method, Visibility } from '../../domain/types';
import { useAppStore } from '../../store';

export interface ClassNodeData {
  node?: ClassNodeType;
  kind?: ClassKind;
  name?: string;
  generics?: string;
  attributes?: Attribute[];
  methods?: Method[];
  handlesProminent?: boolean;
  [key: string]: unknown;
}

export const VISIBILITY_SIGNS: Record<Visibility, string> = {
  private: '-',
  public: '+',
  protected: '#',
  package: '~',
};

function getStereotype(kind: ClassKind): { text: string; color: string } | null {
  switch (kind) {
    case 'ABSTRACT':
      return { text: '«abstract»', color: 'var(--kind-abstract)' };
    case 'INTERFACE':
      return { text: '«interface»', color: 'var(--kind-interface)' };
    case 'ENUM':
      return { text: '«enumeration»', color: 'var(--kind-enum)' };
    case 'CLASS':
    case 'RECORD':
    default:
      return null;
  }
}

export const ClassNode = memo(function ClassNode({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData = (data?.node ?? data) as Partial<ClassNodeType> & ClassNodeData;

  const kind: ClassKind = nodeData.kind ?? 'CLASS';
  const name: string = nodeData.name ?? 'NewClass';
  const generics: string | undefined = nodeData.generics;
  const attributes: Attribute[] = nodeData.attributes ?? [];
  const methods: Method[] = nodeData.methods ?? [];

  const armedTool = useAppStore((state) => state.ui.armedTool);
  const isRelToolArmed = armedTool?.type === 'relationship';
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);

  const isReadOnly = useAppStore((state) =>
    Boolean(state.documents.find((d) => d.id === state.activeDocumentId)?.readOnly)
  );

  const showHandles = !isReadOnly && (selected || Boolean(data?.handlesProminent) || isRelToolArmed);

  const stereotype = getStereotype(kind);
  const isItalicName = kind === 'ABSTRACT' || kind === 'INTERFACE';
  const displayName = generics ? `${name}<${generics}>` : name;

  // Enum special rule: hide operation compartment completely when methods are empty (PRD §11.1)
  const showOperations = kind !== 'ENUM' || methods.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement({ type: 'node', id });
    setRightPanelTab('inspector');
  };

  return (
    <div
      data-node-id={id}
      data-kind={kind}
      onClick={handleClick}
      className={`relative group min-w-[200px] w-max rounded-[var(--r-md)] bg-surface-3 font-mono transition-shadow select-none cursor-pointer ${
        selected
          ? 'border-2 border-primary shadow-[0_0_0_4px_var(--primary-ring)] -m-[1px]'
          : 'border border-border'
      }`}
    >
      {/* Connection Handles (DESIGN.md §5.10 - 10px teal circles at left/right mid-edge, hidden visually in read-only mode) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={!isReadOnly}
        className={`!w-[10px] !h-[10px] !bg-primary !border-none !rounded-full !left-0 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 transition-opacity duration-150 ${
          showHandles
            ? '!opacity-100 !pointer-events-auto'
            : isReadOnly
            ? '!opacity-0 !pointer-events-none'
            : '!opacity-0 group-hover:!opacity-100'
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={!isReadOnly}
        className={`!w-[10px] !h-[10px] !bg-primary !border-none !rounded-full !right-0 !top-1/2 !translate-x-1/2 !-translate-y-1/2 transition-opacity duration-150 ${
          showHandles
            ? '!opacity-100 !pointer-events-auto'
            : isReadOnly
            ? '!opacity-0 !pointer-events-none'
            : '!opacity-0 group-hover:!opacity-100'
        }`}
      />

      {/* Inner Node Container */}
      <div className="rounded-[calc(var(--r-md)-1px)] overflow-hidden">
        {/* Header Band (DESIGN.md §5.10) */}
        <div className="bg-surface-4 px-[14px] py-[10px] border-b border-border flex flex-col items-center justify-center text-center">
          {stereotype && (
            <div
              className="text-[11px] font-mono italic leading-none mb-1 select-none"
              style={{ color: stereotype.color }}
            >
              {stereotype.text}
            </div>
          )}
          <div
            className={`text-[15px] font-bold font-mono text-text tracking-tight leading-snug select-none ${
              isItalicName ? 'italic' : ''
            }`}
          >
            {displayName}
          </div>
        </div>

        {/* Attribute Compartment */}
        <div className="p-[10px_14px] flex flex-col gap-1 text-[13px] font-mono leading-5">
          {attributes.length === 0 ? (
            <div className="italic text-text-faint select-none">no attributes</div>
          ) : kind === 'ENUM' ? (
            attributes.map((attr) => (
              <div
                key={attr.id}
                className="text-text leading-5 select-none"
                data-testid={`literal-${attr.id}`}
              >
                {attr.name}
              </div>
            ))
          ) : (
            attributes.map((attr) => {
              const visSign =
                (attr.visibility && VISIBILITY_SIGNS[attr.visibility]) || '-';
              return (
                <div
                  key={attr.id}
                  className="flex items-baseline whitespace-pre leading-5 select-none"
                  data-testid={`attr-${attr.id}`}
                >
                  <span className="text-text-muted">{visSign}</span>
                  {' '}
                  <span
                    className={`text-text ${attr.isStatic ? 'underline' : ''}`}
                  >
                    {attr.name}
                  </span>
                  <span className="text-text-muted">: {attr.type}</span>
                  {attr.defaultValue ? (
                    <span className="text-text-faint"> = {attr.defaultValue}</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Operation Compartment & Divider */}
        {showOperations && (
          <>
            <div className="h-[1px] bg-border w-full" />
            <div className="p-[10px_14px] flex flex-col gap-1 text-[13px] font-mono leading-5">
              {methods.length === 0 ? (
                <div className="italic text-text-faint select-none">
                  no operations
                </div>
              ) : (
                methods.map((method) => {
                  const visSign =
                    (method.visibility && VISIBILITY_SIGNS[method.visibility]) || '+';
                  return (
                    <div
                      key={method.id}
                      className={`flex items-baseline whitespace-pre leading-5 select-none ${
                        method.isAbstract ? 'italic' : ''
                      }`}
                      data-testid={`method-${method.id}`}
                    >
                      <span className="text-text-muted">{visSign}</span>
                      {' '}
                      <span
                        className={`text-text ${
                          method.isStatic ? 'underline' : ''
                        }`}
                      >
                        {method.name}
                      </span>
                      <span>({method.parameters || ''})</span>
                      <span className="text-text-muted">
                        : {method.returns || 'void'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default ClassNode;
