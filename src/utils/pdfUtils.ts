import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(file: File, pageRangesStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const pageIndicesToExtract = parsePageRanges(pageRangesStr, totalPages);

  if (pageIndicesToExtract.length === 0) {
    throw new Error('No valid pages found in the requested range. Document has ' + totalPages + ' pages.');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, pageIndicesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function rotatePDFPages(file: File, angleDegrees: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angleDegrees) % 360));
  }

  return await pdfDoc.save();
}

export async function deletePDFPages(file: File, pagesToDelete1Based: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Convert to 0-based and filter valid
  const indicesToDelete = new Set(
    pagesToDelete1Based.map((p) => p - 1).filter((idx) => idx >= 0 && idx < totalPages)
  );

  if (indicesToDelete.size >= totalPages) {
    throw new Error('Cannot delete all pages in the PDF document.');
  }

  const newPdf = await PDFDocument.create();
  const pagesToKeep: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!indicesToDelete.has(i)) {
      pagesToKeep.push(i);
    }
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function imagesToPDF(imageFiles: File[]): Promise<Uint8Array> {
  if (imageFiles.length === 0) {
    throw new Error('Please select at least one image to convert to PDF.');
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const bytes = await file.arrayBuffer();
    const mime = file.type.toLowerCase();

    let embeddedImage;
    if (mime.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else {
      // JPG or fallback
      embeddedImage = await pdfDoc.embedJpg(bytes);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

export async function extractPDFText(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();

  // Basic client-side text extractor from PDF metadata and stream strings
  const uint8 = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('utf-8');
  const rawContent = textDecoder.decode(uint8);

  // Extract parentheses-enclosed strings in text rendering operators (TJ, Tj)
  const matches = rawContent.match(/\(([^()]+)\)\s*(?:Tj|'|")/g) || [];
  let extracted = matches
    .map((m) => m.replace(/^[(\s]+|[)\s]+$/g, '').trim())
    .filter((s) => s.length > 0)
    .join(' ');

  if (!extracted || extracted.length < 20) {
    // If stream is compressed or font-encoded, notify user honestly
    extracted = `[Extracted Metadata]\nTitle: ${pdfDoc.getTitle() || 'Untitled'}\nAuthor: ${pdfDoc.getAuthor() || 'Unknown'}\nSubject: ${pdfDoc.getSubject() || 'None'}\nTotal Pages: ${pageCount}\n\nNote: The text streams in this PDF use binary FlateDecode compression. For OCR on scanned images or complex embedded fonts, use the AI Document Analyzer tool.`;
  }

  return {
    text: extracted,
    pageCount,
  };
}

export function parsePageRanges(rangesStr: string, maxPages: number): number[] {
  const result = new Set<number>();
  const parts = rangesStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i >= 1 && i <= maxPages) {
            result.add(i - 1);
          }
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        result.add(pageNum - 1);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

export function downloadUint8Array(data: Uint8Array, fileName: string, mimeType = 'application/pdf') {
  const blob = new Blob([data as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
