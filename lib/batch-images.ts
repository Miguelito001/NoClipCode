import { replaceExtension } from "./files";

export const BATCH_IMAGE_LIMITS = {
  maxFiles: 30,
  maxFileSize: 25 * 1024 * 1024,
  maxTotalSize: 250 * 1024 * 1024,
  maxDimension: 12000,
} as const;

export type ResizeMode = "original" | "max" | "fixed";
export type OutputImageType = "image/png" | "image/jpeg" | "image/webp";

export interface ResizeOptions {
  mode: ResizeMode;
  width?: number;
  height?: number;
  preserveAspectRatio: boolean;
}

export interface NamingOptions {
  prefix: string;
  suffix: string;
  useOriginalName: boolean;
  numbered: boolean;
  startAt: number;
}

export function outputExtension(type: OutputImageType) {
  return type === "image/jpeg" ? "jpg" : type.split("/")[1];
}

export function buildBatchFilename(
  originalName: string,
  index: number,
  extension: string,
  options: NamingOptions,
): string {
  const originalBase = originalName.replace(/\.[^.]+$/, "") || "imagem";
  const core = options.useOriginalName ? originalBase : "";
  const number = options.numbered ? String(options.startAt + index) : "";
  const separator = options.numbered && (options.prefix || core || options.suffix) ? "-" : "";
  const base = `${options.prefix}${core}${options.suffix}${separator}${number}`
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim() || `imagem-${index + 1}`;
  return replaceExtension(base, extension);
}

export function calculateImageDimensions(
  sourceWidth: number,
  sourceHeight: number,
  options: ResizeOptions,
): { width: number; height: number } {
  if (sourceWidth < 1 || sourceHeight < 1) throw new Error("Dimensões de origem inválidas.");
  if (options.mode === "original") return { width: sourceWidth, height: sourceHeight };

  const width = options.width && options.width > 0 ? Math.round(options.width) : undefined;
  const height = options.height && options.height > 0 ? Math.round(options.height) : undefined;
  if (!width && !height) throw new Error("Informe ao menos uma dimensão.");

  if (options.mode === "max") {
    const scale = Math.min(
      1,
      width ? width / sourceWidth : Number.POSITIVE_INFINITY,
      height ? height / sourceHeight : Number.POSITIVE_INFINITY,
    );
    return {
      width: Math.max(1, Math.round(sourceWidth * scale)),
      height: Math.max(1, Math.round(sourceHeight * scale)),
    };
  }

  if (!options.preserveAspectRatio) {
    return { width: width ?? sourceWidth, height: height ?? sourceHeight };
  }
  if (width && height) {
    const scale = Math.min(width / sourceWidth, height / sourceHeight);
    return {
      width: Math.max(1, Math.round(sourceWidth * scale)),
      height: Math.max(1, Math.round(sourceHeight * scale)),
    };
  }
  if (width) return { width, height: Math.max(1, Math.round(width * sourceHeight / sourceWidth)) };
  return { width: Math.max(1, Math.round((height as number) * sourceWidth / sourceHeight)), height: height as number };
}

export function validateBatchFiles(files: Pick<File, "name" | "size" | "type">[]): string[] {
  const errors: string[] = [];
  if (!files.length) errors.push("Selecione ao menos uma imagem.");
  if (files.length > BATCH_IMAGE_LIMITS.maxFiles) errors.push(`O lote aceita no máximo ${BATCH_IMAGE_LIMITS.maxFiles} imagens.`);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > BATCH_IMAGE_LIMITS.maxTotalSize) errors.push("O lote não pode ultrapassar 250 MB.");
  for (const file of files) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) errors.push(`${file.name}: formato não suportado.`);
    if (file.size > BATCH_IMAGE_LIMITS.maxFileSize) errors.push(`${file.name}: ultrapassa 25 MB.`);
  }
  return errors;
}

export async function transformImage(
  file: File,
  type: OutputImageType,
  quality: number,
  resize: ResizeOptions,
): Promise<{ blob: Blob; sourceWidth: number; sourceHeight: number; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const dimensions = calculateImageDimensions(bitmap.width, bitmap.height, resize);
    if (dimensions.width > BATCH_IMAGE_LIMITS.maxDimension || dimensions.height > BATCH_IMAGE_LIMITS.maxDimension) {
      throw new Error("A dimensão final não pode ultrapassar 12.000 px.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: type !== "image/jpeg" });
    if (!context) throw new Error("Canvas 2D indisponível.");
    if (type === "image/jpeg") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality / 100));
    if (!blob) throw new Error("O navegador não conseguiu gerar a imagem.");
    return { blob, sourceWidth: bitmap.width, sourceHeight: bitmap.height, ...dimensions };
  } finally {
    bitmap.close();
  }
}
