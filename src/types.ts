export type Unit = 'cm' | 'mm' | 'in';

export type PaperPresetId = 'custom' | 'a4' | 'a3' | 'a5' | 'letter' | 'square_20' | 'square_30' | 'canvas_30x40' | 'canvas_40x50' | 'photo_8x10';

export interface PaperPreset {
  id: PaperPresetId;
  name: string;
  widthCm: number;
  heightCm: number;
  category: 'ISO' | 'US' | 'Canvas' | 'Square';
}

export type GridMode = 'custom' | 'square';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface GridConfig {
  columns: number;
  rows: number;
  mode: GridMode; // 'custom' (independent cols/rows) or 'square' (uniform square cells)
  color: string;
  opacity: number; // 0.1 to 1.0
  lineWidth: number; // 1 to 8
  lineStyle: LineStyle;
  showDiagonals: boolean; // draw X in each cell (classical transfer)
  showSubdivisions: boolean; // fine 2x2 or 4x4 lines
  subdivisionCount: 2 | 3 | 4;
  showCenterLines: boolean; // major center X and Y axes
  showRuleOfThirds: boolean;
  showCoordinates: boolean; // 1,2,3... A,B,C...
  coordinateFontSize: number; // relative px
  coordinateColor: string;
  coordinateBackground: boolean;
}

export interface PhysicalConfig {
  preset: PaperPresetId;
  targetWidthCm: number;
  targetHeightCm: number;
  lockAspectToImage: boolean;
  unit: Unit;
  dpi: number; // reference DPI for digital screen-to-print math
}

export interface FilterConfig {
  isGrayscale: boolean;
  brightness: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  posterizeLevels: number; // 0 = off, 2..8 = levels of tonal masses
  invert: boolean;
}

export interface GridCellDimensions {
  cols: number;
  rows: number;
  cellWidthPx: number;
  cellHeightPx: number;
  cellWidthCm: number;
  cellHeightCm: number;
  cellWidthMm: number;
  cellHeightMm: number;
  cellWidthIn: number;
  cellHeightIn: number;
  aspectRatio: number;
  isSquare: boolean;
  totalCells: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppStateSnapshot {
  gridConfig: GridConfig;
  physicalConfig: PhysicalConfig;
  filterConfig: FilterConfig;
  cropRect: CropRect | null;
}

export interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}


