"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scaling } from "lucide-react";

const commonPx = [8, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];
const rounded = (value: number) => String(+value.toFixed(4));

export default function PxRemPage() {
  const [rootBase, setRootBase] = useState(16);
  const [contextBase, setContextBase] = useState(16);
  const [px, setPx] = useState("16");
  const [rem, setRem] = useState("1");
  const [em, setEm] = useState("1");

  function updateFromPx(value: string) {
    setPx(value); const numeric = Number(value);
    if (Number.isFinite(numeric)) { if (rootBase > 0) setRem(rounded(numeric / rootBase)); if (contextBase > 0) setEm(rounded(numeric / contextBase)); }
  }
  function updateFromRem(value: string) {
    setRem(value); const numeric = Number(value);
    if (Number.isFinite(numeric)) { const pixels = numeric * rootBase; setPx(rounded(pixels)); if (contextBase > 0) setEm(rounded(pixels / contextBase)); }
  }
  function updateFromEm(value: string) {
    setEm(value); const numeric = Number(value);
    if (Number.isFinite(numeric)) { const pixels = numeric * contextBase; setPx(rounded(pixels)); if (rootBase > 0) setRem(rounded(pixels / rootBase)); }
  }
  function updateRoot(value: string) {
    const base = Number(value); setRootBase(base);
    const pixels = Number(px); if (base > 0 && Number.isFinite(pixels)) setRem(rounded(pixels / base));
  }
  function updateContext(value: string) {
    const base = Number(value); setContextBase(base);
    const pixels = Number(px); if (base > 0 && Number.isFinite(pixels)) setEm(rounded(pixels / base));
  }
  const table = useMemo(() => commonPx.map((value) => ({ px: value, rem: rootBase > 0 ? rounded(value / rootBase) : "—", em: contextBase > 0 ? rounded(value / contextBase) : "—" })), [rootBase, contextBase]);
  const field = "w-full h-10 rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary/50";

  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 p-4 md:p-8"><div className="container max-w-screen-md mx-auto">
    <div className="mb-8"><div className="flex items-center gap-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"><Scaling className="h-5 w-5 text-pink-400" /></div><h1 className="text-3xl font-bold">PX ⇄ REM ⇄ EM</h1></div><p className="text-muted-foreground">REM usa o tamanho da raiz; EM usa o contexto do elemento. As duas bases são independentes.</p></div>
    <Card className="mb-6"><CardHeader className="pb-3"><CardTitle className="text-lg">Bases CSS</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-muted-foreground">Raiz para REM (px)<input type="number" min="0.01" value={rootBase} onChange={(event) => updateRoot(event.target.value)} className={`${field} mt-1.5`} /></label>
      <label className="text-sm text-muted-foreground">Contexto para EM (px)<input type="number" min="0.01" value={contextBase} onChange={(event) => updateContext(event.target.value)} className={`${field} mt-1.5`} /></label>
    </CardContent></Card>
    <Card className="mb-6"><CardHeader className="pb-3"><CardTitle className="text-lg">Conversor</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3">
      <label className="text-sm text-muted-foreground">Pixels<input type="number" value={px} onChange={(event) => updateFromPx(event.target.value)} className={`${field} mt-1.5`} /></label>
      <label className="text-sm text-muted-foreground">REM<input type="number" value={rem} onChange={(event) => updateFromRem(event.target.value)} className={`${field} mt-1.5`} /></label>
      <label className="text-sm text-muted-foreground">EM<input type="number" value={em} onChange={(event) => updateFromEm(event.target.value)} className={`${field} mt-1.5`} /></label>
    </CardContent></Card>
    <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Tabela de referência</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{table.map((row) => <div key={row.px} className="grid grid-cols-3 rounded-md bg-secondary/40 border border-border px-3 py-2 font-mono text-sm"><span>{row.px}px</span><span className="text-muted-foreground">{row.rem}rem</span><span className="text-muted-foreground">{row.em}em</span></div>)}</div></CardContent></Card>
  </div></main></div>;
}
