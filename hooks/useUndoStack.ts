'use client';

import { useState, useCallback } from 'react';
import type { BedWithReservation } from '@/lib/types';

interface UndoAction {
  bedIds: string[];
  action: string;
  previousStates: Array<{ bedId: string; state: string; version: number }>;
  timestamp: number;
}

export function useUndoStack() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  const pushUndo = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [action, ...prev.slice(0, 4)]); // Manter apenas 5 ações
  }, []);

  const popUndo = useCallback((): UndoAction | null => {
    if (undoStack.length === 0) return null;
    const action = undoStack[0];
    setUndoStack((prev) => prev.slice(1));
    return action;
  }, [undoStack]);

  const clearUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  return { pushUndo, popUndo, clearUndo, hasUndo: undoStack.length > 0 };
}

