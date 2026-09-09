import React from 'react';
import { Language } from '../../domain/types';
import { useAppStore } from '../../store';

interface LanguageOption {
  id: Language;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
];

export const PillGroup: React.FC = () => {
  const activeLanguage = useAppStore((state) => state.ui.codeLanguage);
  const setCodeLanguage = useAppStore((state) => state.setCodeLanguage);

  return (
    <div
      data-testid="language-pills"
      className="flex flex-wrap items-center gap-2 select-none"
    >
      {LANGUAGES.map((lang) => {
        const isSelected = activeLanguage === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            data-testid={`pill-${lang.id}`}
            onClick={() => setCodeLanguage(lang.id)}
            className={`h-[30px] px-[14px] rounded-full text-[13px] font-medium transition-colors duration-fast cursor-pointer flex items-center justify-center border ${
              isSelected
                ? 'bg-primary text-primary-fg border-primary font-semibold'
                : 'bg-transparent border-border text-text-muted hover:border-border-strong hover:text-text'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default PillGroup;
