"use client";

import { useState } from "react";
import { AlertTriangle, FileSearch, LoaderCircle, ShieldAlert } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, MAX_LOCAL_FILE_SIZE } from "@/lib/files";
import {
  bytesToAscii,
  bytesToHex,
  detectFileType,
  fileExtension,
  hasTypeConflict,
  imageAlpha,
  parseZipSummary,
  pdfVersion,
  type Detection,
  type ZipSummary,
} from "@/lib/file-inspector";

type ImageDetails = { width: number; height: number; ratio: string; alpha: boolean | null };
type PdfDetails = { pages: number; version: string | null; title?: string; author?: string; creator?: string; producer?: string; created?: string; modified?: string };
type TextDetails = { encoding: string; lines: number; characters: number; preview: string; truncated: boolean };
type Inspection = {
  file: File;
  detection: Detection;
  conflict: boolean;
  hash: string;
  hex: string;
  ascii: string;
  image?: ImageDetails;
  pdf?: PdfDetails;
  zip?: ZipSummary;
  text?: TextDetails;
  warnings: string[];
};

function safeDate(date?: Date) {
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("pt-BR") : undefined;
}

async function sha256(file: File) {
  const { createSHA256 } = await import("hash-wasm");
  const hash = await createSHA256();
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value);
  }
  return hash.digest();
}

