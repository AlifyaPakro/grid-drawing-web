import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHistoryStack,
  pushHistory,
  undoHistory,
  redoHistory,
  canUndo,
  canRedo,
  resetHistory,
} from './historyTracker';

test('createHistoryStack initializes correctly with empty past and future', () => {
  const initial = { cols: 8, rows: 10, color: '#fff' };
  const stack = createHistoryStack(initial);

  assert.equal(stack.past.length, 0);
  assert.equal(stack.future.length, 0);
  assert.deepEqual(stack.present, initial);
  assert.equal(canUndo(stack), false);
  assert.equal(canRedo(stack), false);
});

test('pushHistory pushes previous present onto past and sets new present', () => {
  const initial = { cols: 8, rows: 10 };
  let stack = createHistoryStack(initial);

  const state2 = { cols: 12, rows: 15 };
  stack = pushHistory(stack, state2);

  assert.equal(stack.past.length, 1);
  assert.deepEqual(stack.past[0], initial);
  assert.deepEqual(stack.present, state2);
  assert.equal(stack.future.length, 0);
  assert.equal(canUndo(stack), true);
  assert.equal(canRedo(stack), false);
});

test('pushHistory ignores identical state without growing stack', () => {
  const initial = { cols: 8, rows: 10 };
  let stack = createHistoryStack(initial);

  stack = pushHistory(stack, { cols: 8, rows: 10 });
  assert.equal(stack.past.length, 0);
  assert.equal(canUndo(stack), false);
});

test('pushHistory respects maxDepth by dropping oldest past states', () => {
  let stack = createHistoryStack({ val: 0 });

  for (let i = 1; i <= 10; i++) {
    stack = pushHistory(stack, { val: i }, 3); // max depth 3
  }

  assert.equal(stack.past.length, 3);
  // Last 3 past items before present val=10 should be 7, 8, 9
  assert.equal(stack.past[0].val, 7);
  assert.equal(stack.past[1].val, 8);
  assert.equal(stack.past[2].val, 9);
  assert.equal(stack.present.val, 10);
});

test('undoHistory moves present to future and pops past to present', () => {
  const s1 = { step: 1 };
  const s2 = { step: 2 };
  const s3 = { step: 3 };

  let stack = createHistoryStack(s1);
  stack = pushHistory(stack, s2);
  stack = pushHistory(stack, s3);

  assert.equal(stack.present.step, 3);
  assert.equal(stack.past.length, 2);

  // Undo 1 step (to s2)
  stack = undoHistory(stack);
  assert.equal(stack.present.step, 2);
  assert.equal(stack.past.length, 1);
  assert.equal(stack.future.length, 1);
  assert.equal(stack.future[0].step, 3);
  assert.equal(canUndo(stack), true);
  assert.equal(canRedo(stack), true);

  // Undo another step (to s1)
  stack = undoHistory(stack);
  assert.equal(stack.present.step, 1);
  assert.equal(stack.past.length, 0);
  assert.equal(stack.future.length, 2);
  assert.equal(canUndo(stack), false);
  assert.equal(canRedo(stack), true);

  // Undo when empty returns same
  const unchanged = undoHistory(stack);
  assert.equal(unchanged.present.step, 1);
  assert.equal(unchanged.past.length, 0);
});

test('redoHistory moves present to past and shifts future to present', () => {
  const s1 = { step: 1 };
  const s2 = { step: 2 };

  let stack = createHistoryStack(s1);
  stack = pushHistory(stack, s2);
  stack = undoHistory(stack);

  assert.equal(stack.present.step, 1);
  assert.equal(canRedo(stack), true);

  // Redo step
  stack = redoHistory(stack);
  assert.equal(stack.present.step, 2);
  assert.equal(stack.past.length, 1);
  assert.equal(stack.future.length, 0);
  assert.equal(canUndo(stack), true);
  assert.equal(canRedo(stack), false);

  // Redo when empty returns same
  const unchanged = redoHistory(stack);
  assert.equal(unchanged.present.step, 2);
});

test('pushHistory clears future redo stack if new action is performed after undo', () => {
  let stack = createHistoryStack({ val: 1 });
  stack = pushHistory(stack, { val: 2 });
  stack = pushHistory(stack, { val: 3 });
  stack = undoHistory(stack); // present is 2, future has 3

  assert.equal(stack.future.length, 1);

  // Perform branching new action
  stack = pushHistory(stack, { val: 99 });
  assert.equal(stack.present.val, 99);
  assert.equal(stack.future.length, 0); // future must be cleared
  assert.equal(canRedo(stack), false);
});

test('resetHistory clears past and future while preserving present state', () => {
  let stack = createHistoryStack({ val: 1 });
  stack = pushHistory(stack, { val: 2 });
  stack = pushHistory(stack, { val: 3 });
  stack = undoHistory(stack);

  stack = resetHistory(stack);
  assert.equal(stack.past.length, 0);
  assert.equal(stack.future.length, 0);
  assert.equal(stack.present.val, 2);
});
