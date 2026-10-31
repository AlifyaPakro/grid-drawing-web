import React, { useState } from 'react';
import { Download, Copy, Printer, Check, X, Sparkles, FileImage, Crop } from 'lucide-react';
import { CropRect, FilterConfig, GridCellDimensions, GridConfig, PhysicalConfig } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: HTMLImageElement | null;
  gridConfig: GridConfig;
  physicalConfig: PhysicalConfig;
  filterConfig: FilterConfig;
  cellDims: GridCellDimensions;
  cropRect: CropRect | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  image,
  gridConfig,
  physicalConfig,
  filterConfig,
  cellDims,
  cropRect,
}) => {
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [includeBanner, setIncludeBanner] = useState<boolean>(true);
  const [includeCoords, setIncludeCoords] = useState<boolean>(gridConfig.showCoordinates);
  const [exportCroppedOnly, setExportCroppedOnly] = useState<boolean>(!!cropRect);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen || !image) return null;

  const baseW = (exportCroppedOnly && cropRect) ? cropRect.width : image.naturalWidth;
  const baseH = (exportCroppedOnly && cropRect) ? cropRect.height : image.naturalHeight;
  const targetWidth = Math.round(baseW * scaleFactor);
  const targetHeight = Math.round(baseH * scaleFactor);

  // Render to canvas for export
  const generateExportCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const bannerHeight = includeBanner ? Math.max(48, Math.round(targetHeight * 0.05)) : 0;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight + bannerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Filter string
    let filterString = '';
    if (filterConfig.isGrayscale) filterString += 'grayscale(100%) ';
    if (filterConfig.brightness !== 0) {
      filterString += `brightness(${100 + filterConfig.brightness}%) `;
    }
    if (filterConfig.contrast !== 0) {
      filterString += `contrast(${100 + filterConfig.contrast}%) `;
    }
    if (filterConfig.invert) filterString += 'invert(100%) ';

    ctx.save();
    if (filterString.trim()) {
      ctx.filter = filterString.trim();
    }

    if (exportCroppedOnly && cropRect) {
      ctx.drawImage(
        image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        targetWidth,
        targetHeight
      );
    } else {
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    }
    ctx.restore();

    // Tonal Posterize if active
    if (filterConfig.posterizeLevels > 0) {
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const numLevels = filterConfig.posterizeLevels;
      const step = 255 / (numLevels - 1);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(Math.round(data[i] / step) * step);
        data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
        data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Grid rendering
    const cellW = targetWidth / gridConfig.columns;
    const cellH = targetHeight / gridConfig.rows;
    const lineWidth = Math.max(1, Math.round(gridConfig.lineWidth * scaleFactor));

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

    // Draw Subdivisions if enabled
    if (gridConfig.showSubdivisions) {
      ctx.save();
      ctx.globalAlpha = gridConfig.opacity * 0.45;
      ctx.lineWidth = Math.max(1, lineWidth * 0.6);
      ctx.setLineDash([lineWidth * 2, lineWidth * 2]);
      const subs = gridConfig.subdivisionCount;
      for (let c = 0; c < gridConfig.columns; c++) {
        for (let s = 1; s < subs; s++) {
          const x = c * cellW + (s * cellW) / subs;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, targetHeight);
          ctx.stroke();
        }
      }
      for (let r = 0; r < gridConfig.rows; r++) {
        for (let s = 1; s < subs; s++) {
          const y = r * cellH + (s * cellH) / subs;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(targetWidth, y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Draw Cell Diagonals if enabled
    if (gridConfig.showDiagonals) {
      ctx.save();
      ctx.globalAlpha = gridConfig.opacity * 0.5;
      ctx.lineWidth = Math.max(1, lineWidth * 0.7);
      for (let c = 0; c < gridConfig.columns; c++) {
        for (let r = 0; r < gridConfig.rows; r++) {
          const x1 = c * cellW;
          const y1 = r * cellH;
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

    // Draw Main Grid Lines
    for (let c = 0; c <= gridConfig.columns; c++) {
      const x = Math.min(targetWidth - lineWidth / 2, Math.max(lineWidth / 2, c * cellW));
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetHeight);
      ctx.stroke();
    }
    for (let r = 0; r <= gridConfig.rows; r++) {
      const y = Math.min(targetHeight - lineWidth / 2, Math.max(lineWidth / 2, r * cellH));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetWidth, y);
      ctx.stroke();
    }

    // Center Crosshairs
    if (gridConfig.showCenterLines) {
      ctx.save();
      ctx.strokeStyle = gridConfig.color;
      ctx.lineWidth = lineWidth * 1.8;
      ctx.globalAlpha = Math.min(1, gridConfig.opacity * 1.3);
      ctx.setLineDash([lineWidth * 6, lineWidth * 3]);
      // Center vertical
      ctx.beginPath();
      ctx.moveTo(targetWidth / 2, 0);
      ctx.lineTo(targetWidth / 2, targetHeight);
      ctx.stroke();
      // Center horizontal
      ctx.beginPath();
      ctx.moveTo(0, targetHeight / 2);
      ctx.lineTo(targetWidth, targetHeight / 2);
      ctx.stroke();
      ctx.restore();
    }

    // Border coordinates if requested
    if (includeCoords) {
      ctx.save();
      const fontSize = Math.max(12, Math.round(gridConfig.coordinateFontSize * scaleFactor));
      ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Top columns (1, 2, 3...)
      for (let c = 0; c < gridConfig.columns; c++) {
        const text = String(c + 1);
        const x = c * cellW + cellW / 2;
        const y = fontSize * 1.2;

        if (gridConfig.coordinateBackground) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          const textW = ctx.measureText(text).width + 10;
          ctx.fillRect(x - textW / 2, y - fontSize * 0.75, textW, fontSize * 1.5);
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
        const x = fontSize * 1.2;
        const y = r * cellH + cellH / 2;

        if (gridConfig.coordinateBackground) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          const textW = ctx.measureText(label).width + 10;
          ctx.fillRect(x - textW / 2, y - fontSize * 0.75, textW, fontSize * 1.5);
        }
        ctx.fillStyle = gridConfig.coordinateColor || '#ffffff';
        ctx.fillText(label, x, y);
      }
      ctx.restore();
    }
    ctx.restore();

    // Measurement & Reference Banner at bottom
    if (includeBanner) {
      ctx.save();
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, targetHeight, targetWidth, bannerHeight);

      ctx.fillStyle = '#ffffff';
      const bannerFontSize = Math.max(11, Math.round(bannerHeight * 0.35));
      ctx.font = `600 ${bannerFontSize}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const leftText = `ARTISAN GRID • ${gridConfig.columns} × ${gridConfig.rows} Cells (${cellDims.totalCells} total)`;
      ctx.fillText(leftText, bannerFontSize * 1.2, targetHeight + bannerHeight / 2);

      ctx.fillStyle = '#a1a1aa';
      ctx.textAlign = 'right';
      const rightText = `Cell: ${cellDims.cellWidthCm} × ${cellDims.cellHeightCm} cm | Print: ${physicalConfig.targetWidthCm.toFixed(1)} × ${physicalConfig.targetHeightCm.toFixed(1)} cm`;
      ctx.fillText(rightText, targetWidth - bannerFontSize * 1.2, targetHeight + bannerHeight / 2);
      ctx.restore();
    }

    return canvas;
  };

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const canvas = generateExportCanvas();
        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'jpeg' ? 0.94 : undefined;
        const dataUrl = canvas.toDataURL(mime, quality);
        const link = document.createElement('a');
        link.download = `artisan-grid-${gridConfig.columns}x${gridConfig.rows}-${Date.now()}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };

  const handleCopyClipboard = async () => {
    try {
      setIsExporting(true);
      const canvas = generateExportCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback if permission blocked
          const dataUrl = canvas.toDataURL('image/png');
          const win = window.open();
          win?.document.write(`<img src="${dataUrl}" alt="Exported Grid" />`);
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const canvas = generateExportCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Reference Grid</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; font-family: system-ui, sans-serif; }
            img { max-width: 100%; max-height: 96vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-dialog-title" className="text-base font-semibold tracking-tight text-white">
                Export Reference Grid
              </h2>
              <p className="text-xs text-zinc-400">
                Full-resolution render with high-precision grid lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Summary Preview Box */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="text-zinc-400">Output Resolution:</div>
              <div className="text-sm font-semibold text-white">
                {targetWidth} × {targetHeight} px
              </div>
              <div className="text-zinc-500">
                Scale: {scaleFactor}x original ({image.naturalWidth} × {image.naturalHeight})
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-zinc-400">Cell Physical Size:</div>
              <div className="text-sm font-semibold text-amber-400">
                {cellDims.cellWidthCm} × {cellDims.cellHeightCm} cm
              </div>
              <div className="text-zinc-500">
                {cellDims.cols} cols × {cellDims.rows} rows
              </div>
            </div>
          </div>

          {/* Scale Resolution Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Export Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1, label: '1x (Original)', desc: `${image.naturalWidth}×${image.naturalHeight}` },
                { scale: 1.5, label: '1.5x (Super)', desc: `${Math.round(image.naturalWidth * 1.5)}px` },
                { scale: 2, label: '2x (Ultra/Print)', desc: `${image.naturalWidth * 2}px` },
              ].map((opt) => (
                <button
                  key={opt.scale}
                  type="button"
                  onClick={() => setScaleFactor(opt.scale)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition ${
                    scaleFactor === opt.scale
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Image Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  format === 'png'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <FileImage className="w-4 h-4 text-emerald-400" />
                <span>PNG (Lossless & Crisp)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  format === 'jpeg'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-800/50 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <FileImage className="w-4 h-4 text-sky-400" />
                <span>JPEG (Smaller file)</span>
              </button>
            </div>
          </div>

          {/* Crop Area Toggle if crop exists */}
          {cropRect && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5" />
                    <span>Export Cropped Region Only</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Slices output to exact {cropRect.width} × {cropRect.height} px cropped area
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={exportCroppedOnly}
                  onChange={(e) => setExportCroppedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
                />
              </label>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-2 pt-1 border-t border-zinc-800">
            <label className="flex items-center justify-between py-1.5 cursor-pointer">
              <span className="text-xs text-zinc-300">
                Include Measurement Footer Banner
              </span>
              <input
                type="checkbox"
                checked={includeBanner}
                onChange={(e) => setIncludeBanner(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
              />
            </label>
            <label className="flex items-center justify-between py-1.5 cursor-pointer">
              <span className="text-xs text-zinc-300">
                Include Coordinate Border Numbers (1..N, A..Z)
              </span>
              <input
                type="checkbox"
                checked={includeCoords}
                onChange={(e) => setIncludeCoords(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:scale-[0.98] transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print grid"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:scale-[0.98] transition"
          >
            <Printer className="w-4 h-4" />
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