export default function FileInspectorPage() {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function inspect(files: File[]) {
    const file = files[0];
    setInspection(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_LOCAL_FILE_SIZE) return setError("O inspetor aceita arquivos de até 100 MB.");
    setBusy(true);
    try {
      const head = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());
      const detection = detectFileType(head);
      const warnings: string[] = [];
      const result: Inspection = {
        file,
        detection,
        conflict: hasTypeConflict(file.name, detection),
        hash: await sha256(file),
        hex: bytesToHex(head),
        ascii: bytesToAscii(head),
        warnings,
      };

      if (["PNG", "JPEG", "GIF", "WebP"].includes(detection.kind)) {
        const bitmap = await createImageBitmap(file);
        result.image = {
          width: bitmap.width,
          height: bitmap.height,
          ratio: (bitmap.width / bitmap.height).toFixed(3),
          alpha: imageAlpha(head, detection.kind),
        };
        bitmap.close();
      }

      if (detection.kind === "PDF") {
        const { PDFDocument } = await import("pdf-lib");
        const document = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
        result.pdf = {
          pages: document.getPageCount(),
          version: pdfVersion(head),
          title: document.getTitle(),
          author: document.getAuthor(),
          creator: document.getCreator(),
          producer: document.getProducer(),
          created: safeDate(document.getCreationDate()),
          modified: safeDate(document.getModificationDate()),
        };
      }

      if (detection.kind === "ZIP") {
        result.zip = parseZipSummary(new Uint8Array(await file.arrayBuffer()));
        if (result.zip.suspicious) warnings.push("ZIP potencialmente perigoso: expansão excessiva ou caminho interno inseguro.");
      }

      if (detection.kind === "Text" || detection.kind === "JSON") {
        const decoded = new TextDecoder("utf-8", { fatal: false }).decode(head).replace(/^\uFEFF/, "");
        result.text = {
          encoding: decoded.includes("\uFFFD") ? "UTF-8 incerto" : "UTF-8 provável",
          lines: decoded ? decoded.split(/\r?\n/).length : 0,
          characters: decoded.length,
          preview: decoded.slice(0, 4000),
          truncated: file.size > head.length || decoded.length > 4000,
        };
      }
      setInspection(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível inspecionar o arquivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage title="Inspetor local de arquivos" description="Descubra o tipo real, signatures, hash e metadados de um arquivo sem executá-lo ou enviá-lo.">
      <div className="space-y-6">
        <Card><CardContent className="pt-6">
          <FileDropzone accept="*/*" label="Solte qualquer arquivo para inspecionar" hint="Leitura local · até 100 MB · nenhum conteúdo é executado" onFiles={inspect} />
          {busy && <p className="mt-4 flex items-center gap-2 text-sm text-primary"><LoaderCircle className="h-4 w-4 animate-spin" />Analisando localmente...</p>}
          {error && <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        </CardContent></Card>

        {inspection && <>
          {inspection.conflict && <div className="flex gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-amber-200"><AlertTriangle className="mt-0.5 shrink-0" /><div><p className="font-medium">Atenção: extensão e conteúdo não correspondem.</p><p className="text-sm">Trate este arquivo com cautela antes de abri-lo em outro programa.</p></div></div>}
          {inspection.warnings.map((warning) => <div key={warning} className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"><ShieldAlert className="shrink-0" /><p>{warning}</p></div>)}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileSearch />Informações gerais</CardTitle></CardHeader>
              <CardContent><dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Nome</dt><dd className="break-all">{inspection.file.name}</dd>
                <dt className="text-muted-foreground">Extensão</dt><dd>.{fileExtension(inspection.file.name) || "nenhuma"}</dd>
                <dt className="text-muted-foreground">Tamanho</dt><dd>{formatBytes(inspection.file.size)} ({inspection.file.size.toLocaleString("pt-BR")} bytes)</dd>
                <dt className="text-muted-foreground">MIME informado</dt><dd>{inspection.file.type || "não informado"}</dd>
                <dt className="text-muted-foreground">Tipo detectado</dt><dd className="font-medium text-primary">{inspection.detection.kind}</dd>
                <dt className="text-muted-foreground">MIME detectado</dt><dd>{inspection.detection.mime}</dd>
                <dt className="text-muted-foreground">Modificado</dt><dd>{inspection.file.lastModified ? new Date(inspection.file.lastModified).toLocaleString("pt-BR") : "indisponível"}</dd>
              </dl></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Signature e integridade</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div><p className="mb-1 text-muted-foreground">SHA-256</p><code className="block break-all rounded bg-secondary p-3 text-xs">{inspection.hash}</code></div>
                <div><p className="mb-1 text-muted-foreground">Primeiros bytes — hexadecimal</p><code className="block break-all rounded bg-secondary p-3 text-xs">{inspection.hex || "arquivo vazio"}</code></div>
                <div><p className="mb-1 text-muted-foreground">Primeiros bytes — ASCII seguro</p><code className="block break-all rounded bg-secondary p-3 text-xs">{inspection.ascii || "arquivo vazio"}</code></div>
              </CardContent>
            </Card>
          </div>

          {inspection.image && <Card><CardHeader><CardTitle className="text-lg">Imagem</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-4">
            <div><p className="text-muted-foreground">Dimensões</p><p>{inspection.image.width} × {inspection.image.height}</p></div>
            <div><p className="text-muted-foreground">Proporção</p><p>{inspection.image.ratio}:1</p></div>
            <div><p className="text-muted-foreground">Formato</p><p>{inspection.detection.kind}</p></div>
            <div><p className="text-muted-foreground">Canal alpha</p><p>{inspection.image.alpha === null ? "não determinado" : inspection.image.alpha ? "presente" : "ausente"}</p></div>
          </CardContent></Card>}

          {inspection.pdf && <Card><CardHeader><CardTitle className="text-lg">PDF</CardTitle></CardHeader><CardContent><dl className="grid gap-3 text-sm sm:grid-cols-[180px_1fr]">
            <dt className="text-muted-foreground">Páginas</dt><dd>{inspection.pdf.pages}</dd>
            <dt className="text-muted-foreground">Versão</dt><dd>{inspection.pdf.version ?? "indisponível"}</dd>
            {Object.entries(inspection.pdf).filter(([key, value]) => !["pages", "version"].includes(key) && value).map(([key, value]) => <div className="contents" key={key}><dt className="capitalize text-muted-foreground">{key}</dt><dd>{value}</dd></div>)}
          </dl></CardContent></Card>}

          {inspection.zip && <Card><CardHeader><CardTitle className="text-lg">Conteúdo ZIP</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-muted-foreground">Entradas</p><p>{inspection.zip.entries.length}</p></div><div><p className="text-muted-foreground">Compactado</p><p>{formatBytes(inspection.zip.totalCompressed)}</p></div><div><p className="text-muted-foreground">Descompactado estimado</p><p>{formatBytes(inspection.zip.totalUncompressed)}</p></div></div>
            <div className="max-h-72 overflow-auto rounded border border-border">
              {inspection.zip.entries.slice(0, 500).map((entry, index) => <div key={`${entry.name}-${index}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-3 py-2 text-xs last:border-0"><span className="break-all">{entry.directory ? "📁 " : ""}{entry.name}{entry.unsafePath ? " ⚠" : ""}</span><span className="text-muted-foreground">{formatBytes(entry.uncompressedSize)}</span></div>)}
            </div>
            {inspection.zip.entries.length > 500 && <p className="text-xs text-muted-foreground">Exibindo as primeiras 500 entradas.</p>}
          </CardContent></Card>}

          {inspection.text && <Card><CardHeader><CardTitle className="text-lg">Texto</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6 text-sm"><span><span className="text-muted-foreground">Encoding:</span> {inspection.text.encoding}</span><span><span className="text-muted-foreground">Linhas na amostra:</span> {inspection.text.lines}</span><span><span className="text-muted-foreground">Caracteres na amostra:</span> {inspection.text.characters}</span></div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded border border-border bg-secondary/40 p-4 text-xs">{inspection.text.preview}</pre>
            {inspection.text.truncated && <p className="text-xs text-muted-foreground">Preview limitado por segurança e desempenho.</p>}
          </CardContent></Card>}
        </>}
      </div>
    </ToolPage>
  );
}
