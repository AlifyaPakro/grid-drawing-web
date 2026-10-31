import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCmToUnit,
  convertUnitToCm,
  calculatePhysicalDimensions,
  calculateSquareGridRows,
  calculateGridCellDimensions,
  getColumnLetterLabel,
  formatMeasurement,
} from './gridCalculations';

test('unit conversion between cm, mm, and inches', () => {
  // cm to mm
  assert.equal(convertCmToUnit(2.54, 'mm'), 25.4);
  // cm to in
  assert.equal(convertCmToUnit(2.54, 'in'), 1.0);
  // cm to cm
  assert.equal(convertCmToUnit(10, 'cm'), 10);

  // in to cm
  assert.equal(convertUnitToCm(1, 'in'), 2.54);
  // mm to cm
  assert.equal(convertUnitToCm(25.4, 'mm'), 2.54);
  // cm to cm
  assert.equal(convertUnitToCm(15, 'cm'), 15);
});

test('calculatePhysicalDimensions handles A4 preset in portrait and landscape', () => {
  // Portrait image (1000 x 2000)
  const portraitDims = calculatePhysicalDimensions(1000, 2000, {
    preset: 'a4',
    targetWidthCm: 21,
    targetHeightCm: 29.7,
    lockAspectToImage: false,
    unit: 'cm',
    dpi: 96,
  });
  assert.equal(portraitDims.widthCm, 21.0);
  assert.equal(portraitDims.heightCm, 29.7);

  // Landscape image (2000 x 1000) -> should rotate A4 to landscape
  const landscapeDims = calculatePhysicalDimensions(2000, 1000, {
    preset: 'a4',
    targetWidthCm: 21,
    targetHeightCm: 29.7,
    lockAspectToImage: false,
    unit: 'cm',
    dpi: 96,
  });
  assert.equal(landscapeDims.widthCm, 29.7);
  assert.equal(landscapeDims.heightCm, 21.0);
});

test('calculatePhysicalDimensions handles aspect lock to image', () => {
  // Square image 1000x1000 with custom width 20cm
  const dims = calculatePhysicalDimensions(1000, 1000, {
    preset: 'custom',
    targetWidthCm: 20,
    targetHeightCm: 35,
    lockAspectToImage: true,
    unit: 'cm',
    dpi: 96,
  });
  assert.equal(dims.widthCm, 20.0);
  assert.equal(dims.heightCm, 20.0);
});

test('calculateSquareGridRows derives correct number of rows for 1:1 cells', () => {
  // 1000x2000 (aspect 0.5) with 5 columns -> 10 rows
  const rows = calculateSquareGridRows(1000, 2000, 5);
  assert.equal(rows, 10);

  // 1200x800 with 6 columns -> cell width is 200px -> 800/200 = 4 rows
  const rows2 = calculateSquareGridRows(1200, 800, 6);
  assert.equal(rows2, 4);
});

test('calculateGridCellDimensions accurately reports cm, mm, in and isSquare', () => {
  const result = calculateGridCellDimensions(1000, 1000, 10, 10, 20, 20);
  assert.equal(result.cols, 10);
  assert.equal(result.rows, 10);
  assert.equal(result.cellWidthPx, 100);
  assert.equal(result.cellHeightPx, 100);
  assert.equal(result.cellWidthCm, 2.0);
  assert.equal(result.cellHeightCm, 2.0);
  assert.equal(result.cellWidthMm, 20.0);
  assert.equal(result.cellHeightMm, 20.0);
  assert.equal(result.isSquare, true);
  assert.equal(result.totalCells, 100);
});

test('getColumnLetterLabel converts indices to letters', () => {
  assert.equal(getColumnLetterLabel(0), 'A');
  assert.equal(getColumnLetterLabel(1), 'B');
  assert.equal(getColumnLetterLabel(25), 'Z');
  assert.equal(getColumnLetterLabel(26), 'AA');
});

test('formatMeasurement returns formatted string with units', () => {
  assert.equal(formatMeasurement(2.5, 'cm', 2), '2.50 cm');
  assert.equal(formatMeasurement(25, 'mm', 0), '25 mm');
});
