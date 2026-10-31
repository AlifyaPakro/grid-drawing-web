import React, { useState } from 'react';
import {
  Grid,
  Ruler,
  Sliders,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lock,
  Unlock,
  Check,
  Palette,
  Eye,
  Hash,
  Maximize,
  Sparkles,
  Contrast,
  X,
} from 'lucide-react';
import {
  FilterConfig,
  GridCellDimensions,
  GridConfig,
  PaperPresetId,
  PhysicalConfig,
  Unit,
} from '../types';
import { PAPER_PRESETS, convertCmToUnit, convertUnitToCm } from '../utils/gridCalculations';

interface SettingsSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  gridConfig: GridConfig;
  onUpdateGridConfig: (partial: Partial<GridConfig>, isContinuous?: boolean) => void;
  physicalConfig: PhysicalConfig;
  onUpdatePhysicalConfig: (partial: Partial<PhysicalConfig>, isContinuous?: boolean) => void;
  filterConfig: FilterConfig;
  onUpdateFilterConfig: (partial: Partial<FilterConfig>, isContinuous?: boolean) => void;
  cellDims: GridCellDimensions;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
}

type TabKey = 'grid' | 'scale' | 'overlays' | 'tone';

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Deep Black', hex: '#000000' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Golden Yellow', hex: '#eab308' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Neon Magenta', hex: '#d946ef' },
  { name: 'Lime Green', hex: '#84cc16' },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isOpen,
  onToggleOpen,
  gridConfig,
  onUpdateGridConfig,
  physicalConfig,
  onUpdatePhysicalConfig,
  filterConfig,
  onUpdateFilterConfig,
  cellDims,
  imageNaturalWidth,
  imageNaturalHeight,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('grid');

  // Handle square mode lock change
  const handleModeChange = (mode: 'custom' | 'square') => {
    if (mode === 'square' && imageNaturalWidth && imageNaturalHeight) {
      const cellW = imageNaturalWidth / gridConfig.columns;
      const targetRows = Math.max(1, Math.round(imageNaturalHeight / cellW));
      onUpdateGridConfig({ mode, rows: targetRows });
    } else {
      onUpdateGridConfig({ mode });
    }
  };

  const handleColumnsChange = (cols: number) => {
    const validCols = Math.max(1, Math.min(60, cols));
    if (gridConfig.mode === 'square' && imageNaturalWidth && imageNaturalHeight) {
      const cellW = imageNaturalWidth / validCols;
      const targetRows = Math.max(1, Math.round(imageNaturalHeight / cellW));
      onUpdateGridConfig({ columns: validCols, rows: targetRows });
    } else {
      onUpdateGridConfig({ columns: validCols });
    }
  };

  const handleRowsChange = (rows: number) => {
    const validRows = Math.max(1, Math.min(60, rows));
    if (gridConfig.mode === 'square') {
      // Switching to custom if manually overriding rows in square mode
      onUpdateGridConfig({ rows: validRows, mode: 'custom' });
    } else {
      onUpdateGridConfig({ rows: validRows });
    }
  };

  const handlePresetSelect = (presetId: PaperPresetId) => {
    const preset = PAPER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onUpdatePhysicalConfig({
        preset: presetId,
        targetWidthCm: preset.widthCm,
        targetHeightCm: preset.heightCm,
      });
    } else {
      onUpdatePhysicalConfig({ preset: 'custom' });
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 right-0 z-40 flex flex-col w-84 md:w-96 bg-zinc-900 border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header with Tabs */}
        <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white tracking-tight">
                Grid & Scaling Tools
              </span>
            </div>
            <button
              onClick={onToggleOpen}
              aria-label="Collapse sidebar"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 px-2 pb-2 gap-1 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${
                activeTab === 'grid'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scale')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${
                activeTab === 'scale'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Scale & cm</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overlays')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${
                activeTab === 'overlays'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Assists</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tone')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${
                activeTab === 'tone'
                  ? 'bg-zinc-800 text-amber-400 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>Tone / B&W</span>
            </button>
          </div>
        </div>

        {/* Real-time Calculation Sticky Banner inside sidebar */}
        <div className="shrink-0 mx-3 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
              Active Cell Dimensions
            </span>
            <span className="text-[11px] font-mono text-zinc-300">
              {cellDims.cols} × {cellDims.rows} ({cellDims.totalCells} cells)
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-base font-bold text-white tracking-tight">
              {cellDims.cellWidthCm} × {cellDims.cellHeightCm} <span className="text-xs font-normal text-amber-400">cm</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {cellDims.cellWidthMm} × {cellDims.cellHeightMm} mm
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5 pt-1.5 border-t border-amber-500/20">
            <span>
              {cellDims.isSquare ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 1:1 Square Cells
                </span>
              ) : (
                <span>Aspect: {cellDims.aspectRatio}:1</span>
              )}
            </span>
            <span className="text-zinc-400 font-mono">
              ≈ {cellDims.cellWidthIn}" × {cellDims.cellHeightIn}"
            </span>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* TAB 1: GRID CONTROLS */}
          {activeTab === 'grid' && (
            <div className="space-y-5">
              {/* Grid Mode Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Grid Proportion Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange('square')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      gridConfig.mode === 'square'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Square (1:1 Lock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('custom')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                      gridConfig.mode === 'custom'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Custom Cols/Rows</span>
                  </button>
                </div>
              </div>

              {/* Vertical Grid Lines (Columns) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="cols-slider" className="text-zinc-300 font-medium">
                    Vertical Lines (Columns)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={gridConfig.columns}
                      onChange={(e) => handleColumnsChange(parseInt(e.target.value) || 1)}
                      className="w-14 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-right text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-zinc-500">cols</span>
                  </div>
                </div>
                <input
                  id="cols-slider"
                  type="range"
                  min={1}
                  max={40}
                  value={gridConfig.columns}
                  onChange={(e) => handleColumnsChange(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Horizontal Grid Lines (Rows) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="rows-slider" className="text-zinc-300 font-medium">
                    Horizontal Lines (Rows)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={gridConfig.rows}
                      disabled={gridConfig.mode === 'square'}
                      onChange={(e) => handleRowsChange(parseInt(e.target.value) || 1)}
                      className="w-14 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-right text-white font-mono focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                    <span className="text-[11px] text-zinc-500">rows</span>
                  </div>
                </div>
                <input
                  id="rows-slider"
                  type="range"
                  min={1}
                  max={40}
                  value={gridConfig.rows}
                  disabled={gridConfig.mode === 'square'}
                  onChange={(e) => handleRowsChange(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-50"
                />
                {gridConfig.mode === 'square' && (
                  <p className="text-[11px] text-zinc-500 italic">
                    Rows automatically calculated to keep each cell exactly square.
                  </p>
                )}
              </div>

              {/* Grid Line Color */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-xs font-medium text-zinc-300">
                  Grid Line Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => onUpdateGridConfig({ color: color.hex })}
                      title={color.name}
                      style={{ backgroundColor: color.hex }}
                      className={`w-6 h-6 rounded-full border transition relative ${
                        gridConfig.color.toLowerCase() === color.hex.toLowerCase()
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                          : 'border-zinc-700 hover:scale-105'
                      }`}
                    />
                  ))}
                  {/* Custom color input */}
                  <label
                    title="Custom color picker"
                    className="w-6 h-6 rounded-full border border-zinc-700 bg-linear-to-tr from-rose-500 via-amber-400 to-sky-500 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  >
                    <input
                      type="color"
                      value={gridConfig.color}
                      onChange={(e) => onUpdateGridConfig({ color: e.target.value })}
                      className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* Grid Line Opacity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Line Opacity</span>
                  <span className="font-mono text-zinc-400">
                    {Math.round(gridConfig.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={gridConfig.opacity}
                  onChange={(e) => onUpdateGridConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Grid Line Thickness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Line Thickness</span>
                  <span className="font-mono text-zinc-400">{gridConfig.lineWidth} px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={gridConfig.lineWidth}
                  onChange={(e) => onUpdateGridConfig({ lineWidth: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Line Style (Solid, Dashed, Dotted) */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Line Pattern Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onUpdateGridConfig({ lineStyle: style })}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                        gridConfig.lineStyle === style
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCALE & PHYSICAL PAPER SIZING */}
          {activeTab === 'scale' && (
            <div className="space-y-5">
              {/* Paper Presets */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Physical Drawing / Paper Size
                </label>
                <select
                  value={physicalConfig.preset}
                  onChange={(e) => handlePresetSelect(e.target.value as PaperPresetId)}
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <optgroup label="Standard ISO Paper">
                    <option value="a4">A4 (21.0 × 29.7 cm)</option>
                    <option value="a3">A3 (29.7 × 42.0 cm)</option>
                    <option value="a5">A5 (14.8 × 21.0 cm)</option>
                  </optgroup>
                  <optgroup label="US Formats">
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                    <option value="photo_8x10">Photo (8 × 10 in)</option>
                  </optgroup>
                  <optgroup label="Canvases & Squares">
                    <option value="canvas_30x40">Canvas (30 × 40 cm)</option>
                    <option value="canvas_40x50">Canvas (40 × 50 cm)</option>
                    <option value="square_20">Square (20 × 20 cm)</option>
                    <option value="square_30">Square (30 × 30 cm)</option>
                  </optgroup>
                  <option value="custom">Custom Physical Dimensions...</option>
                </select>
              </div>

              {/* Custom Target Dimensions in cm / inches */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Target Drawing Size</span>
                  <div className="flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700">
                    {(['cm', 'mm', 'in'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => onUpdatePhysicalConfig({ unit })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                          physicalConfig.unit === unit
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Width ({physicalConfig.unit})
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      value={Number(
                        convertCmToUnit(physicalConfig.targetWidthCm, physicalConfig.unit).toFixed(1)
                      )}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        onUpdatePhysicalConfig({
                          targetWidthCm: convertUnitToCm(val, physicalConfig.unit),
                          preset: 'custom',
                        });
                      }}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Height ({physicalConfig.unit})
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      value={Number(
                        convertCmToUnit(physicalConfig.targetHeightCm, physicalConfig.unit).toFixed(1)
                      )}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        onUpdatePhysicalConfig({
                          targetHeightCm: convertUnitToCm(val, physicalConfig.unit),
                          preset: 'custom',
                        });
                      }}
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={physicalConfig.lockAspectToImage}
                    onChange={(e) =>
                      onUpdatePhysicalConfig({ lockAspectToImage: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-zinc-300">
                    Match target paper aspect ratio to image
                  </span>
                </label>
              </div>

              {/* DPI / PPI Reference Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Digital PPI / DPI</span>
                  <span className="font-mono text-zinc-400">{physicalConfig.dpi} DPI</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[72, 96, 150, 300].map((dpiVal) => (
                    <button
                      key={dpiVal}
                      type="button"
                      onClick={() => onUpdatePhysicalConfig({ dpi: dpiVal })}
                      className={`py-1 rounded-lg text-xs font-mono border transition ${
                        physicalConfig.dpi === dpiVal
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {dpiVal}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">
                  Standard screens use 96 DPI; high-quality print is 300 DPI.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ARTIST OVERLAYS & ASSISTS */}
          {activeTab === 'overlays' && (
            <div className="space-y-4">
              {/* Diagonals / X in each cell */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">
                      Cell Diagonals (X-Boxes)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Classical Renaissance method for transferring angles & curves
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridConfig.showDiagonals}
                    onChange={(e) => onUpdateGridConfig({ showDiagonals: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Subdivisions */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Cell Subdivisions</div>
                    <div className="text-[10px] text-zinc-400">
                      Fine internal lines for detailed areas
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridConfig.showSubdivisions}
                    onChange={(e) => onUpdateGridConfig({ showSubdivisions: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>

                {gridConfig.showSubdivisions && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Split into:</span>
                    <div className="flex gap-1.5">
                      {([2, 3, 4] as const).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => onUpdateGridConfig({ subdivisionCount: count })}
                          className={`px-2.5 py-0.5 rounded text-xs font-mono border transition ${
                            gridConfig.subdivisionCount === count
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {count}×{count}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinate Labels */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">
                      Border Coordinates (1, 2... & A, B...)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Track and map cells between reference and paper
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridConfig.showCoordinates}
                    onChange={(e) => onUpdateGridConfig({ showCoordinates: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>

                {gridConfig.showCoordinates && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">Text Size</span>
                      <input
                        type="range"
                        min={10}
                        max={28}
                        value={gridConfig.coordinateFontSize}
                        onChange={(e) =>
                          onUpdateGridConfig({ coordinateFontSize: parseInt(e.target.value) })
                        }
                        className="w-24 accent-amber-500 h-1 bg-zinc-800 rounded"
                      />
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] text-zinc-400">High-Contrast Backing</span>
                      <input
                        type="checkbox"
                        checked={gridConfig.coordinateBackground}
                        onChange={(e) =>
                          onUpdateGridConfig({ coordinateBackground: e.target.checked })
                        }
                        className="w-3.5 h-3.5 rounded text-amber-500 bg-zinc-800 border-zinc-700"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Center Crosshairs */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Center Quadrant Crosshairs</div>
                    <div className="text-[10px] text-zinc-400">
                      Bold central axes through midpoint of image
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridConfig.showCenterLines}
                    onChange={(e) => onUpdateGridConfig({ showCenterLines: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Rule of Thirds */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Rule of Thirds Guidelines</div>
                    <div className="text-[10px] text-zinc-400">
                      Compositional balance intersections
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gridConfig.showRuleOfThirds}
                    onChange={(e) => onUpdateGridConfig({ showRuleOfThirds: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: VALUES & TONAL FILTERS */}
          {activeTab === 'tone' && (
            <div className="space-y-4">
              {/* Black & White Master Toggle */}
              <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Black & White / Grayscale
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Eliminate color distraction to accurately judge values
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateFilterConfig({ isGrayscale: !filterConfig.isGrayscale })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      filterConfig.isGrayscale ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        filterConfig.isGrayscale ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Brightness Adjustment</span>
                  <span className="font-mono text-zinc-400">
                    {filterConfig.brightness > 0 ? `+${filterConfig.brightness}` : filterConfig.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-80}
                  max={80}
                  value={filterConfig.brightness}
                  onChange={(e) =>
                    onUpdateFilterConfig({ brightness: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Contrast Boost</span>
                  <span className="font-mono text-zinc-400">
                    {filterConfig.contrast > 0 ? `+${filterConfig.contrast}` : filterConfig.contrast}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-80}
                  max={120}
                  value={filterConfig.contrast}
                  onChange={(e) =>
                    onUpdateFilterConfig({ contrast: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tonal Posterization */}
              <div className="space-y-2 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-300">
                  Tonal Posterization (Value Masses)
                </label>
                <div className="grid grid-cols-5 gap-1 text-xs">
                  {[
                    { val: 0, label: 'Off' },
                    { val: 3, label: '3-tone' },
                    { val: 4, label: '4-tone' },
                    { val: 5, label: '5-tone' },
                    { val: 8, label: '8-tone' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => onUpdateFilterConfig({ posterizeLevels: item.val })}
                      className={`py-1 rounded text-center border font-mono text-[11px] transition ${
                        filterConfig.posterizeLevels === item.val
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">
                  Groups continuous tones into discrete values for block-in drawing.
                </p>
              </div>

              {/* Invert Colors */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-white">Invert Negative</div>
                    <div className="text-[10px] text-zinc-400">
                      Great for white pencil / chalk on black paper
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={filterConfig.invert}
                    onChange={(e) => onUpdateFilterConfig({ invert: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Reset Tone Filters */}
              <button
                type="button"
                onClick={() =>
                  onUpdateFilterConfig({
                    isGrayscale: false,
                    brightness: 0,
                    contrast: 0,
                    posterizeLevels: 0,
                    invert: false,
                  })
                }
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Tonal Filters</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle button on the desktop edge when closed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          aria-label="Open settings panel"
          className="fixed top-20 right-0 z-30 flex items-center gap-1.5 px-3 py-2 rounded-l-xl bg-zinc-900/90 hover:bg-zinc-850 text-amber-400 border-l border-y border-zinc-700 shadow-xl backdrop-blur-md transition group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span className="text-xs font-semibold text-zinc-200">Grid Settings</span>
        </button>
      )}
    </>
  );
};
