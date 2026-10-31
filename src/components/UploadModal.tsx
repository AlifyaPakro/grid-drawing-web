import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, Link, AlertCircle } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';

interface UploadModalProps {
  isOpen: boolean;
  onClose?: () => void;
  hasActiveImage: boolean;
  onSelectImage: (img: HTMLImageElement, name?: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  hasActiveImage,
  onSelectImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste support
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPEG, WEBP, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        const img = new Image();
        img.onload = () => {
          onSelectImage(img, file.name);
        };
        img.onerror = () => {
          setErrorMessage('Could not load image. File may be corrupted.');
        };
        img.src = src;
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleImage) => {
    setErrorMessage(null);
    const img = new Image();
    img.onload = () => {
      onSelectImage(img, sample.title);
    };
    img.onerror = () => {
      setErrorMessage('Failed to load sample image.');
    };
    img.src = sample.dataUrl;
  };

  const handleLoadUrl = () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);
    setErrorMessage(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setIsLoadingUrl(false);
      onSelectImage(img, 'Web Image');
    };
    img.onerror = () => {
      setIsLoadingUrl(false);
      setErrorMessage('Could not load image from URL (cross-origin restrictions or invalid link).');
    };
    img.src = urlInput.trim();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upload-dialog-title" className="text-base sm:text-lg font-semibold tracking-tight text-white">
                {hasActiveImage ? 'Change Reference Image' : 'Select or Upload Reference Image'}
              </h2>
              <p className="text-xs text-zinc-400">
                Overlay customizable grid for precision proportion scaling & drawing transfer
              </p>
            </div>
          </div>
          {hasActiveImage && onClose && (
            <button
              onClick={onClose}
              aria-label="Close upload modal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Target */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition flex flex-col items-center justify-center ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-zinc-700/80 bg-zinc-950/40 hover:border-zinc-500 hover:bg-zinc-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center mb-3 text-amber-400 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Drop your image here, or{' '}
              <span className="text-amber-400 underline underline-offset-2">browse files</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Supports PNG, JPEG, WEBP, or SVG. You can also paste directly anywhere (<kbd className="px-1 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">Ctrl+V</kbd>).
            </p>
          </div>

          {/* Quick Sample Reference Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Or start with an artist study:</span>
              </div>
              <span className="text-[11px] text-zinc-400">Instant offline loading</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="group text-left rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500/80 hover:bg-zinc-850 p-2.5 transition active:scale-[0.98] flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-900 mb-2 border border-zinc-800/80 group-hover:border-amber-500/40">
                    <img
                      src={sample.dataUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300 line-clamp-1">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">
                    {sample.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Load from image URL */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Or paste an Image Web URL:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleLoadUrl}
                disabled={isLoadingUrl || !urlInput.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 transition shrink-0"
              >
                {isLoadingUrl ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Private & Secure • Runs 100% locally in your browser</span>
          {hasActiveImage && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-300 hover:text-white"
            >
              Cancel & Keep Current Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
