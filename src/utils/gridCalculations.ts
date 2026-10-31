import { GridCellDimensions, PaperPreset, PaperPresetId, PhysicalConfig, Unit } from '../types';

export const PAPER_PRESETS: PaperPreset[] = [
  { id: 'custom', name: 'Custom Dimensions', widthCm: 21.0, heightCm: 29.7, category: 'ISO' },
  { id: 'a4', name: 'A4 (21.0 × 29.7 cm)', widthCm: 21.0, heightCm: 29.7, category: 'ISO' },
  { id: 'a3', name: 'A3 (29.7 × 42.0 cm)', widthCm: 29.7, heightCm: 42.0, category: 'ISO' },
  { id: 'a5', name: 'A5 (14.8 × 21.0 cm)', widthCm: 14.8, heightCm: 21.0, category: 'ISO' },
  { id: 'letter', name: 'US Letter (8.5 × 11 in)', widthCm: 21.59, heightCm: 27.94, category: 'US' },
  { id: 'photo_8x10', name: 'Photo (8 × 10 in)', widthCm: 20.32, heightCm: 25.4, category: 'US' },
  { id: 'canvas_30x40', name: 'Canvas (30 × 40 cm)', widthCm: 30.0, heightCm: 40.0, category: 'Canvas' },
  { id: 'canvas_40x50', name: 'Canvas (40 × 50 cm)', widthCm: 40.0, heightCm: 50.0, category: 'Canvas' },
  { id: 'square_20', name: 'Square (20 × 20 cm)', widthCm: 20.0, heightCm: 20.0, category: 'Square' },
  { id: 'square_30', name: 'Square (30 × 30 cm)', widthCm: 30.0, heightCm: 30.0, category: 'Square' },
];

export const CM_PER_INCH = 2.54;

export function convertCmToUnit(valInCm: number, targetUnit: Unit): number {
  if (targetUnit === 'cm') return valInCm;
  if (targetUnit === 'mm') return valInCm * 10;
  if (targetUnit === 'in') return valInCm / CM_PER_INCH;
  return valInCm;
}

export function convertUnitToCm(val: number, sourceUnit: Unit): number {
  if (sourceUnit === 'cm') return val;
  if (sourceUnit === 'mm') return val / 10;
  if (sourceUnit === 'in') return val * CM_PER_INCH;
  return val;
}

/**
 * Calculates physical target dimensions based on preset, custom inputs,
 * and whether the aspect ratio should be locked to the image's native aspect ratio.
 */
export function calculatePhysicalDimensions(
  imageWidthPx: number,
  imageHeightPx: number,
  config: PhysicalConfig
): { widthCm: number; heightCm: number } {
  if (imageWidthPx <= 0 || imageHeightPx <= 0) {
    return { widthCm: 21.0, heightCm: 29.7 };
  }

  const imageAspect = imageWidthPx / imageHeightPx;

  if (config.preset !== 'custom') {
    const preset = PAPER_PRESETS.find((p) => p.id === config.preset);
    if (preset) {
      // Determine orientation matching image
      let pWidth = preset.widthCm;
      let pHeight = preset.heightCm;

      // If image is landscape and preset is portrait, rotate paper
      if ((imageAspect > 1 && pWidth < pHeight) || (imageAspect < 1 && pWidth > pHeight)) {
        const temp = pWidth;
        pWidth = pHeight;
        pHeight = temp;
      }

      if (config.lockAspectToImage) {
        // Fit within the preset paper while preserving image aspect ratio
        const paperAspect = pWidth / pHeight;
        if (imageAspect > paperAspect) {
          // Fit to width
          return {
            widthCm: pWidth,
            heightCm: Number((pWidth / imageAspect).toFixed(2)),
          };
        } else {
          // Fit to height
          return {
            widthCm: Number((pHeight * imageAspect).toFixed(2)),
            heightCm: pHeight,
          };
        }
      }

      return { widthCm: pWidth, heightCm: pHeight };
    }
  }

  // Custom mode
  const widthCm = Math.max(1, config.targetWidthCm || 20);
  if (config.lockAspectToImage) {
    return {
      widthCm: Number(widthCm.toFixed(2)),
      heightCm: Number((widthCm / imageAspect).toFixed(2)),
    };
  }

  const heightCm = Math.max(1, config.targetHeightCm || 20);
  return {
    widthCm: Number(widthCm.toFixed(2)),
    heightCm: Number(heightCm.toFixed(2)),
  };
}

/**
 * For a square grid (1:1 aspect cells), given the desired number of columns,
 * calculate the number of rows such that cells are as close to square as possible.
 */
export function calculateSquareGridRows(
  imageWidthPx: number,
  imageHeightPx: number,
  columns: number
): number {
  if (imageWidthPx <= 0 || imageHeightPx <= 0 || columns <= 0) return 1;
  const cellWidthPx = imageWidthPx / columns;
  const rows = Math.round(imageHeightPx / cellWidthPx);
  return Math.max(1, rows);
}

/**
 * Computes exact cell dimensions in px, cm, mm, and inches.
 */
export function calculateGridCellDimensions(
  imageWidthPx: number,
  imageHeightPx: number,
  columns: number,
  rows: number,
  physicalWidthCm: number,
  physicalHeightCm: number
): GridCellDimensions {
  const safeCols = Math.max(1, columns);
  const safeRows = Math.max(1, rows);
  const safeImgW = Math.max(1, imageWidthPx);
  const safeImgH = Math.max(1, imageHeightPx);
  const safePhysW = Math.max(0.1, physicalWidthCm);
  const safePhysH = Math.max(0.1, physicalHeightCm);

  const cellWidthPx = safeImgW / safeCols;
  const cellHeightPx = safeImgH / safeRows;

  const cellWidthCm = safePhysW / safeCols;
  const cellHeightCm = safePhysH / safeRows;

  const cellWidthMm = cellWidthCm * 10;
  const cellHeightMm = cellHeightCm * 10;

  const cellWidthIn = cellWidthCm / CM_PER_INCH;
  const cellHeightIn = cellHeightCm / CM_PER_INCH;

  const aspectRatio = cellWidthPx / cellHeightPx;
  const isSquare = Math.abs(aspectRatio - 1.0) < 0.03;

  return {
    cols: safeCols,
    rows: safeRows,
    cellWidthPx: Number(cellWidthPx.toFixed(2)),
    cellHeightPx: Number(cellHeightPx.toFixed(2)),
    cellWidthCm: Number(cellWidthCm.toFixed(2)),
    cellHeightCm: Number(cellHeightCm.toFixed(2)),
    cellWidthMm: Number(cellWidthMm.toFixed(1)),
    cellHeightMm: Number(cellHeightMm.toFixed(1)),
    cellWidthIn: Number(cellWidthIn.toFixed(2)),
    cellHeightIn: Number(cellHeightIn.toFixed(2)),
    aspectRatio: Number(aspectRatio.toFixed(3)),
    isSquare,
    totalCells: safeCols * safeRows,
  };
}

/**
 * Converts 0-based column index to letter label (0 -> A, 25 -> Z, 26 -> AA)
 */
export function getColumnLetterLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

/**
 * Formats measurement with unit
 */
export function formatMeasurement(val: number, unit: Unit, decimals = 2): string {
  return `${val.toFixed(decimals)} ${unit}`;
}
