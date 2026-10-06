// Real Canvas-based image processing for StudentToolBox

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  qualityPercent: number,
  maxWidth = 2400,
  maxHeight = 2400
): Promise<CompressionResult> {
  const img = await loadImage(file);
  let { width, height } = img;

  // Scale down if dimensions exceed bounds
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context.');

  ctx.drawImage(img, 0, 0, width, height);

  const quality = Math.max(0.05, Math.min(1.0, qualityPercent / 100));
  const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas image compression failed.'));
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          blob,
          dataUrl,
          originalSize: file.size,
          compressedSize: blob.size,
          width,
          height,
        });
      },
      mimeType,
      quality
    );
  });
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  targetMime = 'image/jpeg'
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context.');

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to resize image.'));
        const dataUrl = canvas.toDataURL(targetMime, 0.92);
        resolve({ blob, dataUrl });
      },
      targetMime,
      0.92
    );
  });
}

export async function convertImageFormat(
  file: File,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Fill white background for JPEG conversion of transparent PNGs
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Format conversion failed.'));
        const dataUrl = canvas.toDataURL(targetMime, 0.95);
        resolve({ blob, dataUrl });
      },
      targetMime,
      0.95
    );
  });
}

export async function rotateAndFlipImage(
  file: File,
  rotationDeg: number,
  flipH: boolean,
  flipV: boolean
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const rad = (rotationDeg * Math.PI) / 180;
  const is90or270 = rotationDeg % 180 !== 0;

  canvas.width = is90or270 ? img.height : img.width;
  canvas.height = is90or270 ? img.width : img.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Transform failed.'));
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ blob, dataUrl });
      },
      'image/png'
    );
  });
}

export async function watermarkImage(
  file: File,
  text: string,
  fontSize = 32,
  opacity = 0.5,
  color = '#FFFFFF'
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, 0, 0);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Place watermark at bottom right
  const metrics = ctx.measureText(text);
  const x = canvas.width - metrics.width - 24;
  const y = canvas.height - 24;

  ctx.fillText(text, Math.max(20, x), Math.max(40, y));
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Watermarking failed.'));
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ blob, dataUrl });
      },
      'image/png'
    );
  });
}

export async function extractPalette(file: File, sampleCount = 6): Promise<string[]> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const maxDimension = 150;
  const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const colorCounts: Record<string, number> = {};
  const step = 4 * 3; // sample every 3rd pixel

  for (let i = 0; i < imageData.length; i += step) {
    const r = Math.round(imageData[i] / 24) * 24;
    const g = Math.round(imageData[i + 1] / 24) * 24;
    const b = Math.round(imageData[i + 2] / 24) * 24;
    const a = imageData[i + 3];

    if (a < 128) continue; // ignore transparent
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }

  const sorted = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  return sorted.slice(0, sampleCount);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
