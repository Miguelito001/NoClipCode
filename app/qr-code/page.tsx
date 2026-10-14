"use client";

import { useState } from "react";
import { Check, Copy, Download, LoaderCircle, QrCode } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { downloadBlob, MAX_LOCAL_FILE_SIZE } from "@/lib/files";

export default function QrCodePage() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [decoded, setDecoded] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!text.trim()) return setError("Digite um texto ou URL para gerar o QR Code.");
    if (new Blob([text]).size > 2_000) return setError("O conteúdo deve ter no máximo 2 KB.");
    setBusy(true); setError("");
    try {
      const QRCode = await import("qrcode");
      setQrUrl(await QRCode.toDataURL(text, { width: 768, margin: 3, errorCorrectionLevel: "M", color: { dark: "#090906", light: "#ffffff" } }));
    } catch { setError("Não foi possível gerar o QR Code."); }
    finally { setBusy(false); }
  }

  async function read(files: File[]) {
    const file = files[0];
    if (!file?.type.startsWith("image/") || file.size > MAX_LOCAL_FILE_SIZE) return setError("Escolha uma imagem de até 100 MB.");
    setBusy(true); setError(""); setDecoded("");
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 2000;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error();
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (await import("jsqr")).default;
      const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" });
      if (!result) throw new Error("Nenhum QR Code legível foi encontrado na imagem.");
      setDecoded(result.data);
    } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : "Não foi possível ler esta imagem."); }
    finally { setBusy(false); }
  }

  async function copy() {
    await navigator.clipboard.writeText(decoded);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  async function download() {
    const response = await fetch(qrUrl);
    downloadBlob(await response.blob(), "noclipcode-qr.png");
  }

  return (
    <ToolPage title="Gerar e ler QR Code" description="Crie um QR Code ou extraia o conteúdo de uma imagem, sem enviar dados para servidores.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Gerar QR Code</CardTitle></CardHeader><CardContent className="space-y-4">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole uma URL, texto, Wi-Fi ou outro conteúdo..." className="min-h-32" maxLength={2000} />
          <Button className="w-full" disabled={busy || !text.trim()} onClick={generate}>{busy ? <LoaderCircle className="animate-spin" /> : <QrCode />}Gerar</Button>
          {qrUrl && <div className="rounded-lg border border-border bg-white p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code gerado" className="mx-auto h-64 w-64 max-w-full" />
            <Button variant="outline" className="mt-3 text-black" onClick={download}><Download />Baixar PNG</Button>
          </div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Ler QR Code</CardTitle></CardHeader><CardContent className="space-y-4">
          <FileDropzone accept="image/*" label="Solte uma imagem com QR Code" hint="PNG, JPEG, WebP ou captura de tela" onFiles={read} />
          {decoded && <div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><p className="mb-2 text-xs text-muted-foreground">Conteúdo encontrado</p><p className="break-all text-sm">{decoded}</p><Button variant="outline" className="mt-3 w-full" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copiado" : "Copiar"}</Button></div>}
          {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
        </CardContent></Card>
      </div>
    </ToolPage>
  );
}
