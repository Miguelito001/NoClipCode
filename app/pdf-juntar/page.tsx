"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Download, LoaderCircle, Trash2 } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadBlob, formatBytes, MAX_LOCAL_FILE_SIZE } from "@/lib/files";

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addFiles(next: File[]) {
    const invalid = next.find((file) => file.type !== "application/pdf" || file.size > MAX_LOCAL_FILE_SIZE);
    if (invalid) return setError("Use apenas PDFs de até 100 MB por arquivo.");
    setError("");
    setFiles((current) => [...current, ...next].slice(0, 20));
  }

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= files.length) return;
    setFiles((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function merge() {
    if (files.length < 2) return;
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const output = await PDFDocument.create();
      for (const file of files) {
        const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
        const pages = await output.copyPages(source, source.getPageIndices());
        pages.forEach((page) => output.addPage(page));
      }
      output.setProducer("NoClipCode");
      const bytes = Uint8Array.from(await output.save());
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), "noclipcode-pdfs-unidos.pdf");
    } catch {
      setError("Não foi possível juntar os arquivos. PDFs protegidos por senha não são suportados.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage title="Juntar PDFs" description="Combine PDFs na ordem desejada e baixe um único arquivo.">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <Card><CardHeader><CardTitle className="text-lg">Adicionar arquivos</CardTitle></CardHeader><CardContent><FileDropzone accept="application/pdf" multiple label="Solte seus PDFs ou clique para escolher" hint="Até 20 arquivos · 100 MB por arquivo" onFiles={addFiles} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Ordem dos PDFs</CardTitle></CardHeader><CardContent className="space-y-3">
          {files.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Adicione pelo menos dois PDFs.</p> : files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-lg border border-border p-3"><span className="flex h-7 w-7 items-center justify-center rounded bg-secondary text-xs">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm">{file.name}</p><p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p></div><Button aria-label="Mover para cima" variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button><Button aria-label="Mover para baixo" variant="ghost" size="icon" disabled={index === files.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button><Button aria-label="Remover arquivo" variant="ghost" size="icon" onClick={() => setFiles((current) => current.filter((_, item) => item !== index))}><Trash2 /></Button></div>)}
          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
          <Button className="w-full" disabled={files.length < 2 || busy} onClick={merge}>{busy ? <LoaderCircle className="animate-spin" /> : <Download />}Juntar e baixar</Button>
        </CardContent></Card>
      </div>
    </ToolPage>
  );
}
