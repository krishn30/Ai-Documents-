import React, { useState } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Layers,
  Scissors,
  RotateCw,
  FilePlus,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  mergePDFs,
  splitPDF,
  rotatePDFPages,
  deletePDFPages,
  imagesToPDF,
  extractPDFText,
  downloadUint8Array,
} from '../../utils/pdfUtils';
import { useApp } from '../../context/AppContext';

export const PdfToolsView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { logToolUsage } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Split & Rotate state
  const [singlePdfFile, setSinglePdfFile] = useState<File | null>(null);
  const [splitRange, setSplitRange] = useState('1-2');
  const [rotateDegrees, setRotateDegrees] = useState(90);
  const [deletePageNums, setDeletePageNums] = useState('1');

  // Images to PDF state
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // PDF Text state
  const [extractedText, setExtractedText] = useState('');

  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const mergedBytes = await mergePDFs(mergeFiles);
      downloadUint8Array(mergedBytes, 'merged_document.pdf');
      setSuccessMsg(`Merged ${mergeFiles.length} files successfully! Download started.`);
      logToolUsage('pdf-merger', `Merged ${mergeFiles.length} files`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to merge PDF files.');
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!singlePdfFile) {
      setErrorMsg('Please upload a PDF file first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const splitBytes = await splitPDF(singlePdfFile, splitRange);
      downloadUint8Array(splitBytes, `extracted_pages_${splitRange.replace(/[, -]/g, '_')}.pdf`);
      setSuccessMsg(`Extracted pages (${splitRange}) successfully! Download started.`);
      logToolUsage('pdf-splitter', `Extracted pages ${splitRange}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract PDF pages.');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = async () => {
    if (!singlePdfFile) {
      setErrorMsg('Please upload a PDF file first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const rotatedBytes = await rotatePDFPages(singlePdfFile, rotateDegrees);
      downloadUint8Array(rotatedBytes, `rotated_${rotateDegrees}deg_${singlePdfFile.name}`);
      setSuccessMsg(`Rotated document by ${rotateDegrees}° clockwise! Download started.`);
      logToolUsage('pdf-rotator', `Rotated by ${rotateDegrees}°`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to rotate PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePages = async () => {
    if (!singlePdfFile) {
      setErrorMsg('Please upload a PDF file first.');
      return;
    }
    const pageNums = deletePageNums
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n));

    if (pageNums.length === 0) {
      setErrorMsg('Please enter valid page numbers to delete (e.g. 1, 3).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const cleanedBytes = await deletePDFPages(singlePdfFile, pageNums);
      downloadUint8Array(cleanedBytes, `cleaned_${singlePdfFile.name}`);
      setSuccessMsg(`Deleted ${pageNums.length} page(s) successfully! Download started.`);
      logToolUsage('pdf-page-delete', `Deleted pages ${deletePageNums}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete pages.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      setErrorMsg('Please upload at least one image.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const pdfBytes = await imagesToPDF(imageFiles);
      downloadUint8Array(pdfBytes, 'converted_photos.pdf');
      setSuccessMsg(`Converted ${imageFiles.length} photos into PDF document! Download started.`);
      logToolUsage('jpg-to-pdf', `Converted ${imageFiles.length} photos to PDF`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to convert images to PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractText = async () => {
    if (!singlePdfFile) {
      setErrorMsg('Please upload a PDF file first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await extractPDFText(singlePdfFile);
      setExtractedText(res.text);
      setSuccessMsg(`Extracted text from ${res.pageCount} pages!`);
      logToolUsage('pdf-to-text', `Extracted text from ${res.pageCount} pages`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract text from PDF.');
    } finally {
      setLoading(false);
    }
  };

  // --- HONEST STATUS FOR UNCONFIGURED TOOLS ---
  if (toolSlug === 'pdf-to-word') {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-5 text-amber-600 shrink-0" />
          <h4 className="font-bold text-sm">Service Not Configured</h4>
        </div>
        <p className="text-xs leading-relaxed">
          PDF to Microsoft Word (.docx) conversion is currently unavailable because the binary conversion daemon is not installed in this environment.
        </p>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-inherit text-xs font-mono">
          Required Dependency: <span className="font-bold">LibreOffice CLI / Poppler PDF Converter daemon</span>
        </div>
        <p className="text-xs text-neutral-500">
          In adherence to our Zero Dummy Functionality rule, we do not fake file conversions or return corrupted placeholder files. Use client-side tools like PDF Splitter, Merger, or Text Extractor above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- 1. MERGE PDF --- */}
      {toolSlug === 'pdf-merger' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
            <Layers className="size-10 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Select 2 or more PDF documents to merge
            </div>
            <p className="text-xs text-neutral-500 mt-1">Processed securely in your browser</p>
            <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Browse PDF Files</span>
              <input
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setMergeFiles(Array.from(e.target.files));
                    setErrorMsg('');
                    setSuccessMsg('');
                  }
                }}
              />
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-neutral-500 uppercase">Selected Files ({mergeFiles.length}):</h5>
              <div className="space-y-1.5">
                {mergeFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs"
                  >
                    <span className="font-medium truncate">{idx + 1}. {file.name}</span>
                    <span className="text-neutral-500 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleMerge}
                disabled={loading || mergeFiles.length < 2}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="size-4" />
                <span>{loading ? 'Merging PDFs...' : 'Merge & Download Single PDF'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- 2. SPLIT PDF --- */}
      {toolSlug === 'pdf-splitter' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center">
            <Scissors className="size-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold">Select PDF Document to Split</div>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Choose PDF</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSinglePdfFile(e.target.files[0]);
                }}
              />
            </label>
            {singlePdfFile && (
              <div className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                Selected: {singlePdfFile.name} ({(singlePdfFile.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Page Range to Extract (e.g. 1-3, 5):
            </label>
            <input
              type="text"
              value={splitRange}
              onChange={(e) => setSplitRange(e.target.value)}
              className="w-full mt-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-mono font-bold"
            />
          </div>

          <button
            onClick={handleSplit}
            disabled={loading || !singlePdfFile}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            <span>{loading ? 'Extracting Pages...' : 'Split & Download Extracted PDF'}</span>
          </button>
        </div>
      )}

      {/* --- 3. ROTATE PDF --- */}
      {toolSlug === 'pdf-rotator' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center">
            <RotateCw className="size-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold">Select PDF Document to Rotate</div>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Choose PDF</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSinglePdfFile(e.target.files[0]);
                }}
              />
            </label>
            {singlePdfFile && (
              <div className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                Selected: {singlePdfFile.name}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Clockwise Rotation Angle:
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotateDegrees(deg)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    rotateDegrees === deg
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRotate}
            disabled={loading || !singlePdfFile}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            <span>{loading ? 'Rotating Pages...' : `Rotate by ${rotateDegrees}° & Download`}</span>
          </button>
        </div>
      )}

      {/* --- 4. DELETE PDF PAGES --- */}
      {toolSlug === 'pdf-page-delete' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center">
            <Trash2 className="size-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold">Select PDF Document</div>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Choose PDF</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSinglePdfFile(e.target.files[0]);
                }}
              />
            </label>
            {singlePdfFile && (
              <div className="mt-3 text-xs font-medium text-blue-600">
                Selected: {singlePdfFile.name}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Page numbers to delete (separated by comma, e.g. 1, 4):
            </label>
            <input
              type="text"
              value={deletePageNums}
              onChange={(e) => setDeletePageNums(e.target.value)}
              className="w-full mt-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-mono font-bold"
            />
          </div>

          <button
            onClick={handleDeletePages}
            disabled={loading || !singlePdfFile}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <Trash2 className="size-4" />
            <span>{loading ? 'Processing...' : 'Delete Pages & Download Clean PDF'}</span>
          </button>
        </div>
      )}

      {/* --- 5. IMAGES TO PDF --- */}
      {toolSlug === 'jpg-to-pdf' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center">
            <FilePlus className="size-10 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold">Select Photos (JPG, PNG) to compile into a PDF</div>
            <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Select Images</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setImageFiles(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {imageFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-neutral-500 uppercase">
                {imageFiles.length} photos selected
              </div>
              <button
                onClick={handleImagesToPdf}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="size-4" />
                <span>{loading ? 'Compiling PDF...' : 'Convert Images & Download PDF'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- 6. PDF TEXT EXTRACTOR --- */}
      {toolSlug === 'pdf-to-text' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center">
            <FileText className="size-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold">Select PDF Document to Extract Text</div>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Upload className="size-3.5" />
              <span>Choose PDF</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSinglePdfFile(e.target.files[0]);
                }}
              />
            </label>
            {singlePdfFile && (
              <div className="mt-3 text-xs font-medium text-blue-600">
                Selected: {singlePdfFile.name}
              </div>
            )}
          </div>

          <button
            onClick={handleExtractText}
            disabled={loading || !singlePdfFile}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Reading text...' : 'Extract All Text Streams'}</span>
          </button>

          {extractedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Extracted Content:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-medium text-blue-600 flex items-center gap-1"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                value={extractedText}
                readOnly
                rows={10}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
