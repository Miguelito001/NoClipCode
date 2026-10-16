import { jsonrepair } from "jsonrepair";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";

export const TOOL_LIMITS = { text: 2_000_000, svg: 1_000_000, mermaid: 100_000, heic: 30 * 1024 * 1024, images: 30, pdfPages: 100 };

export async function queryJsonPath(input: string, path: string) {
  const data = JSON.parse(input);
  if (!path.trim()) throw new Error("Informe uma expressão JSONPath.");
  if (!path.trim().startsWith("$") || (path.match(/\[/g)?.length ?? 0) !== (path.match(/\]/g)?.length ?? 0)) throw new Error("Expressão JSONPath inválida.");
  const { JSONPath } = await import("jsonpath-plus");
  return JSONPath({ path, json: data, eval: false, wrap: true });
}

export function repairJson(input: string) {
  if (!input.trim()) throw new Error("Insira um JSON para reparar.");
  const repaired = jsonrepair(input);
  const value = JSON.parse(repaired);
  if (value === null || typeof value !== "object") throw new Error("A entrada não representa um objeto ou array JSON recuperável com confiança.");
  const formatted = JSON.stringify(value, null, 2);
  const changes: string[] = [];
  if (/\/\/|\/\*/.test(input)) changes.push("comentários removidos");
  if (/'/.test(input)) changes.push("aspas simples convertidas");
  if (/[,;]\s*[}\]]/.test(input)) changes.push("vírgulas finais removidas");
  if (/[{,]\s*[A-Za-z_$][\w$-]*\s*:/.test(input)) changes.push("chaves sem aspas corrigidas");
  if (!changes.length && input.trim() !== formatted) changes.push("estrutura JSON normalizada");
  return { formatted, changes };
}

export type TomlFormat = "toml" | "json" | "yaml";
export async function convertTomlData(input: string, from: TomlFormat, to: TomlFormat) {
  let data: unknown;
  if (from === "toml") data = parseToml(input);
  else if (from === "json") data = JSON.parse(input);
  else data = (await import("yaml")).parse(input);
  if (to === "toml") return stringifyToml(data as Record<string, unknown>);
  if (to === "json") return JSON.stringify(data, null, 2);
  return (await import("yaml")).stringify(data);
}

export function sanitizeSvg(svg: string) {
  if (!/<svg[\s>]/i.test(svg)) throw new Error("Conteúdo SVG inválido.");
  let safe = svg
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:href|xlink:href|src)\s*=\s*(["'])\s*(?:javascript:|https?:|\/\/|data:text\/html)[\s\S]*?\1/gi, "")
    .replace(/url\(\s*(["']?)(?:javascript:|https?:|\/\/|data:text\/html)[\s\S]*?\1\s*\)/gi, "none");
  safe = safe.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  return safe;
}

export function inspectSvg(svg: string) {
  const safe = sanitizeSvg(svg);
  const tag = safe.match(/<svg\b([^>]*)>/i)?.[1] ?? "";
  const attr = (name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? "—";
  return { safe, width: attr("width"), height: attr("height"), viewBox: attr("viewBox"), elements: (safe.match(/<(?!\/?svg\b|[!?])([a-z][\w:-]*)\b/gi) ?? []).length };
}

export function parsePageSelection(input: string, count: number) {
  if (!input.trim()) return Array.from({ length: count }, (_, i) => i);
  const pages: number[] = [];
  for (const part of input.split(",")) {
    const match = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Intervalo inválido: ${part.trim()}`);
    const start = Number(match[1]), end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > count) throw new Error(`Página fora do intervalo 1-${count}.`);
    for (let page = start; page <= end; page++) if (!pages.includes(page - 1)) pages.push(page - 1);
  }
  return pages;
}

export function imagePlacement(imageWidth: number, imageHeight: number, pageWidth: number, pageHeight: number, margin: number, mode: "fit" | "fill") {
  const availableWidth = pageWidth - margin * 2, availableHeight = pageHeight - margin * 2;
  const scale = mode === "fit" ? Math.min(availableWidth / imageWidth, availableHeight / imageHeight) : Math.max(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale, height = imageHeight * scale;
  return { width, height, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2 };
}

export async function readPdfMetadata(bytes: ArrayBuffer | Uint8Array) {
  const { PDFDocument } = await import("pdf-lib");
  const document = await PDFDocument.load(bytes, { updateMetadata: false });
  return { title: document.getTitle(), author: document.getAuthor(), subject: document.getSubject(), keywords: document.getKeywords(), creator: document.getCreator(), producer: document.getProducer(), creationDate: document.getCreationDate(), modificationDate: document.getModificationDate() };
}

export async function removePdfMetadata(bytes: ArrayBuffer | Uint8Array) {
  const { PDFDocument, PDFRef } = await import("pdf-lib");
  const document = await PDFDocument.load(bytes, { updateMetadata: false });
  const info = document.context.trailerInfo.Info;
  if (info instanceof PDFRef) document.context.delete(info);
  delete document.context.trailerInfo.Info;
  return Uint8Array.from(await document.save({ updateFieldAppearances: false }));
}

function channel(value: number) { const n = value / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }
export function parseCssColor(input: string): [number, number, number] {
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) { const h = hex[1].length === 3 ? [...hex[1]].map((x) => x + x).join("") : hex[1]; return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]; }
  const rgb = value.match(/^rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/);
  if (rgb) { const out = rgb.slice(1).map(Number); if (out.every((n) => n >= 0 && n <= 255)) return out as [number, number, number]; }
  const hsl = value.match(/^hsl\(\s*(-?[\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
  if (hsl) { const h = ((Number(hsl[1]) % 360) + 360) % 360 / 360, s = Number(hsl[2]) / 100, l = Number(hsl[3]) / 100; if (s <= 1 && l <= 1) { const hue = (p:number,q:number,t:number) => { if (t<0)t++; if(t>1)t--; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }; const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q; return (s===0?[l,l,l]:[hue(p,q,h+1/3),hue(p,q,h),hue(p,q,h-1/3)]).map(n=>Math.round(n*255)) as [number,number,number]; } }
  throw new Error("Use HEX, rgb(r,g,b) ou hsl(h,s%,l%).");
}
export function contrastRatio(foreground: string, background: string) {
  const luminance = (c: [number,number,number]) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
  const [a,b] = [luminance(parseCssColor(foreground)), luminance(parseCssColor(background))].sort((x,y)=>y-x);
  const ratio = (a + 0.05) / (b + 0.05);
  return { ratio, aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5 };
}

export function validateHeic(file: { name: string; type: string; size: number }) {
  if (file.size > TOOL_LIMITS.heic) throw new Error("O arquivo deve ter no máximo 30 MB.");
  if (!/\.(hei[cf])$/i.test(file.name) && !/^image\/hei[cf]$/i.test(file.type)) throw new Error("Escolha um arquivo HEIC ou HEIF.");
  return true;
}

export function validateMermaid(source: string) {
  if (!source.trim()) throw new Error("Insira um diagrama Mermaid.");
  if (source.length > TOOL_LIMITS.mermaid) throw new Error("O diagrama deve ter no máximo 100 KB.");
  if (/%%\{\s*init|<\/?(?:script|iframe|foreignObject)|javascript:|click\s+\S+\s+(?:href|call)/i.test(source)) throw new Error("O diagrama contém recursos bloqueados por segurança.");
  return source;
}
