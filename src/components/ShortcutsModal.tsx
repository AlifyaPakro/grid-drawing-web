import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Z', action: 'Undo Configuration Change' },
    { key: 'Ctrl + Y / ⇧⌘Z', action: 'Redo Configuration Change' },
    { key: 'G', action: 'Toggle Grid Lines On / Off' },
    { key: 'M', action: 'Toggle Black & White / Grayscale' },
    { key: 'D', action: 'Toggle Renaissance Diagonals (X-Boxes)' },
    { key: 'C', action: 'Toggle Border Coordinates (1..N, A..Z)' },
    { key: '0', action: 'Fit to Viewport' },
    { key: '1', action: 'Reset to 100% Actual Scale' },
    { key: '+ / -', action: 'Zoom In / Zoom Out' },
    { key: 'Space + Drag', action: 'Pan Canvas' },
    { key: 'Ctrl + V', action: 'Paste Image from Clipboard' },
    { key: 'Ctrl + E', action: 'Open Export / Download Dialog' },
    { key: 'X', action: 'Toggle Interactive Cropping Area' },
    { key: 'U', action: 'Upload / Change Image' },
    { key: 'S', action: 'Toggle Grid Settings Sidebar' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h2 id="shortcuts-dialog-title" className="text-base font-semibold tracking-tight text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 divide-y divide-zinc-800/80 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 text-xs">
              <span className="text-zinc-300">{item.action}</span>
              <kbd className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-amber-300 shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/40 text-center text-xs text-zinc-400">
          Press any key or click outside to dismiss
        </div>
      </div>
    </div>
  );
};
