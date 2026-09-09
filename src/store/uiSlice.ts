import { StateCreator } from 'zustand';
import { ClassKind, CodeOptions, Language, RelationshipType, RightPanelTab } from '../domain/types';

export type ArmedTool =
  | { type: 'kind'; kind: ClassKind }
  | { type: 'relationship'; relType: RelationshipType }
  | { type: 'sticky' }
  | null;

export type ArmedToolInput =
  | ArmedTool
  | ClassKind
  | RelationshipType
  | 'sticky'
  | 'STICKY';

export interface UiState {
  rightPanelTab: RightPanelTab;
  armedTool: ArmedTool;
  inkTool: 'pen' | 'eraser' | null;
  inkColor: string;
  inkWidth: number;
  codeLanguage: Language;
  codeOptions: CodeOptions;
  selectedElement: { type: 'node' | 'edge' | 'sticky'; id: string } | null;
  activeModal: 'problem-library' | 'score-result' | 'attempt-history' | null;
  historyProblemId: string | null;
  needsFitView: boolean;
}

export interface UiSlice {
  ui: UiState;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setArmedTool: (tool: ArmedToolInput | null) => void;
  setInkTool: (tool: 'pen' | 'eraser' | null) => void;
  setInkColor: (color: string) => void;
  setInkWidth: (width: number) => void;
  setCodeLanguage: (lang: Language) => void;
  setCodeOptions: (options: Partial<CodeOptions>) => void;
  toggleCodeOption: (key: keyof CodeOptions) => void;
  setSelectedElement: (element: { type: 'node' | 'edge' | 'sticky'; id: string } | null) => void;
  setActiveModal: (modal: 'problem-library' | 'score-result' | 'attempt-history' | null) => void;
  openAttemptHistory: (problemId: string) => void;
  requestFitView: () => void;
  clearFitView: () => void;
}

function normalizeArmedTool(input: ArmedToolInput | null): ArmedTool {
  if (!input) return null;
  if (typeof input === 'object') return input;
  const upper = input.toUpperCase();
  if (upper === 'STICKY') {
    return { type: 'sticky' };
  }
  if (['CLASS', 'ABSTRACT', 'INTERFACE', 'ENUM', 'RECORD'].includes(upper)) {
    return { type: 'kind', kind: upper as ClassKind };
  }
  if (['INHERIT', 'REALIZE', 'COMPOSE', 'AGGREGATE', 'ASSOCIATE', 'DEPEND'].includes(upper)) {
    return { type: 'relationship', relType: upper as RelationshipType };
  }
  return null;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  ui: {
    rightPanelTab: 'inspector',
    armedTool: null,
    inkTool: null,
    inkColor: '#22D3EE', // cyan default per PRD §13
    inkWidth: 2,
    codeLanguage: 'java',
    codeOptions: {
      constructor: true,
      gettersSetters: true,
      toStringM: false,
      equalsHashCode: false,
      docComments: true,
    },
    selectedElement: null,
    activeModal: null,
    historyProblemId: null,
    needsFitView: false,
  },

  requestFitView: () =>
    set((state) => ({ ui: { ...state.ui, needsFitView: true } })),

  clearFitView: () =>
    set((state) => ({ ui: { ...state.ui, needsFitView: false } })),

  setRightPanelTab: (tab) =>
    set((state) => ({ ui: { ...state.ui, rightPanelTab: tab } })),

  setArmedTool: (toolInput) =>
    set((state) => {
      const tool = normalizeArmedTool(toolInput);
      const current = state.ui.armedTool;
      if (!tool) {
        return { ui: { ...state.ui, armedTool: null } };
      }
      // Click same row -> disarm (PRD §12.2)
      if (
        current &&
        ((tool.type === 'kind' && current.type === 'kind' && current.kind === tool.kind) ||
          (tool.type === 'relationship' && current.type === 'relationship' && current.relType === tool.relType) ||
          (tool.type === 'sticky' && current.type === 'sticky'))
      ) {
        return { ui: { ...state.ui, armedTool: null } };
      }
      // Mutual exclusion across groups: arm the new tool
      return { ui: { ...state.ui, armedTool: tool } };
    }),

  setInkTool: (tool) =>
    set((state) => ({ ui: { ...state.ui, inkTool: tool } })),

  setInkColor: (color) =>
    set((state) => ({ ui: { ...state.ui, inkColor: color } })),

  setInkWidth: (width) =>
    set((state) => ({ ui: { ...state.ui, inkWidth: width } })),

  setCodeLanguage: (lang) =>
    set((state) => ({ ui: { ...state.ui, codeLanguage: lang } })),

  setCodeOptions: (options) =>
    set((state) => ({
      ui: {
        ...state.ui,
        codeOptions: { ...state.ui.codeOptions, ...options },
      },
    })),

  toggleCodeOption: (key) =>
    set((state) => ({
      ui: {
        ...state.ui,
        codeOptions: {
          ...state.ui.codeOptions,
          [key]: !state.ui.codeOptions[key],
        },
      },
    })),

  setSelectedElement: (element) =>
    set((state) => ({ ui: { ...state.ui, selectedElement: element } })),

  setActiveModal: (modal) => {
    const current = get().ui.activeModal;
    if (modal && !current) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ modal }, '');
      }
    } else if (!modal && current) {
      if (typeof window !== 'undefined' && window.history.state?.modal === current) {
        window.history.back();
      }
    }
    set((state) => ({ ui: { ...state.ui, activeModal: modal } }));
  },

  openAttemptHistory: (problemId: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'attempt-history' }, '');
    }
    set((state) => ({
      ui: {
        ...state.ui,
        activeModal: 'attempt-history',
        historyProblemId: problemId,
      },
    }));
  },
});
