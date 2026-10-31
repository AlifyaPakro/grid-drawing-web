import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Eye,
  EyeOff,
  Move,
  Crop,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { CropRect, FilterConfig, GridCellDimensions, GridConfig, PhysicalConfig } from '../types';
import {
  ASPECT_RATIO_PRESETS,
  CropHandle,
  clampCropRect,
  getDefaultCropRect,
  resizeCropRect,
} from '../utils/cropCalculations';

interface CanvasWorkspaceProps {
  image: HTMLImageElement | null;
  gridConfig: GridConfig;
  physicalConfig: PhysicalConfig;
  filterConfig: FilterConfig;
  isGridVisible: boolean;
  cellDims: GridCellDimensions;
  onToggleGridVisible: () => void;
  onChangeImageRequest: () => void;
  cropRect: CropRect | null;
  onUpdateCropRect: (crop: CropRect | null, isContinuous?: boolean) => void;
  isCropMode: boolean;
  onToggleCropMode: () => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  image,
  gridConfig,
  physicalConfig,
  filterConfig,
  isGridVisible,
  cellDims,
  onToggleGridVisible,
  onChangeImageRequest,
  cropRect,
  onUpdateCropRect,
  isCropMode,
  onToggleCropMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Transform states: zoom scale and pan offset (in container CSS pixels)
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cropping interaction states
  const [activeHandle, setActiveHandle] = useState<CropHandle | null>(null);
  const [hoverHandle, setHoverHandle] = useState<CropHandle | null>(null);
  const [activeAspectPreset, setActiveAspectPreset] = useState<string>('free');
  const cropDragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startCrop: CropRect;
  } | null>(null);

  // Hover coordinate readout
  const [hoverInfo, setHoverInfo] = useState<{
    xPx: number;
    yPx: number;
    xCm: number;
    yCm: number;
    cellCol: number;
    cellRow: number;
    cellColLabel: string;
    cellRowLabel: string;
  } | null>(null);

  const hasUserPannedRef = useRef<boolean>(false);

  // When crop mode is opened for the first time on an image without cropRect, initialize it
  useEffect(() => {
    if (isCropMode && !cropRect && image) {
      const initialCrop = getDefaultCropRect(image.naturalWidth, image.naturalHeight, null);
      onUpdateCropRect(initialCrop, false);
    }
  }, [isCropMode, cropRect, image, onUpdateCropRect]);

  // Handle aspect ratio preset selection in crop mode
  const handleSelectAspectPreset = (presetId: string) => {
    setActiveAspectPreset(presetId);
    if (!image) return;
    const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === presetId);
    const ratio = preset?.ratio ?? null;
    const baseW = cropRect ? cropRect.width : image.naturalWidth * 0.8;
    const baseH = cropRect ? cropRect.height : image.naturalHeight * 0.8;
    const newCrop = getDefaultCropRect(image.naturalWidth, image.naturalHeight, ratio);
    onUpdateCropRect(newCrop, false);
  };

  // Main Canvas Render
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Retina / High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, width, height);

    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;

    // Drop shadow under image
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 35 / scale;
    ctx.shadowOffsetY = 12 / scale;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, imgW, imgH);
    ctx.restore();

    // Render Image with Filters
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    let filterStr = '';
    if (filterConfig.isGrayscale) filterStr += 'grayscale(100%) ';
    if (filterConfig.brightness !== 0) {
      filterStr += `brightness(${100 + filterConfig.brightness}%) `;
    }
    if (filterConfig.contrast !== 0) {
      filterStr += `contrast(${100 + filterConfig.contrast}%) `;
    }
    if (filterConfig.invert) filterStr += 'invert(100%) ';

    if (filterStr.trim()) {
      ctx.filter = filterStr.trim();
    }

    ctx.drawImage(image, 0, 0, imgW, imgH);
    ctx.restore();

    // Effective grid bounds (either cropped area or full image)
    const effectiveCrop = cropRect;
    const startX = effectiveCrop ? effectiveCrop.x : 0;
    const startY = effectiveCrop ? effectiveCrop.y : 0;
    const gridW = effectiveCrop ? effectiveCrop.width : imgW;
    const gridH = effectiveCrop ? effectiveCrop.height : imgH;

    // Dimming Mask outside crop area
    if (effectiveCrop) {
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(scale, scale);

      ctx.fillStyle = isCropMode ? 'rgba(0, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.45)';

      // 1. Top band
      if (startY > 0) {
        ctx.fillRect(0, 0, imgW, startY);
      }
      // 2. Bottom band
      if (startY + gridH < imgH) {
        ctx.fillRect(0, startY + gridH, imgW, imgH - (startY + gridH));
      }
      // 3. Left band
      if (startX > 0) {
        ctx.fillRect(0, startY, startX, gridH);
      }
      // 4. Right band
      if (startX + gridW < imgW) {
        ctx.fillRect(startX + gridW, startY, imgW - (startX + gridW), gridH);
      }

      // Border outline around active crop region
      ctx.strokeStyle = isCropMode ? '#f59e0b' : 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = Math.max(1, (isCropMode ? 2.5 : 1.5) / scale);
      ctx.setLineDash(isCropMode ? [6 / scale, 4 / scale] : []);
      ctx.strokeRect(startX, startY, gridW, gridH);

      // Rule of thirds composition guides inside crop mode
      if (isCropMode) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = Math.max(0.75, 1 / scale);
        ctx.setLineDash([4 / scale, 4 / scale]);
        [1 / 3, 2 / 3].forEach((ratio) => {
          ctx.beginPath();
          ctx.moveTo(startX + gridW * ratio, startY);
          ctx.lineTo(startX + gridW * ratio, startY + gridH);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(startX, startY + gridH * ratio);
          ctx.lineTo(startX + gridW, startY + gridH * ratio);
          ctx.stroke();
        });
        ctx.restore();
      }

      ctx.restore();
    }

    // Render Grid & Overlays (Only if NOT in crop mode, or in background)
    if (isGridVisible && !isCropMode) {
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(scale, scale);

      const cellW = gridW / gridConfig.columns;
      const cellH = gridH / gridConfig.rows;
      const lineWidth = Math.max(0.75, gridConfig.lineWidth / scale);

      ctx.save();
      ctx.globalAlpha = gridConfig.opacity;
      ctx.strokeStyle = gridConfig.color;
      ctx.lineWidth = lineWidth;

      if (gridConfig.lineStyle === 'dashed') {
        ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
      } else if (gridConfig.lineStyle === 'dotted') {
        ctx.setLineDash([lineWidth, lineWidth * 2]);
      } else {
        ctx.setLineDash([]);
      }

      // 1. Subdivisions inside cells
      if (gridConfig.showSubdivisions) {
        ctx.save();
        ctx.globalAlpha = gridConfig.opacity * 0.45;
        ctx.lineWidth = Math.max(0.5, lineWidth * 0.6);
        ctx.setLineDash([lineWidth * 2, lineWidth * 2]);
        const subs = gridConfig.subdivisionCount;
        for (let c = 0; c < gridConfig.columns; c++) {
          for (let s = 1; s < subs; s++) {
            const x = startX + c * cellW + (s * cellW) / subs;
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + gridH);
            ctx.stroke();
          }
        }
        for (let r = 0; r < gridConfig.rows; r++) {
          for (let s = 1; s < subs; s++) {
            const y = startY + r * cellH + (s * cellH) / subs;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + gridW, y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 2. Cell Diagonals (X in each cell)
      if (gridConfig.showDiagonals) {
        ctx.save();
        ctx.globalAlpha = gridConfig.opacity * 0.5;
        ctx.lineWidth = Math.max(0.5, lineWidth * 0.7);
        for (let c = 0; c < gridConfig.columns; c++) {
          for (let r = 0; r < gridConfig.rows; r++) {
            const x1 = startX + c * cellW;
            const y1 = startY + r * cellH;
            const x2 = x1 + cellW;
            const y2 = y1 + cellH;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.moveTo(x2, y1);
            ctx.lineTo(x1, y2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 3. Rule of Thirds
      if (gridConfig.showRuleOfThirds) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, gridConfig.opacity * 1.2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = lineWidth * 1.5;
        ctx.setLineDash([lineWidth * 5, lineWidth * 3]);
        [1 / 3, 2 / 3].forEach((ratio) => {
          ctx.beginPath();
          ctx.moveTo(startX + gridW * ratio, startY);
          ctx.lineTo(startX + gridW * ratio, startY + gridH);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(startX, startY + gridH * ratio);
          ctx.lineTo(startX + gridW, startY + gridH * ratio);
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. Main Grid Lines
      for (let c = 0; c <= gridConfig.columns; c++) {
        const x = startX + c * cellW;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + gridH);
        ctx.stroke();
      }
      for (let r = 0; r <= gridConfig.rows; r++) {
        const y = startY + r * cellH;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + gridW, y);
        ctx.stroke();
      }

      // 5. Center Axes Crosshairs
      if (gridConfig.showCenterLines) {
        ctx.save();
        ctx.strokeStyle = gridConfig.color;
        ctx.lineWidth = lineWidth * 2.2;
        ctx.globalAlpha = Math.min(1, gridConfig.opacity * 1.4);
        ctx.setLineDash([lineWidth * 6, lineWidth * 3]);

        ctx.beginPath();
        ctx.moveTo(startX + gridW / 2, startY);
        ctx.lineTo(startX + gridW / 2, startY + gridH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY + gridH / 2);
        ctx.lineTo(startX + gridW, startY + gridH / 2);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Coordinate Labels along edges of the crop region
      if (gridConfig.showCoordinates) {
        ctx.save();
        const baseFontSize = gridConfig.coordinateFontSize;
        const fontSize = Math.max(10, Math.round(baseFontSize / scale));
        ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Top columns (1, 2, 3...)
        for (let c = 0; c < gridConfig.columns; c++) {
          const text = String(c + 1);
          const x = startX + c * cellW + cellW / 2;
          const y = startY + fontSize * 1.1;

          if (gridConfig.coordinateBackground) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            const textW = ctx.measureText(text).width + fontSize * 0.8;
            ctx.fillRect(x - textW / 2, y - fontSize * 0.7, textW, fontSize * 1.4);
          }
          ctx.fillStyle = gridConfig.coordinateColor || '#ffffff';
          ctx.fillText(text, x, y);
        }

        // Left rows (A, B, C...)
        for (let r = 0; r < gridConfig.rows; r++) {
          let label = '';
          let n = r;
          while (n >= 0) {
            label = String.fromCharCode((n % 26) + 65) + label;
            n = Math.floor(n / 26) - 1;
          }
          const x = startX + fontSize * 1.1;
          const y = startY + r * cellH + cellH / 2;

          if (gridConfig.coordinateBackground) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            const textW = ctx.measureText(label).width + fontSize * 0.8;
            ctx.fillRect(x - textW / 2, y - fontSize * 0.7, textW, fontSize * 1.4);
          }
          ctx.fillStyle = gridConfig.coordinateColor || '#ffffff';
          ctx.fillText(label, x, y);
        }
        ctx.restore();
      }

      ctx.restore();
      ctx.restore();
    }

    // Draw 8 Interactive Crop Handles when in crop mode
    if (isCropMode && effectiveCrop) {
      ctx.save();
      const rx = pan.x + effectiveCrop.x * scale;
      const ry = pan.y + effectiveCrop.y * scale;
      const rw = effectiveCrop.width * scale;
      const rh = effectiveCrop.height * scale;

      const handleSize = 12; // handle size in screen pixels

      // Corner handles: NW, NE, SE, SW
      const drawCornerHandle = (hx: number, hy: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
      };

      // Edge handles: N, S, E, W
      const drawEdgeHandle = (hx: number, hy: number, isVertical: boolean) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.5;
        const w = isVertical ? 6 : 18;
        const h = isVertical ? 18 : 6;
        ctx.fillRect(hx - w / 2, hy - h / 2, w, h);
        ctx.strokeRect(hx - w / 2, hy - h / 2, w, h);
      };

      // Draw all 8 handles
      drawCornerHandle(rx, ry); // NW
      drawCornerHandle(rx + rw, ry); // NE
      drawCornerHandle(rx + rw, ry + rh); // SE
      drawCornerHandle(rx, ry + rh); // SW

      drawEdgeHandle(rx + rw / 2, ry, false); // N
      drawEdgeHandle(rx + rw / 2, ry + rh, false); // S
      drawEdgeHandle(rx, ry + rh / 2, true); // W
      drawEdgeHandle(rx + rw, ry + rh / 2, true); // E

      ctx.restore();
    }

    ctx.restore();
  }, [
    image,
    scale,
    pan,
    gridConfig,
    physicalConfig,
    filterConfig,
    isGridVisible,
    cropRect,
    isCropMode,
  ]);

  // Fit image to current container
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !image) return;
    const container = containerRef.current;
    const padding = 40;
    const availWidth = Math.max(100, container.clientWidth - padding);
    const availHeight = Math.max(100, container.clientHeight - padding);

    const scaleX = availWidth / image.naturalWidth;
    const scaleY = availHeight / image.naturalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.0);

    setScale(fitScale);
    setPan({
      x: (container.clientWidth - image.naturalWidth * fitScale) / 2,
      y: (container.clientHeight - image.naturalHeight * fitScale) / 2,
    });
  }, [image]);

  // Initial fit when image changes
  useEffect(() => {
    if (image) {
      hasUserPannedRef.current = false;
      const t = setTimeout(() => {
        fitToScreen();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [image, fitToScreen]);

  // Handle window / container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      renderCanvas();
      if (!hasUserPannedRef.current && image) {
        fitToScreen();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [image, fitToScreen, renderCanvas]);

  // Request redraw on dependencies change
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvas();
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // Hit-testing for handles in crop mode
  const getHandleAtPoint = useCallback(
    (mouseX: number, mouseY: number): CropHandle | null => {
      if (!cropRect || !image) return null;
      const rx = pan.x + cropRect.x * scale;
      const ry = pan.y + cropRect.y * scale;
      const rw = cropRect.width * scale;
      const rh = cropRect.height * scale;

      const hitDist = 14; // pixels tolerance

      // Corners
      if (Math.hypot(mouseX - rx, mouseY - ry) <= hitDist) return 'nw';
      if (Math.hypot(mouseX - (rx + rw), mouseY - ry) <= hitDist) return 'ne';
      if (Math.hypot(mouseX - (rx + rw), mouseY - (ry + rh)) <= hitDist) return 'se';
      if (Math.hypot(mouseX - rx, mouseY - (ry + rh)) <= hitDist) return 'sw';

      // Edges
      if (Math.hypot(mouseX - (rx + rw / 2), mouseY - ry) <= hitDist) return 'n';
      if (Math.hypot(mouseX - (rx + rw / 2), mouseY - (ry + rh)) <= hitDist) return 's';
      if (Math.hypot(mouseX - rx, mouseY - (ry + rh / 2)) <= hitDist) return 'w';
      if (Math.hypot(mouseX - (rx + rw), mouseY - (ry + rh / 2)) <= hitDist) return 'e';

      // Move inside crop box
      if (mouseX >= rx && mouseX <= rx + rw && mouseY >= ry && mouseY <= ry + rh) {
        return 'move';
      }

      return null;
    },
    [cropRect, image, pan.x, pan.y, scale]
  );

  // Zoom handlers
  const handleZoom = (factor: number, clientX?: number, clientY?: number) => {
    const container = containerRef.current;
    if (!container || !image) return;

    const rect = container.getBoundingClientRect();
    const pivotX = clientX !== undefined ? clientX - rect.left : container.clientWidth / 2;
    const pivotY = clientY !== undefined ? clientY - rect.top : container.clientHeight / 2;

    const newScale = Math.min(Math.max(0.1, scale * factor), 15);

    const newPanX = pivotX - (pivotX - pan.x) * (newScale / scale);
    const newPanY = pivotY - (pivotY - pan.y) * (newScale / scale);

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    handleZoom(zoomFactor, e.clientX, e.clientY);
  };

  // Mouse pan & crop handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isCropMode) {
      const handle = getHandleAtPoint(mouseX, mouseY);
      if (handle && cropRect) {
        setActiveHandle(handle);
        cropDragStartRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          startCrop: { ...cropRect },
        };
        return;
      }
    }

    // Default pan behavior
    hasUserPannedRef.current = true;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !image) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Crop drag interaction
    if (isCropMode && activeHandle && cropDragStartRef.current) {
      const deltaX = (e.clientX - cropDragStartRef.current.clientX) / scale;
      const deltaY = (e.clientY - cropDragStartRef.current.clientY) / scale;

      const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === activeAspectPreset);
      const ratio = preset?.ratio ?? null;

      const updated = resizeCropRect(
        cropDragStartRef.current.startCrop,
        activeHandle,
        deltaX,
        deltaY,
        image.naturalWidth,
        image.naturalHeight,
        ratio
      );
      onUpdateCropRect(updated, true);
      return;
    }

    // Hover handle in crop mode
    if (isCropMode) {
      const handle = getHandleAtPoint(mouseX, mouseY);
      setHoverHandle(handle);
    }

    // Viewport panning
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Calculate image coordinate readout relative to effective crop
    const imgX = (mouseX - pan.x) / scale;
    const imgY = (mouseY - pan.y) / scale;

    const effectiveCrop = cropRect;
    const startX = effectiveCrop ? effectiveCrop.x : 0;
    const startY = effectiveCrop ? effectiveCrop.y : 0;
    const gridW = effectiveCrop ? effectiveCrop.width : image.naturalWidth;
    const gridH = effectiveCrop ? effectiveCrop.height : image.naturalHeight;

    if (
      imgX >= startX &&
      imgX <= startX + gridW &&
      imgY >= startY &&
      imgY <= startY + gridH
    ) {
      const col = Math.min(
        gridConfig.columns - 1,
        Math.floor(((imgX - startX) / gridW) * gridConfig.columns)
      );
      const row = Math.min(
        gridConfig.rows - 1,
        Math.floor(((imgY - startY) / gridH) * gridConfig.rows)
      );

      let rowLabel = '';
      let n = row;
      while (n >= 0) {
        rowLabel = String.fromCharCode((n % 26) + 65) + rowLabel;
        n = Math.floor(n / 26) - 1;
      }

      const xRatio = (imgX - startX) / gridW;
      const yRatio = (imgY - startY) / gridH;
      const xCm = Number((xRatio * physicalConfig.targetWidthCm).toFixed(2));
      const yCm = Number((yRatio * physicalConfig.targetHeightCm).toFixed(2));

      setHoverInfo({
        xPx: Math.round(imgX),
        yPx: Math.round(imgY),
        xCm,
        yCm,
        cellCol: col + 1,
        cellRow: row + 1,
        cellColLabel: String(col + 1),
        cellRowLabel: rowLabel,
      });
    } else {
      setHoverInfo(null);
    }
  };

  const handleMouseUp = () => {
    if (activeHandle) {
      setActiveHandle(null);
      cropDragStartRef.current = null;
      if (cropRect) {
        onUpdateCropRect(cropRect, false); // push final state to history
      }
      return;
    }
    setIsDragging(false);
  };

  // Dynamic cursor computation
  const getCursorClass = () => {
    if (isCropMode) {
      const handle = activeHandle || hoverHandle;
      if (handle === 'move') return 'cursor-move';
      if (handle === 'nw' || handle === 'se') return 'cursor-nwse-resize';
      if (handle === 'ne' || handle === 'sw') return 'cursor-nesw-resize';
      if (handle === 'n' || handle === 's') return 'cursor-ns-resize';
      if (handle === 'w' || handle === 'e') return 'cursor-ew-resize';
      return 'cursor-crosshair';
    }
    return isDragging ? 'cursor-grabbing' : 'cursor-grab';
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setActiveHandle(null);
        setHoverInfo(null);
      }}
      className={`relative w-full h-full overflow-hidden select-none bg-zinc-950 ${getCursorClass()}`}
    >
      {/* HTML5 Interactive High-DPI Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="artisan-grid-canvas"
        className="w-full h-full block"
      />

      {/* Floating Crop Mode Header Toolbar */}
      {isCropMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-amber-500/40 shadow-2xl text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-amber-400 font-semibold border-r border-zinc-800">
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Define Grid Region</span>
          </div>

          {/* Aspect Presets */}
          <div className="flex items-center gap-1">
            {ASPECT_RATIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectAspectPreset(preset.id)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                  activeAspectPreset === preset.id
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-zinc-800 mx-0.5" />

          {/* Size readout */}
          {cropRect && (
            <div className="px-2 font-mono text-[11px] text-zinc-400 hidden lg:inline-block">
              {cropRect.width} × {cropRect.height} px
            </div>
          )}

          {/* Apply Crop */}
          <button
            type="button"
            onClick={onToggleCropMode}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-md transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Grid</span>
          </button>

          {/* Reset Crop to full */}
          <button
            type="button"
            onClick={() => {
              onUpdateCropRect(null, false);
              onToggleCropMode();
            }}
            title="Reset to full image"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Viewport HUD Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl text-zinc-300">
        <button
          type="button"
          onClick={() => handleZoom(1.2)}
          aria-label="Zoom In"
          title="Zoom In (+)"
          className="p-2 rounded-xl hover:bg-zinc-800 hover:text-white transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.8)}
          aria-label="Zoom Out"
          title="Zoom Out (-)"
          className="p-2 rounded-xl hover:bg-zinc-800 hover:text-white transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-0.5" />

        <button
          type="button"
          onClick={fitToScreen}
          aria-label="Fit to Viewport"
          title="Fit to Screen (0)"
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-zinc-800 hover:text-white transition flex items-center gap-1"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Fit</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setScale(1);
            if (containerRef.current && image) {
              setPan({
                x: (containerRef.current.clientWidth - image.naturalWidth) / 2,
                y: (containerRef.current.clientHeight - image.naturalHeight) / 2,
              });
            }
          }}
          aria-label="100% Actual Scale"
          title="100% Scale (1)"
          className="px-2 py-1.5 rounded-xl text-xs font-mono hover:bg-zinc-800 hover:text-white transition"
        >
          {Math.round(scale * 100)}%
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-0.5" />

        {/* Quick Crop toggle in HUD */}
        <button
          type="button"
          onClick={onToggleCropMode}
          aria-label="Toggle Interactive Crop"
          title={isCropMode ? 'Done Cropping' : 'Crop Area of Interest'}
          className={`p-2 rounded-xl transition ${
            isCropMode
              ? 'text-zinc-950 bg-amber-400'
              : cropRect
              ? 'text-amber-400 bg-amber-500/20'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Crop className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleGridVisible}
          aria-label={isGridVisible ? 'Hide Grid Overlay' : 'Show Grid Overlay'}
          title={isGridVisible ? 'Hide Grid (G)' : 'Show Grid (G)'}
          className={`p-2 rounded-xl transition ${
            isGridVisible ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:bg-zinc-800'
          }`}
        >
          {isGridVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Coordinate & Cell Inspector at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800/90 text-xs shadow-xl text-zinc-300 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-zinc-200">
              {hoverInfo ? (
                <>
                  Cell{' '}
                  <span className="text-amber-400 font-mono">
                    {hoverInfo.cellRowLabel}
                    {hoverInfo.cellColLabel}
                  </span>
                </>
              ) : (
                'Hover image to inspect cell'
              )}
            </span>
          </div>

          {hoverInfo && (
            <>
              <div className="w-px h-3.5 bg-zinc-800" />
              <div className="font-mono text-zinc-400 text-[11px]">
                {hoverInfo.xCm} × {hoverInfo.yCm} cm
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                ({hoverInfo.xPx}, {hoverInfo.yPx} px)
              </div>
            </>
          )}
        </div>

        {/* Cropped Region Status Chip */}
        {cropRect && !isCropMode && (
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs shadow-md">
            <span className="text-amber-300 font-medium">
              Cropped Region ({cropRect.width} × {cropRect.height} px)
            </span>
            <button
              type="button"
              onClick={onToggleCropMode}
              className="text-[11px] underline text-amber-400 hover:text-white"
            >
              Adjust
            </button>
            <button
              type="button"
              onClick={() => onUpdateCropRect(null, false)}
              title="Clear crop"
              className="p-0.5 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Total dimensions badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-[11px] text-zinc-400">
          <span>Grid: {gridConfig.columns} × {gridConfig.rows}</span>
          <span>•</span>
          <span className="text-amber-400/90 font-medium">Cell: {cellDims.cellWidthCm} × {cellDims.cellHeightCm} cm</span>
        </div>
      </div>

      {/* Helper guide hint on empty pan */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden lg:flex items-center gap-2 text-[11px] text-zinc-500 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
        <Move className="w-3 h-3" />
        <span>
          {isCropMode
            ? 'Drag handles to resize • Drag inside box to move'
            : 'Drag to pan • Wheel to zoom • Space to hold'}
        </span>
      </div>
    </div>
  );
};
