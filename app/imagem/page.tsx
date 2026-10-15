"use client";

import { useEffect, useState } from "react";
import { Download, ImageIcon, LoaderCircle, X } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadBlob, formatBytes, MAX_LOCAL_FILE_SIZE, replaceExtension } from "@/lib/files";
import { transformImage, type OutputImageType } from "@/lib/batch-images";

export default function ImageToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [format, setFormat] = useState<OutputImageType>("image/webp");
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [aspectRatio, setAspectRatio] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [preview, resultUrl]);

  async function choose(files: File[]) {
    const next = files[0];
    setError("");
    if (!next?.type.startsWith("image/")) return setError("Escolha uma imagem PNG, JPEG ou WebP.");
    if (next.size > MAX_LOCAL_FILE_SIZE) return setError("A imagem deve ter no máximo 100 MB.");
    const bitmap = await createImageBitmap(next);
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setWidth(String(bitmap.width));
    setHeight(String(bitmap.height));
    setAspectRatio(bitmap.width / bitmap.height);
    bitmap.close();
    setResult(null);
  }

  function updateWidth(value: string) {
    setWidth(value);
    const numeric = Number(value);
    if (numeric > 0) setHeight(String(Math.max(1, Math.round(numeric / aspectRatio))));
  }

  function updateHeight(value: string) {
    setHeight(value);
    const numeric = Number(value);
    if (numeric > 0) setWidth(String(Math.max(1, Math.round(numeric * aspectRatio))));
  }

  async function processImage() {
    if (!file) return;
    const outputWidth = Number(width);
    const outputHeight = Number(height);
    if (!Number.isInteger(outputWidth) || !Number.isInteger(outputHeight) || outputWidth < 1 || outputHeight < 1 || outputWidth > 12000 || outputHeight > 12000) {
      return setError("Use dimensões inteiras entre 1 e 12.000 px.");
    }
    setBusy(true);
    setError("");
    try {
      const { blob } = await transformImage(file, format, quality, {
        mode: "fixed",
        width: outputWidth,
        height: outputHeight,
        preserveAspectRatio: false,
      });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResult(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível processar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  const extension = format.split("/")[1].replace("jpeg", "jpg");

  return (
    <ToolPage title="Converter e comprimir imagem" description="Converta PNG, JPEG e WebP, redimensione e remova metadados ao reprocessar.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader><CardTitle className="text-lg">Imagem</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!file ? (
              <FileDropzone accept="image/png,image/jpeg,image/webp" label="Solte uma imagem ou clique para escolher" hint="PNG, JPEG ou WebP · até 100 MB" onFiles={choose} />
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-border bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Prévia da imagem selecionada" className="mx-auto max-h-80 object-contain" />
                  <Button aria-label="Remover imagem" variant="secondary" size="icon" className="absolute right-2 top-2" onClick={() => { setFile(null); setResult(null); }}><X /></Button>
                </div>
                <p className="text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}</p>
              </div>
            )}
            {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Saída</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <label className="block text-sm">Formato
              <select value={format} onChange={(event) => setFormat(event.target.value as OutputImageType)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3">
                <option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Largura (px)<input type="number" min="1" max="12000" value={width} onChange={(e) => updateWidth(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3" /></label>
              <label className="text-sm">Altura (px)<input type="number" min="1" max="12000" value={height} onChange={(e) => updateHeight(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3" /></label>
            </div>
            {format !== "image/png" && <label className="block text-sm">Qualidade: {quality}%<input aria-label="Qualidade" type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" /></label>}
            <Button className="w-full" disabled={!file || busy} onClick={processImage}>{busy ? <LoaderCircle className="animate-spin" /> : <ImageIcon />}Converter imagem</Button>
            {result && <div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><p className="mb-3 text-sm">Pronto · {formatBytes(result.size)} {file && result.size < file.size && <span className="text-emerald-400">({Math.round((1 - result.size / file.size) * 100)}% menor)</span>}</p><Button variant="outline" className="w-full" onClick={() => downloadBlob(result, replaceExtension(file?.name ?? "imagem", extension))}><Download />Baixar {extension.toUpperCase()}</Button></div>}
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
