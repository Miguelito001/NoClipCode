export type DetectedKind =
  | "PNG" | "JPEG" | "GIF" | "WebP" | "PDF" | "ZIP" | "GZIP"
  | "MP3" | "WAV" | "MP4" | "WebM" | "SQLite Database" | "ELF"
  | "PE/EXE" | "JSON" | "Text" | "Unknown";

export interface Detection {
  kind: DetectedKind;
  mime: string;
  extension: string;
  confidence: "signature" | "content" | "unknown";
}

const signatures: Array<{ kind: DetectedKind; mime: string; extension: string; offset?: number; bytes: number[] }> = [
  { kind: "PNG", mime: "image/png", extension: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { kind: "JPEG", mime: "image/jpeg", extension: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { kind: "GIF", mime: "image/gif", extension: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { kind: "PDF", mime: "application/pdf", extension: "pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { kind: "ZIP", mime: "application/zip", extension: "zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
  { kind: "ZIP", mime: "application/zip", extension: "zip", bytes: [0x50, 0x4b, 0x05, 0x06] },
  { kind: "GZIP", mime: "application/gzip", extension: "gz", bytes: [0x1f, 0x8b] },
  { kind: "WAV", mime: "audio/wav", extension: "wav", offset: 8, bytes: [0x57, 0x41, 0x56, 0x45] },
  { kind: "WebM", mime: "video/webm", extension: "webm", bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { kind: "SQLite Database", mime: "application/vnd.sqlite3", extension: "sqlite", bytes: [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00] },
  { kind: "ELF", mime: "application/x-elf", extension: "elf", bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { kind: "PE/EXE", mime: "application/vnd.microsoft.portable-executable", extension: "exe", bytes: [0x4d, 0x5a] },
];

const compatibleExtensions: Partial<Record<DetectedKind, string[]>> = {
  PNG: ["png"], JPEG: ["jpg", "jpeg", "jfif"], GIF: ["gif"], WebP: ["webp"],
  PDF: ["pdf"], ZIP: ["zip", "docx", "xlsx", "pptx", "jar", "apk"], GZIP: ["gz", "gzip"],
  MP3: ["mp3"], WAV: ["wav"], MP4: ["mp4", "m4v", "mov"], WebM: ["webm"],
  "SQLite Database": ["sqlite", "sqlite3", "db"], ELF: ["elf", "so"], "PE/EXE": ["exe", "dll"],
  JSON: ["json"], Text: ["txt", "csv", "md", "log", "xml", "svg", "html", "css", "js", "ts"],
};

function matches(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function looksLikeText(bytes: Uint8Array): boolean {
  if (!bytes.length) return true;
  let printable = 0;
  for (const byte of bytes) {
    if (byte === 0) return false;
    if (byte === 9 || byte === 10 || byte === 13 || byte >= 32) printable += 1;
  }
  return printable / bytes.length > 0.85;
}

export function detectFileType(bytes: Uint8Array): Detection {
  for (const signature of signatures) {
    if (matches(bytes, signature.bytes, signature.offset)) {
      if (signature.kind === "WAV" && !matches(bytes, [0x52, 0x49, 0x46, 0x46])) continue;
      return { kind: signature.kind, mime: signature.mime, extension: signature.extension, confidence: "signature" };
    }
  }
  if (bytes.length >= 12 && matches(bytes, [0x52, 0x49, 0x46, 0x46]) && matches(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { kind: "WebP", mime: "image/webp", extension: "webp", confidence: "signature" };
  }
  if (bytes.length >= 12 && matches(bytes, [0x66, 0x74, 0x79, 0x70], 4)) {
    return { kind: "MP4", mime: "video/mp4", extension: "mp4", confidence: "signature" };
  }
  if (matches(bytes, [0x49, 0x44, 0x33]) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
    return { kind: "MP3", mime: "audio/mpeg", extension: "mp3", confidence: "signature" };
  }
  if (looksLikeText(bytes)) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/^\uFEFF/, "").trim();
    if (text) {
      try {
        JSON.parse(text);
        return { kind: "JSON", mime: "application/json", extension: "json", confidence: "content" };
      } catch { /* plain text */ }
    }
    return { kind: "Text", mime: "text/plain", extension: "txt", confidence: "content" };
  }
  return { kind: "Unknown", mime: "application/octet-stream", extension: "", confidence: "unknown" };
}

export function fileExtension(name: string): string {
  const match = name.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? "";
}

export function hasTypeConflict(name: string, detection: Detection): boolean {
  if (detection.kind === "Unknown") return false;
  const extension = fileExtension(name);
  if (!extension) return true;
  return !(compatibleExtensions[detection.kind] ?? [detection.extension]).includes(extension);
}

export function bytesToHex(bytes: Uint8Array, limit = 32): string {
  return Array.from(bytes.slice(0, limit), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

export function bytesToAscii(bytes: Uint8Array, limit = 32): string {
  return Array.from(bytes.slice(0, limit), (byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".").join("");
}

export function pdfVersion(bytes: Uint8Array): string | null {
  const match = new TextDecoder("ascii").decode(bytes.slice(0, 16)).match(/^%PDF-(\d\.\d)/);
  return match?.[1] ?? null;
}

export function imageAlpha(bytes: Uint8Array, kind: DetectedKind): boolean | null {
  if (kind === "JPEG") return false;
  if (kind === "PNG" && bytes.length > 25) return bytes[25] === 4 || bytes[25] === 6;
  if (kind === "WebP" && bytes.length > 21 && new TextDecoder("ascii").decode(bytes.slice(12, 16)) === "VP8X") {
    return Boolean(bytes[20] & 0x10);
  }
  return null;
}

export interface ZipEntrySummary {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  directory: boolean;
  unsafePath: boolean;
}

export interface ZipSummary {
  entries: ZipEntrySummary[];
  totalCompressed: number;
  totalUncompressed: number;
  suspicious: boolean;
}

function findEocd(bytes: Uint8Array): number {
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
    if (bytes[index] === 0x50 && bytes[index + 1] === 0x4b && bytes[index + 2] === 0x05 && bytes[index + 3] === 0x06) return index;
  }
  return -1;
}

export function parseZipSummary(bytes: Uint8Array): ZipSummary {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEocd(bytes);
  if (eocd < 0) throw new Error("Diretório central ZIP não encontrado.");
  const entryCount = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (entryCount > 10000) throw new Error("ZIP excede o limite seguro de 10.000 entradas.");
  let cursor = centralOffset;
  const entries: ZipEntrySummary[] = [];
  let totalCompressed = 0;
  let totalUncompressed = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50) throw new Error("Diretório central ZIP inválido.");
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const nameBytes = bytes.slice(cursor + 46, cursor + 46 + nameLength);
    const name = new TextDecoder("utf-8", { fatal: false }).decode(nameBytes);
    const normalized = name.replace(/\\/g, "/");
    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      directory: normalized.endsWith("/"),
      unsafePath: normalized.startsWith("/") || normalized.split("/").includes(".."),
    });
    totalCompressed += compressedSize;
    totalUncompressed += uncompressedSize;
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  const suspicious = totalUncompressed > 1024 ** 3
    || (totalCompressed > 0 && totalUncompressed / totalCompressed > 100)
    || entries.some((entry) => entry.unsafePath);
  return { entries, totalCompressed, totalUncompressed, suspicious };
}
