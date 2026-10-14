"use client";

import { useState } from "react";
import { Check, Copy, Download, FileCode2 } from "lucide-react";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { downloadBlob, formatBytes } from "@/lib/files";

const MAX_BASE64_FILE_SIZE = 20 * 1024 * 1024;

export function Base64FileCard() {
  const [encoded, setEncoded] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  function encode(files: File[]) {
    const file = files[0];
    if (!file || file.size > MAX_BASE64_FILE_SIZE) return setError("Escolha um arquivo de até 20 MB.");
    setError(""); setEncoded(""); setFileLabel(`${file.name} · ${formatBytes(file.size)}`);
    const reader = new FileReader();
    reader.onload = () => setEncoded(String(reader.result));
    reader.onerror = () => setError("Não foi possível ler o arquivo.");
    reader.readAsDataURL(file);
  }

  async function copy() {
    await navigator.clipboard.writeText(encoded);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  function decode() {
    setError("");
    try {
      if (decodeInput.length > 30_000_000) throw new Error("O Base64 deve ter no máximo 30 milhões de caracteres.");
      const match = decodeInput.trim().match(/^data:([^;,]+)?(?:;[^,]*)?;base64,([\s\S]+)$/);
      const mime = match?.[1] || "application/octet-stream";
      const raw = (match?.[2] ?? decodeInput).replace(/\s/g, "");
      const binary = atob(raw);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      downloadBlob(new Blob([bytes], { type: mime }), "noclipcode-decodificado");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Base64 inválido.");
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileCode2 className="h-5 w-5 text-primary" />Base64 de arquivo</CardTitle></CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3"><FileDropzone accept="*/*" label="Converter arquivo em Base64" hint="Gera um Data URL completo · até 20 MB" onFiles={encode} />{fileLabel && <p className="text-xs text-muted-foreground">{fileLabel}</p>}{encoded && <><Textarea aria-label="Arquivo codificado em Base64" value={encoded} readOnly className="min-h-28 text-xs" /><Button variant="outline" className="w-full" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copiado" : "Copiar Data URL"}</Button></>}</div>
        <div className="space-y-3"><Textarea aria-label="Base64 para decodificar como arquivo" value={decodeInput} onChange={(event) => setDecodeInput(event.target.value)} placeholder="Cole Base64 puro ou um data:...;base64,..." className="min-h-44 text-xs" /><Button className="w-full" disabled={!decodeInput.trim()} onClick={decode}><Download />Decodificar e baixar</Button>{error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}</div>
      </CardContent>
    </Card>
  );
}
