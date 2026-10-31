import React from 'react';
import {
  Grid3X3,
  Image as ImageIcon,
  Download,
  Contrast,
  Sliders,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Undo2,
  Redo2,
  Crop,
} from 'lucide-react';
import { FilterConfig, GridCellDimensions, GridConfig } from '../types';

interface HeaderBarProps {
  imageName?: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  cellDims: GridCellDimensions;
  isGridVisible: boolean;
  onToggleGridVisible: () => void;
  filterConfig: FilterConfig;
  onToggleGrayscale: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onChangeImageRequest: () => void;
  onOpenExportModal: () => void;
  onOpenShortcutsModal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isCropMode: boolean;
  onToggleCropMode: () => void;
  hasCrop: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  imageName,
  imageNaturalWidth,
  imageNaturalHeight,
  cellDims,
  isGridVisible,
  onToggleGridVisible,
  filterConfig,
  onToggleGrayscale,
  isSidebarOpen,
  onToggleSidebar,
  onChangeImageRequest,
  onOpenExportModal,
  onOpenShortcutsModal,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isCropMode,
  onToggleCropMode,
  hasCrop,
}) => {
  return (
    <header className="h-14 shrink-0 bg-zinc-900 border-b border-zinc-800 px-3 sm:px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-amber-500/10">
            <Grid3X3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">
                ArtisanGrid
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden sm:inline-block">
                STUDIO
              </span>
            </div>
          </div>
        </div>

        {/* Current Image & Cell Quick Info (Desktop) */}
        {imageNaturalWidth > 0 && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
            <span className="text-zinc-300 font-medium truncate max-w-44">
              {imageName || 'Active Reference'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-[11px] text-zinc-400">
              {imageNaturalWidth} × {imageNaturalHeight} px
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400 font-medium">
              {cellDims.cellWidthCm} × {cellDims.cellHeightCm} cm cells
            </span>
          </div>
        )}
      </div>

      {/* Main Toolbar Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Change Image Button */}
        <button
          type="button"
          onClick={onChangeImageRequest}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition active:scale-[0.98]"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Change Image</span>
          <span className="sm:hidden">Photo</span>
        </button>

        {/* Undo / Redo Stack Controls */}
        <div className="flex items-center gap-0.5 bg-zinc-800/80 p-0.5 rounded-xl border border-zinc-700/60">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo change"
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/70 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo change"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/70 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Crop Tool Toggle */}
        <button
          type="button"
          onClick={onToggleCropMode}
          aria-label={isCropMode ? 'Done Cropping' : 'Crop Area of Interest'}
          title="Crop Area of Interest (X)"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition active:scale-[0.98] ${
            isCropMode
              ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-xs'
              : hasCrop
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-zinc-800/80 text-zinc-300 hover:text-white border-zinc-700/60 hover:bg-zinc-700'
          }`}
        >
          <Crop className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isCropMode ? 'Done Crop' : hasCrop ? 'Cropped' : 'Crop'}
          </span>
          <span className="md:hidden">Crop</span>
        </button>

        {/* Black & White Quick Toggle */}
        <button
          type="button"
          onClick={onToggleGrayscale}
          aria-label={filterConfig.isGrayscale ? 'Disable B&W mode' : 'Enable B&W mode'}
          title="Toggle Black & White / Values (M)"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition active:scale-[0.98] ${
            filterConfig.isGrayscale
              ? 'bg-zinc-100 text-zinc-950 border-white font-semibold shadow-xs'
              : 'bg-zinc-800/80 text-zinc-300 hover:text-white border-zinc-700/60 hover:bg-zinc-700'
          }`}
        >
          <Contrast className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {filterConfig.isGrayscale ? 'Color Mode' : 'B&W Mode'}
          </span>
          <span className="md:hidden">B&W</span>
        </button>

        {/* Grid Visibility Toggle */}
        <button
          type="button"
          onClick={onToggleGridVisible}
          aria-label={isGridVisible ? 'Hide Grid' : 'Show Grid'}
          title="Toggle Grid (G)"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium border transition ${
            isGridVisible
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isGridVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isGridVisible ? 'Grid On' : 'Grid Off'}</span>
          </span>
        </button>

        {/* Shortcuts Help */}
        <button
          type="button"
          onClick={onOpenShortcutsModal}
          aria-label="Keyboard Shortcuts"
          title="Keyboard Shortcuts"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Settings Panel"
          title="Grid & Scale Settings (S)"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium border transition ${
            isSidebarOpen
              ? 'bg-zinc-800 text-amber-400 border-zinc-700'
              : 'bg-zinc-800/60 text-zinc-300 hover:text-white border-zinc-700/60'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </span>
        </button>

        {/* Prominent Export Button */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-[0.98] transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
