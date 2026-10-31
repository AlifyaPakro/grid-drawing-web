import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { SettingsSidebar } from './components/SettingsSidebar';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AppStateSnapshot, FilterConfig, GridConfig, PhysicalConfig } from './types';
import { useHistoryState } from './hooks/useHistoryState';
import {
  calculateGridCellDimensions,
  calculatePhysicalDimensions,
  calculateSquareGridRows,
} from './utils/gridCalculations';
import { SAMPLE_IMAGES } from './utils/sampleImages';

const INITIAL_STATE_SNAPSHOT: AppStateSnapshot = {
  gridConfig: {
    columns: 8,
    rows: 10,
    mode: 'square',
    color: '#ffffff',
    opacity: 0.85,
    lineWidth: 1.5,
    lineStyle: 'solid',
    showDiagonals: false,
    showSubdivisions: false,
    subdivisionCount: 2,
    showCenterLines: false,
    showRuleOfThirds: false,
    showCoordinates: true,
    coordinateFontSize: 14,
    coordinateColor: '#fcd34d', // warm amber for high visibility
    coordinateBackground: true,
  },
  physicalConfig: {
    preset: 'a4',
    targetWidthCm: 21.0,
    targetHeightCm: 29.7,
    lockAspectToImage: true,
    unit: 'cm',
    dpi: 96,
  },
  filterConfig: {
    isGrayscale: false,
    brightness: 0,
    contrast: 0,
    posterizeLevels: 0,
    invert: false,
  },
  cropRect: null,
};

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [isCropMode, setIsCropMode] = useState<boolean>(false);

  // Stack-based state history tracker for undo and redo
  const {
    gridConfig,
    physicalConfig,
    filterConfig,
    cropRect,
    updateGridConfig,
    updatePhysicalConfig,
    updateFilterConfig,
    updateCropRect,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToState,
  } = useHistoryState(INITIAL_STATE_SNAPSHOT);

  // When image loads
  const handleSelectImage = useCallback(
    (newImg: HTMLImageElement, name?: string) => {
      setImage(newImg);
      setImageName(name || 'Reference Image');
      setIsUploadModalOpen(false);
      setIsCropMode(false);
      updateCropRect(null);

      // If square mode is on, adjust rows to match native aspect ratio
      if (gridConfig.mode === 'square') {
        const derivedRows = calculateSquareGridRows(
          newImg.naturalWidth,
          newImg.naturalHeight,
          gridConfig.columns
        );
        updateGridConfig({ rows: derivedRows });
      }
    },
    [gridConfig.columns, gridConfig.mode, updateGridConfig, updateCropRect]
  );

  // Support ?autostart=1 query param to load sample immediately
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !image) {
      const sample = SAMPLE_IMAGES[0];
      const img = new Image();
      img.onload = () => {
        handleSelectImage(img, sample.title);
      };
      img.src = sample.dataUrl;
    }
  }, [image, handleSelectImage]);

  // Real-time Calculations based on effective cropped or full dimensions
  const effectiveWidth = cropRect ? cropRect.width : (image?.naturalWidth || 1000);
  const effectiveHeight = cropRect ? cropRect.height : (image?.naturalHeight || 1000);

  const physicalDims = useMemo(() => {
    return calculatePhysicalDimensions(effectiveWidth, effectiveHeight, physicalConfig);
  }, [effectiveWidth, effectiveHeight, physicalConfig]);

  const cellDims = useMemo(() => {
    return calculateGridCellDimensions(
      effectiveWidth,
      effectiveHeight,
      gridConfig.columns,
      gridConfig.rows,
      physicalDims.widthCm,
      physicalDims.heightCm
    );
  }, [effectiveWidth, effectiveHeight, gridConfig.columns, gridConfig.rows, physicalDims]);

  // Global Keyboard Shortcuts (including Undo & Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Export: Ctrl+E / Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (image) setIsExportModalOpen(true);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'g':
          e.preventDefault();
          setIsGridVisible((prev) => !prev);
          break;
        case 'm':
          e.preventDefault();
          updateFilterConfig({ isGrayscale: !filterConfig.isGrayscale });
          break;
        case 'd':
          e.preventDefault();
          updateGridConfig({ showDiagonals: !gridConfig.showDiagonals });
          break;
        case 'c':
          e.preventDefault();
          updateGridConfig({ showCoordinates: !gridConfig.showCoordinates });
          break;
        case 'x':
          e.preventDefault();
          setIsCropMode((prev) => !prev);
          break;
        case 's':
          e.preventDefault();
          setIsSidebarOpen((prev) => !prev);
          break;
        case 'u':
          e.preventDefault();
          setIsUploadModalOpen(true);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    image,
    undo,
    redo,
    filterConfig.isGrayscale,
    gridConfig.showDiagonals,
    gridConfig.showCoordinates,
    updateFilterConfig,
    updateGridConfig,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Header Bar with Stack Undo/Redo & Crop */}
      <HeaderBar
        imageName={imageName}
        imageNaturalWidth={effectiveWidth}
        imageNaturalHeight={effectiveHeight}
        cellDims={cellDims}
        isGridVisible={isGridVisible}
        onToggleGridVisible={() => setIsGridVisible((prev) => !prev)}
        filterConfig={filterConfig}
        onToggleGrayscale={() =>
          updateFilterConfig({ isGrayscale: !filterConfig.isGrayscale })
        }
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onChangeImageRequest={() => setIsUploadModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isCropMode={isCropMode}
        onToggleCropMode={() => setIsCropMode((prev) => !prev)}
        hasCrop={!!cropRect}
      />

      {/* Main Interactive Workspace Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <main
          className={`flex-1 h-full transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:mr-96' : 'mr-0'
          }`}
        >
          {image ? (
            <CanvasWorkspace
              image={image}
              gridConfig={gridConfig}
              physicalConfig={physicalConfig}
              filterConfig={filterConfig}
              isGridVisible={isGridVisible}
              cellDims={cellDims}
              onToggleGridVisible={() => setIsGridVisible((prev) => !prev)}
              onChangeImageRequest={() => setIsUploadModalOpen(true)}
              cropRect={cropRect}
              onUpdateCropRect={updateCropRect}
              isCropMode={isCropMode}
              onToggleCropMode={() => setIsCropMode((prev) => !prev)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
              <div className="max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Welcome to ArtisanGrid</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Select a reference picture or start with a sample artist study to begin scaling and measuring.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  Choose Reference Image
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Collapsible Settings Sidebar */}
        <SettingsSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
          gridConfig={gridConfig}
          onUpdateGridConfig={updateGridConfig}
          physicalConfig={physicalConfig}
          onUpdatePhysicalConfig={updatePhysicalConfig}
          filterConfig={filterConfig}
          onUpdateFilterConfig={updateFilterConfig}
          cellDims={cellDims}
          imageNaturalWidth={effectiveWidth}
          imageNaturalHeight={effectiveHeight}
        />
      </div>

      {/* Prominent Upload / Change Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={image ? () => setIsUploadModalOpen(false) : undefined}
        hasActiveImage={!!image}
        onSelectImage={handleSelectImage}
      />

      {/* Full-Resolution Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        image={image}
        gridConfig={gridConfig}
        physicalConfig={physicalConfig}
        filterConfig={filterConfig}
        cellDims={cellDims}
        cropRect={cropRect}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
