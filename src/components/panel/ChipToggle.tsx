import React from 'react';
import { CodeOptions } from '../../domain/types';
import { useAppStore } from '../../store';

interface ChipDef {
  key: keyof CodeOptions;
  label: string;
}

const CHIPS: ChipDef[] = [
  { key: 'constructor', label: 'Constructor' },
  { key: 'gettersSetters', label: 'Getters/Setters' },
  { key: 'toStringM', label: 'toString' },
  { key: 'equalsHashCode', label: 'equals/hashCode' },
  { key: 'docComments', label: 'Doc comments' },
];

export const ChipToggle: React.FC = () => {
  const codeOptions = useAppStore((state) => state.ui.codeOptions);
  const toggleCodeOption = useAppStore((state) => state.toggleCodeOption);

  return (
    <div
      data-testid="option-chips"
      className="flex flex-wrap items-center gap-2 select-none"
    >
      {CHIPS.map((chip) => {
        const isOn = codeOptions[chip.key];
        return (
          <button
            key={chip.key}
            type="button"
            data-testid={`chip-${chip.key}`}
            onClick={() => toggleCodeOption(chip.key)}
            className={`h-[30px] px-[14px] rounded-sm text-[13px] font-medium transition-colors duration-fast cursor-pointer flex items-center justify-center border ${
              isOn
                ? 'bg-primary text-primary-fg border-primary font-semibold'
                : 'bg-transparent border-border text-text-muted hover:border-border-strong hover:text-text'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};

export default ChipToggle;
