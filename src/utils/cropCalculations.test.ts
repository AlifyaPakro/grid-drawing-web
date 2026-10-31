import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultCropRect,
  clampCropRect,
  resizeCropRect,
} from './cropCalculations';

test('getDefaultCropRect generates centered 80% rectangle', () => {
  const rect = getDefaultCropRect(1000, 1000);
  assert.equal(rect.width, 800);
  assert.equal(rect.height, 800);
  assert.equal(rect.x, 100);
  assert.equal(rect.y, 100);
});

test('getDefaultCropRect with 1:1 aspect ratio on rectangle image', () => {
  const rect = getDefaultCropRect(1000, 500, 1.0);
  assert.equal(rect.width, 400);
  assert.equal(rect.height, 400);
  assert.equal(rect.y, 50);
  assert.equal(rect.x, 300);
});

test('clampCropRect clamps within image bounds', () => {
  const outOfBounds = { x: -50, y: -50, width: 600, height: 600 };
  const clamped = clampCropRect(outOfBounds, 500, 500);
  assert.ok(clamped.x >= 0);
  assert.ok(clamped.y >= 0);
  assert.ok(clamped.x + clamped.width <= 500);
  assert.ok(clamped.y + clamped.height <= 500);
});

test('resizeCropRect moves rectangle on handle=move', () => {
  const initial = { x: 100, y: 100, width: 200, height: 200 };
  const moved = resizeCropRect(initial, 'move', 50, 30, 1000, 1000);
  assert.equal(moved.x, 150);
  assert.equal(moved.y, 130);
  assert.equal(moved.width, 200);
  assert.equal(moved.height, 200);
});

test('resizeCropRect expands right on handle=e', () => {
  const initial = { x: 100, y: 100, width: 200, height: 200 };
  const expanded = resizeCropRect(initial, 'e', 50, 0, 1000, 1000);
  assert.equal(expanded.x, 100);
  assert.equal(expanded.width, 250);
  assert.equal(expanded.height, 200);
});

test('resizeCropRect shrinks from left on handle=w', () => {
  const initial = { x: 100, y: 100, width: 200, height: 200 };
  const shrunk = resizeCropRect(initial, 'w', 30, 0, 1000, 1000);
  assert.equal(shrunk.x, 130);
  assert.equal(shrunk.width, 170);
});
