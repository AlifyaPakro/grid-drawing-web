import { useState, useCallback, useRef, useEffect } from 'react';
import { AppStateSnapshot, CropRect, FilterConfig, GridConfig, HistoryStack, PhysicalConfig } from '../types';
import {
  canRedo as checkCanRedo,
  canUndo as checkCanUndo,
  createHistoryStack,
  pushHistory,
  redoHistory,
  undoHistory,
  resetHistory,
} from '../utils/historyTracker';

export interface UseHistoryStateReturn {
  state: AppStateSnapshot;
  gridConfig: GridConfig;
  physicalConfig: PhysicalConfig;
  filterConfig: FilterConfig;
  cropRect: CropRect | null;
  updateGridConfig: (partial: Partial<GridConfig>, isContinuous?: boolean) => void;
  updatePhysicalConfig: (partial: Partial<PhysicalConfig>, isContinuous?: boolean) => void;
  updateFilterConfig: (partial: Partial<FilterConfig>, isContinuous?: boolean) => void;
  updateCropRect: (crop: CropRect | null, isContinuous?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetToState: (snapshot: AppStateSnapshot) => void;
}

export function useHistoryState(initialState: AppStateSnapshot): UseHistoryStateReturn {
  const [history, setHistory] = useState<HistoryStack<AppStateSnapshot>>(() =>
    createHistoryStack(initialState)
  );

  // Ref to hold the current snapshot across timeouts
  const currentPresentRef = useRef<AppStateSnapshot>(history.present);
  currentPresentRef.current = history.present;

  // Debounce timer for continuous inputs (e.g. slider scrubbing)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baselineStateRef = useRef<AppStateSnapshot | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Generic state updater
  const updateSnapshot = useCallback(
    (
      updater: (prev: AppStateSnapshot) => AppStateSnapshot,
      isContinuous = false
    ) => {
      if (isContinuous) {
        // Continuous slider input:
        // Remember baseline before continuous stream started
        if (!baselineStateRef.current) {
          baselineStateRef.current = currentPresentRef.current;
        }

        const nextPresent = updater(currentPresentRef.current);
        // Update present immediately for responsive UI
        setHistory((prev) => ({
          ...prev,
          present: nextPresent,
        }));

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          if (baselineStateRef.current) {
            const baseline = baselineStateRef.current;
            baselineStateRef.current = null;
            // Push from baseline to current present
            setHistory((prev) => {
              // Ensure baseline was pushed to past if different
              const stackWithBaseline: HistoryStack<AppStateSnapshot> = {
                past: prev.past,
                present: baseline,
                future: prev.future,
              };
              return pushHistory(stackWithBaseline, prev.present);
            });
          }
        }, 300);
      } else {
        // Discrete change: flush any pending debounce first
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
          baselineStateRef.current = null;
        }

        setHistory((prev) => {
          const nextPresent = updater(prev.present);
          return pushHistory(prev, nextPresent);
        });
      }
    },
    []
  );

  const updateGridConfig = useCallback(
    (partial: Partial<GridConfig>, isContinuous = false) => {
      updateSnapshot(
        (prev) => ({
          ...prev,
          gridConfig: { ...prev.gridConfig, ...partial },
        }),
        isContinuous
      );
    },
    [updateSnapshot]
  );

  const updatePhysicalConfig = useCallback(
    (partial: Partial<PhysicalConfig>, isContinuous = false) => {
      updateSnapshot(
        (prev) => ({
          ...prev,
          physicalConfig: { ...prev.physicalConfig, ...partial },
        }),
        isContinuous
      );
    },
    [updateSnapshot]
  );

  const updateFilterConfig = useCallback(
    (partial: Partial<FilterConfig>, isContinuous = false) => {
      updateSnapshot(
        (prev) => ({
          ...prev,
          filterConfig: { ...prev.filterConfig, ...partial },
        }),
        isContinuous
      );
    },
    [updateSnapshot]
  );

  const updateCropRect = useCallback(
    (crop: CropRect | null, isContinuous = false) => {
      updateSnapshot(
        (prev) => ({
          ...prev,
          cropRect: crop,
        }),
        isContinuous
      );
    },
    [updateSnapshot]
  );

  const undo = useCallback(() => {
    // Flush any pending continuous action
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      baselineStateRef.current = null;
    }
    setHistory((prev) => undoHistory(prev));
  }, []);

  const redo = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      baselineStateRef.current = null;
    }
    setHistory((prev) => redoHistory(prev));
  }, []);

  const resetToState = useCallback((snapshot: AppStateSnapshot) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      baselineStateRef.current = null;
    }
    setHistory(() => createHistoryStack(snapshot));
  }, []);

  return {
    state: history.present,
    gridConfig: history.present.gridConfig,
    physicalConfig: history.present.physicalConfig,
    filterConfig: history.present.filterConfig,
    cropRect: history.present.cropRect,
    updateGridConfig,
    updatePhysicalConfig,
    updateFilterConfig,
    updateCropRect,
    undo,
    redo,
    canUndo: checkCanUndo(history),
    canRedo: checkCanRedo(history),
    resetToState,
  };
}
