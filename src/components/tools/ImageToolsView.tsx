import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileArchive,
  Maximize2,
  Image as ImageIcon,
  FlipHorizontal,
  Stamp,
  Palette,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  compressImage,
  resizeImage,
  convertImageFormat,
  rotateAndFlipImage,
  watermarkImage,
  extractPalette,
  downloadBlob,
  CompressionResult,
} from '../../utils/imageUtils';
import { useApp } from '../../context/AppContext';

export const ImageToolsView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { logToolUsage } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedHex, setCopiedHex] = useState('');

  // Compressor state
  const [quality, setQuality] = useState(70);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Resizer state
  const [resizeW, setResizeW] = useState(800);
  const [resizeH, setResizeH] = useState(600);

  // Converter state
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Rotator state
  const [rotation, setRotation] = useState(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Watermark state
  const [watermarkText, setWatermarkText] = useState('STUDENT CONFIDENTIAL');
  const [wmOpacity, setWmOpacity] = useState(0.4);
  const [wmSize, setWmSize] = useState(36);

  // Palette state
  const [paletteColors, setPaletteColors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
      setSuccessMsg('');
      setCompressionResult(null);

      // Auto-extract palette if in color picker
      if (toolSlug === 'color-picker') {
        extractPalette(file).then(setPaletteColors);
      }
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await compressImage(selectedFile, quality);
      setCompressionResult(res);
      const savings = Math.round((1 - res.compressedSize / res.originalSize) * 100);
      setSuccessMsg(`Image compressed by ${savings}%!`);
      logToolUsage('image-compressor', `Saved ${savings}%`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Compression failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResize = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await resizeImage(selectedFile, resizeW, resizeH);
      downloadBlob(res.blob, `resized_${resizeW}x${resizeH}_${selectedFile.name}`);
      setSuccessMsg('Resized image downloaded!');
      logToolUsage('image-resizer', `${resizeW}x${resizeH}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Resize failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await convertImageFormat(selectedFile, targetFormat);
      const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
      downloadBlob(res.blob, `converted.${ext}`);
      setSuccessMsg(`Converted to ${ext.toUpperCase()} successfully!`);
      logToolUsage('image-converter', `Converted to ${ext}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Conversion failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateAndFlip = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await rotateAndFlipImage(selectedFile, rotation, flipH, flipV);
      downloadBlob(res.blob, `transformed_${selectedFile.name}`);
      setSuccessMsg('Transformed image downloaded!');
      logToolUsage('image-rotator', `Rotated ${rotation}°`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Transformation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatermark = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await watermarkImage(selectedFile, watermarkText, wmSize, wmOpacity);
      downloadBlob(res.blob, `watermarked_${selectedFile.name}`);
      setSuccessMsg('Watermarked image downloaded!');
      logToolUsage('image-watermark', `Added watermark "${watermarkText}"`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Watermarking failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- HONEST STATUS FOR BACKGROUND REMOVER ---
  if (toolSlug === 'background-remover') {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-5 text-amber-600 shrink-0" />
          <h4 className="font-bold text-sm">Service Not Configured</h4>
        </div>
        <p className="text-xs leading-relaxed">
          AI Background Removal requires a dedicated GPU machine learning backend (such as rembg / RMBG-1.4 PyTorch service).
        </p>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-inherit text-xs font-mono">
          Required Dependency: <span className="font-bold">Neural Image Segmentation Service (rembg/PyTorch)</span>
        </div>
        <p className="text-xs text-neutral-500">
          Per our Zero Dummy Functionality rule, this feature remains honestly disabled rather than returning fake cutouts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors">
          <ImageIcon className="size-8 text-neutral-400 mx-auto mb-2" />
          <div className="text-sm font-semibold">Select an image (JPG, PNG, WebP)</div>
          <p className="text-xs text-neutral-500 mt-1">Processed instantly in your browser via Canvas</p>
          <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
            <Upload className="size-3.5" />
            <span>Choose Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold truncate">{selectedFile.name}</span>
              <span className="text-neutral-500 font-mono">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="size-10 object-cover rounded-lg border" />
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- 1. COMPRESSOR --- */}
      {toolSlug === 'image-compressor' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Compression Quality:</span>
              <span className="font-bold text-blue-600">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleCompress}
            disabled={loading || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold"
          >
            {loading ? 'Compressing...' : 'Compress Image'}
          </button>

          {compressionResult && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-neutral-500">Original Size</div>
                  <div className="font-bold text-sm">{(compressionResult.originalSize / 1024).toFixed(1)} KB</div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-500">Compressed Size</div>
                  <div className="font-bold text-sm text-emerald-600">
                    {(compressionResult.compressedSize / 1024).toFixed(1)} KB (
                    {Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}% saved)
                  </div>
                </div>
              </div>
              <button
                onClick={() => downloadBlob(compressionResult.blob, `compressed_${selectedFile?.name}`)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="size-4" />
                <span>Download Compressed Image</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- 2. RESIZER --- */}
      {toolSlug === 'image-resizer' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500">Target Width (px)</label>
              <input
                type="number"
                value={resizeW}
                onChange={(e) => setResizeW(parseInt(e.target.value) || 100)}
                className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Target Height (px)</label>
              <input
                type="number"
                value={resizeH}
                onChange={(e) => setResizeH(parseInt(e.target.value) || 100)}
                className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 font-bold"
              />
            </div>
          </div>
          <button
            onClick={handleResize}
            disabled={loading || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            <span>Resize & Download</span>
          </button>
        </div>
      )}

      {/* --- 3. FORMAT CONVERTER --- */}
      {toolSlug === 'image-converter' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Target Format:</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'JPG / JPEG', value: 'image/jpeg' },
                { label: 'PNG', value: 'image/png' },
                { label: 'WebP', value: 'image/webp' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTargetFormat(f.value as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    targetFormat === f.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleConvert}
            disabled={loading || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            <span>Convert & Download</span>
          </button>
        </div>
      )}

      {/* --- 4. ROTATOR & FLIPPER --- */}
      {toolSlug === 'image-rotator' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold">Rotate Angle:</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    rotation === deg
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
              <span>Flip Horizontally</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
              <span>Flip Vertically</span>
            </label>
          </div>
          <button
            onClick={handleRotateAndFlip}
            disabled={loading || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            <span>Transform & Download</span>
          </button>
        </div>
      )}

      {/* --- 5. WATERMARK --- */}
      {toolSlug === 'image-watermark' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold">Watermark Text:</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500">Opacity ({wmOpacity})</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.1}
                value={wmOpacity}
                onChange={(e) => setWmOpacity(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Font Size ({wmSize}px)</label>
              <input
                type="range"
                min={16}
                max={72}
                value={wmSize}
                onChange={(e) => setWmSize(parseInt(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
          <button
            onClick={handleWatermark}
            disabled={loading || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Stamp className="size-4" />
            <span>Apply Watermark & Download</span>
          </button>
        </div>
      )}

      {/* --- 6. COLOR PICKER & PALETTE --- */}
      {toolSlug === 'color-picker' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Extracted Dominant Color Palette
          </h4>
          {paletteColors.length === 0 ? (
            <div className="text-xs text-neutral-400 italic">
              Upload an image above to extract dominant colors.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {paletteColors.map((hex) => (
                <div
                  key={hex}
                  onClick={() => {
                    navigator.clipboard.writeText(hex);
                    setCopiedHex(hex);
                    setTimeout(() => setCopiedHex(''), 2000);
                  }}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div
                    className="w-full h-12 rounded-lg border shadow-xs"
                    style={{ backgroundColor: hex }}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs font-mono font-bold">
                    <span>{hex}</span>
                    {copiedHex === hex ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-neutral-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
