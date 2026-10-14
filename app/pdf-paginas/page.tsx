"use client";

import { useState } from "react";
import { Download, LoaderCircle, RotateCw } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadBlob, formatBytes, MAX_LOCAL_FILE_SIZE } from "@/lib/files";
import { parsePageRanges } from "@/lib/pdf";

export default function PdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function choose(files: File[]) {
    const next = files[0];
    if (!next || next.type !== "application/pdf" || next.size > MAX_LOCAL_FILE_SIZE) return setError("Escolha um PDF de até 100 MB.");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const document = await PDFDocument.load(await next.arrayBuffer(), { ignoreEncryption: false });
      setFile(next); setPageCount(document.getPageCount()); setRanges(""); setError("");
    } catch { setError("Não foi possível abrir o PDF. Arquivos protegidos por senha não são suportados."); }
  }

  async function exportPages() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const { degrees, PDFDocument } = await import("pdf-lib");
      const indexes = parsePageRanges(ranges, pageCount);
      const source = await PDFDocument.load(await file.arrayBuffer());
      const output = await PDFDocument.create();
      const pages = await output.copyPages(source, indexes);
      pages.forEach((page) => {
        if (rotation) page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
        output.addPage(page);
      });
      output.setProducer("NoClipCode");
      const bytes = Uint8Array.from(await output.save());
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), "noclipcode-paginas.pdf");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível processar o PDF."); }
    finally { setBusy(false); }
  }

  return (
    <ToolPage title="Extrair e girar páginas PDF" description="Selecione páginas, remova as demais e aplique rotação em uma única operação.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">PDF de entrada</CardTitle></CardHeader><CardContent className="space-y-4"><FileDropzone accept="application/pdf" label="Solte um PDF ou clique para escolher" hint="Até 100 MB" onFiles={choose} />{file && <div className="rounded-lg border border-border p-3"><p className="truncate text-sm">{file.name}</p><p className="text-xs text-muted-foreground">{pageCount} páginas · {formatBytes(file.size)}</p></div>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Páginas de saída</CardTitle></CardHeader><CardContent className="space-y-5">
          <label className="block text-sm">Páginas ou intervalos<input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder={pageCount ? `Ex.: 1-3, 5, ${pageCount}` : "Ex.: 1-3, 5"} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3" /><span className="mt-1 block text-xs text-muted-foreground">Deixe vazio para manter todas. A ordem informada é preservada.</span></label>
          <fieldset><legend className="mb-2 text-sm">Rotação</legend><div className="grid grid-cols-4 gap-2">{[0, 90, 180, 270].map((value) => <Button key={value} variant={rotation === value ? "default" : "outline"} onClick={() => setRotation(value)}>{value ? <RotateCw /> : null}{value}°</Button>)}</div></fieldset>
          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
          <Button className="w-full" disabled={!file || busy} onClick={exportPages}>{busy ? <LoaderCircle className="animate-spin" /> : <Download />}Gerar e baixar PDF</Button>
        </CardContent></Card>
      </div>
    </ToolPage>
  );
}
