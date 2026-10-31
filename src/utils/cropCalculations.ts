import { CropRect } from '../types';

export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export interface AspectPreset {
  id: string;
  name: string;
  ratio: number | null; // width / height, null for freeform
}

export const ASPECT_RATIO_PRESETS: AspectPreset[] = [
  { id: 'free', name: 'Freeform', ratio: null },
  { id: '1:1', name: '1:1 Square', ratio: 1.0 },
  { id: '4:5', name: '4:5 Portrait', ratio: 4 / 5 },
  { id: '3:4', name: '3:4 Standard', ratio: 3 / 4 },
  { id: '2:3', name: '2:3 Classic', ratio: 2 / 3 },
  { id: '16:9', name: '16:9 Wide', ratio: 16 / 9 },
];

/**
 * Initializes a default centered crop rect (e.g., 80% of image dimensions)
 */
export function getDefaultCropRect(
  imgWidth: number,
  imgHeight: number,
  ratio: number | null = null
): CropRect {
  if (imgWidth <= 0 || imgHeight <= 0) return { x: 0, y: 0, width: 100, height: 100 };

  let width = imgWidth * 0.8;
  let height = imgHeight * 0.8;

  if (ratio) {
    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
  }

  const x = (imgWidth - width) / 2;
  const y = (imgHeight - height) / 2;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Clamps crop rectangle inside image bounds and enforces minimum dimensions
 */
export function clampCropRect(
  rect: CropRect,
  imgWidth: number,
  imgHeight: number,
  minSize = 30
): CropRect {
  const minW = Math.min(minSize, imgWidth);
  const minH = Math.min(minSize, imgHeight);

  let width = Math.max(minW, Math.min(rect.width, imgWidth));
  let height = Math.max(minH, Math.min(rect.height, imgHeight));

  let x = Math.max(0, Math.min(rect.x, imgWidth - width));
  let y = Math.max(0, Math.min(rect.y, imgHeight - height));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Updates a crop rect during drag interaction of handles or translation
 */
export function resizeCropRect(
  startRect: CropRect,
  handle: CropHandle,
  deltaX: number,
  deltaY: number,
  imgWidth: number,
  imgHeight: number,
  ratio: number | null = null,
  minSize = 30
): CropRect {
  let { x, y, width, height } = startRect;

  if (handle === 'move') {
    x = Math.max(0, Math.min(imgWidth - width, startRect.x + deltaX));
    y = Math.max(0, Math.min(imgHeight - height, startRect.y + deltaY));
    return { x: Math.round(x), y: Math.round(y), width, height };
  }

  let x1 = x;
  let y1 = y;
  let x2 = x + width;
  let y2 = y + height;

  if (handle.includes('e')) {
    x2 = Math.min(imgWidth, Math.max(x1 + minSize, startRect.x + startRect.width + deltaX));
  }
  if (handle.includes('w')) {
    x1 = Math.max(0, Math.min(x2 - minSize, startRect.x + deltaX));
  }
  if (handle.includes('s')) {
    y2 = Math.min(imgHeight, Math.max(y1 + minSize, startRect.y + startRect.height + deltaY));
  }
  if (handle.includes('n')) {
    y1 = Math.max(0, Math.min(y2 - minSize, startRect.y + deltaY));
  }

  let newW = x2 - x1;
  let newH = y2 - y1;

  if (ratio) {
    if (handle === 'e' || handle === 'w') {
      newH = newW / ratio;
      if (y1 + newH > imgHeight) {
        newH = imgHeight - y1;
        newW = newH * ratio;
      }
    } else if (handle === 'n' || handle === 's') {
      newW = newH * ratio;
      if (x1 + newW > imgWidth) {
        newW = imgWidth - x1;
        newH = newW / ratio;
      }
    } else {
      const targetW = newH * ratio;
      if (targetW <= imgWidth - x1) {
        newW = targetW;
      } else {
        newH = newW / ratio;
      }
    }
  }

  return clampCropRect({ x: x1, y: y1, width: newW, height: newH }, imgWidth, imgHeight, minSize);
}
