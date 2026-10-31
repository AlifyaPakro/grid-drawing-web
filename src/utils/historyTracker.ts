import { HistoryStack } from '../types';

export const DEFAULT_MAX_HISTORY_DEPTH = 50;

/**
 * Deep clones any plain JS object or structure
 */
export function cloneDeep<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // fallback if structuredClone fails on non-cloneables
    }
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * Fast deep equality check for plain state objects
 */
export function isDeepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Creates an empty stack initialized with present state
 */
export function createHistoryStack<T>(initialState: T): HistoryStack<T> {
  return {
    past: [],
    present: cloneDeep(initialState),
    future: [],
  };
}

/**
 * Pushes a new state snapshot to the history stack.
 * If the next state is equal to current present, returns unchanged stack.
 * Clears future (redo) stack.
 * Limits past stack to maxDepth entries.
 */
export function pushHistory<T>(
  stack: HistoryStack<T>,
  nextState: T,
  maxDepth: number = DEFAULT_MAX_HISTORY_DEPTH
): HistoryStack<T> {
  if (isDeepEqual(stack.present, nextState)) {
    return stack;
  }

  const nextPast = [...stack.past, cloneDeep(stack.present)];
  if (nextPast.length > maxDepth) {
    nextPast.splice(0, nextPast.length - maxDepth);
  }

  return {
    past: nextPast,
    present: cloneDeep(nextState),
    future: [],
  };
}

/**
 * Undoes one step:
 * Pops latest state from past stack, pushes current present to future stack.
 */
export function undoHistory<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.past.length === 0) {
    return stack;
  }

  const newPast = [...stack.past];
  const previous = newPast.pop()!;

  return {
    past: newPast,
    present: previous,
    future: [cloneDeep(stack.present), ...stack.future],
  };
}

/**
 * Redoes one step:
 * Pops earliest state from future stack, pushes current present to past stack.
 */
export function redoHistory<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.future.length === 0) {
    return stack;
  }

  const newFuture = [...stack.future];
  const next = newFuture.shift()!;

  return {
    past: [...stack.past, cloneDeep(stack.present)],
    present: next,
    future: newFuture,
  };
}

/**
 * Checks whether undo is available
 */
export function canUndo<T>(stack: HistoryStack<T>): boolean {
  return stack.past.length > 0;
}

/**
 * Checks whether redo is available
 */
export function canRedo<T>(stack: HistoryStack<T>): boolean {
  return stack.future.length > 0;
}

/**
 * Clears past and future history while retaining present state
 */
export function resetHistory<T>(stack: HistoryStack<T>): HistoryStack<T> {
  return {
    past: [],
    present: cloneDeep(stack.present),
    future: [],
  };
}
