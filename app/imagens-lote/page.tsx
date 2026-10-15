"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Images, LoaderCircle, Package, Square, Trash2 } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadBlob, formatBytes } from "@/lib/files";
import {
  BATCH_IMAGE_LIMITS,
  buildBatchFilename,
  outputExtension,
  transformImage,
  validateBatchFiles,
  type OutputImageType,
  type ResizeMode,
} from "@/lib/batch-images";

type BatchItem = {
  id: string;
  file: File;
  status: "aguardando" | "processando" | "pronto" | "erro";
  error?: string;
  output?: Blob;
  outputName?: string;
  sourceWidth?: number;
  sourceHeight?: number;
  width?: number;
  height?: number;
};

export default function BatchImagesPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [format, setFormat] = useState<OutputImageType>("image/webp");
  const [quality, setQuality] = useState(82);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("max");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [preserveRatio, setPreserveRatio] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [useOriginalName, setUseOriginalName] = useState(true);
  const [numbered, setNumbered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [message, setMessage] = useState("");
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; }, []);

  function choose(files: File[]) {
    const merged = [...items.map((item) => item.file), ...files];
    const globalErrors = validateBatchFiles(merged).filter((entry) => entry.includes("30 imagens") || entry.includes("250 MB"));
    if (globalErrors.length) return setMessage(globalErrors.join(" "));
    const invalidCount = merged.filter((file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > BATCH_IMAGE_LIMITS.maxFileSize).length;
    setMessage(invalidCount ? `${invalidCount} arquivo(s) inválido(s) foram mantidos na lista para revisão e não serão processados.` : "");
    setItems(merged.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      file,
      status: !["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > BATCH_IMAGE_LIMITS.maxFileSize ? "erro" : "aguardando",
      error: !["image/png", "image/jpeg", "image/webp"].includes(file.type)
        ? "Formato não suportado."
        : file.size > BATCH_IMAGE_LIMITS.maxFileSize ? "Arquivo acima de 25 MB." : undefined,
    })));
  }

  function remove(id: string) {
    if (busy) return;
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function processAll() {
    const processable = items.filter((item) => !item.error);
    if (!processable.length) return setMessage("Não há imagens válidas para processar.");
    setBusy(true);
    setMessage("");
    setProgress(0);
    setProgressTotal(processable.length);
    cancelled.current = false;
    setItems((current) => current.map((item) => item.error ? item : ({ ...item, status: "aguardando", output: undefined })));
    const usedNames = new Set<string>();

    for (let index = 0; index < processable.length; index += 1) {
      if (cancelled.current) break;
      const item = processable[index];
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "processando" } : entry));
      try {
        const transformed = await transformImage(item.file, format, quality, {
          mode: resizeMode,
          width: Number(width) || undefined,
          height: Number(height) || undefined,
          preserveAspectRatio: preserveRatio,
        });
        let outputName = buildBatchFilename(item.file.name, index, outputExtension(format), {
          prefix, suffix, useOriginalName, numbered, startAt: 1,
        });
        if (usedNames.has(outputName)) {
          outputName = buildBatchFilename(item.file.name, index, outputExtension(format), {
            prefix, suffix, useOriginalName, numbered: true, startAt: 1,
          });
        }
        usedNames.add(outputName);
        setItems((current) => current.map((entry) => entry.id === item.id ? {
          ...entry,
          status: "pronto",
          output: transformed.blob,
          outputName,
          sourceWidth: transformed.sourceWidth,
          sourceHeight: transformed.sourceHeight,
          width: transformed.width,
          height: transformed.height,
        } : entry));
      } catch (cause) {
        setItems((current) => current.map((entry) => entry.id === item.id ? {
          ...entry,
          status: "erro",
          error: cause instanceof Error ? cause.message : "Falha ao processar.",
        } : entry));
      }
      setProgress(index + 1);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    setBusy(false);
  }

  async function downloadAll() {
    const ready = items.filter((item) => item.output && item.outputName);
    if (!ready.length) return;
    setMessage("Preparando ZIP local...");
    const { zipSync } = await import("fflate");
    const entries: Record<string, Uint8Array> = {};
    for (const item of ready) entries[item.outputName as string] = new Uint8Array(await (item.output as Blob).arrayBuffer());
    const zipped = zipSync(entries, { level: 0 });
    downloadBlob(new Blob([zipped as BlobPart], { type: "application/zip" }), "noclipcode-imagens.zip");
    setMessage("ZIP gerado localmente.");
  }

  const readyCount = items.filter((item) => item.status === "pronto").length;

  return (
    <ToolPage title="Processar imagens em lote" description="Converta, comprima, redimensione e renomeie várias imagens em uma única operação.">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FileDropzone
                accept="image/png,image/jpeg,image/webp"
                multiple
                label="Solte PNG, JPEG ou WebP"
                hint="Até 30 imagens · 25 MB cada · 250 MB por lote"
                onFiles={choose}
              />
              {message && <p role="status" className="mt-3 text-sm text-amber-300">{message}</p>}
            </CardContent>
          </Card>

          {items.length > 0 && <Card>
            <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="text-lg">{items.length} arquivos</CardTitle><span className="text-sm text-muted-foreground">{busy ? `${progress} processados` : `${readyCount} prontos`}</span></div></CardHeader>
            <CardContent className="space-y-3">
              {busy && <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${progressTotal ? progress / progressTotal * 100 : 0}%` }} /></div>}
              {items.map((item) => {
                const saving = item.output ? (1 - item.output.size / item.file.size) * 100 : null;
                return <div key={item.id} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sourceWidth ? `${item.sourceWidth}×${item.sourceHeight} · ` : ""}{formatBytes(item.file.size)}</p>
                    {item.output && <p className="mt-2 text-sm text-primary">→ {item.outputName} · {item.width}×{item.height} · {formatBytes(item.output.size)} {saving !== null && saving > 0 ? `· -${saving.toFixed(1)}%` : ""}</p>}
                    {item.error && <p className="mt-2 text-sm text-destructive">{item.error}</p>}
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{item.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.output && <Button variant="outline" size="sm" onClick={() => downloadBlob(item.output as Blob, item.outputName as string)}><Download />Baixar</Button>}
                    <Button aria-label={`Remover ${item.file.name}`} variant="ghost" size="icon" disabled={busy} onClick={() => remove(item.id)}><Trash2 /></Button>
                  </div>
                </div>;
              })}
            </CardContent>
          </Card>}
        </div>

        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader><CardTitle className="text-lg">Configuração comum</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <label className="block text-sm">Formato
              <select value={format} onChange={(event) => setFormat(event.target.value as OutputImageType)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3">
                <option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option>
              </select>
            </label>
            {format !== "image/png" && <label className="block text-sm">Qualidade: {quality}%<input className="mt-2 w-full accent-[hsl(var(--primary))]" type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>}
            <label className="block text-sm">Redimensionamento
              <select value={resizeMode} onChange={(event) => setResizeMode(event.target.value as ResizeMode)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3">
                <option value="original">Manter dimensões</option><option value="max">Limites máximos</option><option value="fixed">Dimensões definidas</option>
              </select>
            </label>
            {resizeMode !== "original" && <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Largura<input className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3" type="number" min="1" max={BATCH_IMAGE_LIMITS.maxDimension} value={width} onChange={(event) => setWidth(event.target.value)} /></label>
              <label className="text-sm">Altura<input className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3" type="number" min="1" max={BATCH_IMAGE_LIMITS.maxDimension} value={height} onChange={(event) => setHeight(event.target.value)} /></label>
            </div>}
            {resizeMode === "fixed" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preserveRatio} onChange={(event) => setPreserveRatio(event.target.checked)} />Preservar proporção</label>}
            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium">Renomeação</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs">Prefixo<input className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label>
                <label className="text-xs">Sufixo<input className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2" value={suffix} onChange={(event) => setSuffix(event.target.value)} /></label>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useOriginalName} onChange={(event) => setUseOriginalName(event.target.checked)} />Usar nome original</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={numbered} onChange={(event) => setNumbered(event.target.checked)} />Adicionar numeração</label>
            </div>
            <Button className="w-full" disabled={!items.length || busy} onClick={processAll}>{busy ? <LoaderCircle className="animate-spin" /> : <Images />}Processar lote</Button>
            {busy && <Button className="w-full" variant="destructive" onClick={() => { cancelled.current = true; }}><Square />Cancelar após esta imagem</Button>}
            <Button className="w-full" variant="outline" disabled={!readyCount || busy} onClick={downloadAll}><Package />Baixar tudo em ZIP</Button>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
