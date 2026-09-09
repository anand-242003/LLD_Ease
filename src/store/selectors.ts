import { useState, useEffect } from 'react';
import { useAppStore } from './index';
import { Diagram, Issue, Problem } from '../domain/types';
import { lint } from '../domain/lint';
import { generateCode } from '../domain/codegen';
import { getProblem } from '../domain/problems';

export const useActiveDocument = (): Diagram | undefined => {
  return useAppStore((state) => state.documents.find((d) => d.id === state.activeDocumentId));
};

export const useActiveNodes = () => {
  return useAppStore((state) => {
    const doc = state.documents.find((d) => d.id === state.activeDocumentId);
    return doc?.nodes ?? [];
  });
};

export const useActiveEdges = () => {
  return useAppStore((state) => {
    const doc = state.documents.find((d) => d.id === state.activeDocumentId);
    return doc?.edges ?? [];
  });
};

/**
 * Resolves the Problem currently "in scope" (Phase 31): either the problem
 * behind an active read-only reference/attempt tab, or the problem being
 * practiced on My Design. Returns null when neither applies (ordinary
 * free-form modeling) — the ProblemContextPanel renders nothing in that case.
 */
export const useActiveProblemContext = (): Problem | null => {
  return useAppStore((state) => {
    const activeDoc = state.documents.find((d) => d.id === state.activeDocumentId);

    // ── Priority 1: an active practice session always wins ────────────────
    // Without this, a stale reference tab left open from a PREVIOUS problem
    // would be `activeDoc` and the selector would return the wrong problem,
    // causing "View reference solution" to load the old problem's solution.
    if (state.practiceSession) {
      return getProblem(state.practiceSession.problemId) ?? null;
    }

    // ── Priority 2: the active doc is a reference or attempt tab ─────────
    if (activeDoc?.readOnly && activeDoc.sourceProblemId) {
      return getProblem(activeDoc.sourceProblemId) ?? null;
    }

    return null;
  });
};


/**
 * Hook providing debounced lint issues (~150ms) per PRD §22.3 & Phase 29.
 * Prevents heavy validation loops during rapid typing or canvas dragging.
 */
export const useIssues = (): Issue[] => {
  const doc = useAppStore((state) => state.documents.find((d) => d.id === state.activeDocumentId));
  const codeLanguage = useAppStore((state) => state.ui.codeLanguage);

  const [issues, setIssues] = useState<Issue[]>(() => {
    if (!doc) return [];
    return lint(doc, codeLanguage);
  });

  useEffect(() => {
    if (!doc) {
      setIssues([]);
      return;
    }
    const timer = setTimeout(() => {
      setIssues(lint(doc, codeLanguage));
    }, 150);

    return () => clearTimeout(timer);
  }, [doc, codeLanguage]);

  return issues;
};

/**
 * Hook providing debounced generated code (~150ms) per PRD §22.3 & Phase 29.
 */
export const useGeneratedCode = (): string => {
  const doc = useAppStore((state) => state.documents.find((d) => d.id === state.activeDocumentId));
  const codeLanguage = useAppStore((state) => state.ui.codeLanguage);
  const codeOptions = useAppStore((state) => state.ui.codeOptions);

  const [code, setCode] = useState<string>(() => {
    if (!doc || doc.nodes.length === 0) return '';
    return generateCode(doc, codeLanguage, codeOptions);
  });

  useEffect(() => {
    if (!doc || doc.nodes.length === 0) {
      setCode('');
      return;
    }
    const timer = setTimeout(() => {
      setCode(generateCode(doc, codeLanguage, codeOptions));
    }, 150);

    return () => clearTimeout(timer);
  }, [doc, codeLanguage, codeOptions]);

  return code;
};
