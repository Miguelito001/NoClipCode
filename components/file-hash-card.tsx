"use client";

import { useState } from "react";
import { Check, Copy, FileCheck2, LoaderCircle } from "lucide-react";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, MAX_LOCAL_FILE_SIZE } from "@/lib/files";

type FileHash = { algorithm: string; value: string };

export function FileHashCard() {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<FileHash[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  async function calculate(files: File[]) {
    const next = files[0];
    if (!next || next.size > MAX_LOCAL_FILE_SIZE) return setError("Escolha um arquivo de até 100 MB.");
    setFile(next); setHashes([]); setError(""); setBusy(true);
    try {
      const { createCRC32, createMD5, createSHA1, createSHA256, createSHA512 } = await import("hash-wasm");
      const instances = await Promise.all([createCRC32(), createMD5(), createSHA1(), createSHA256(), createSHA512()]);
      const reader = next.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        instances.forEach((hash) => hash.update(value));
      }
      setHashes(["CRC32", "MD5", "SHA-1", "SHA-256", "SHA-512"].map((algorithm, index) => ({ algorithm, value: instances[index].digest() })));
    } catch { setError("Não foi possível calcular os checksums deste arquivo."); }
    finally { setBusy(false); }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value); setTimeout(() => setCopied(""), 1500);
  }

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileCheck2 className="h-5 w-5 text-primary" />Checksum de arquivo</CardTitle></CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <FileDropzone accept="*/*" label="Solte qualquer arquivo para calcular" hint="Leitura incremental local · até 100 MB" onFiles={calculate} />
          {file && <p className="text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}</p>}
          {busy && <p className="flex items-center gap-2 text-sm text-primary"><LoaderCircle className="h-4 w-4 animate-spin" />Calculando checksums...</p>}
          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
        </div>
        <div className="space-y-3">
          {hashes.length ? hashes.map((hash) => <div key={hash.algorithm} className="rounded-lg border border-border p-3"><div className="mb-1 flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{hash.algorithm}</span><Button aria-label={`Copiar ${hash.algorithm}`} variant="ghost" size="icon" onClick={() => copy(hash.value)}>{copied === hash.value ? <Check className="text-primary" /> : <Copy />}</Button></div><code className="block break-all text-xs">{hash.value}</code></div>) : <p className="flex min-h-44 items-center justify-center text-center text-sm text-muted-foreground">Os checksums aparecerão aqui.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
