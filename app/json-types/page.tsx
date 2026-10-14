"use client";

import { useState } from "react";
import { Check, Copy, FileJson2, WandSparkles } from "lucide-react";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { jsonToTypescript } from "@/lib/json-types";

const example = `{
  "id": 42,
  "name": "Ada",
  "active": true,
  "roles": ["admin", "developer"],
  "profile": { "avatar_url": "https://example.com/avatar.png" }
}`;

export default function JsonTypesPage() {
  const [input, setInput] = useState(""); const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState(""); const [error, setError] = useState(""); const [copied, setCopied] = useState(false);
  function generate() { try { setOutput(jsonToTypescript(input, rootName || "Root")); setError(""); } catch (cause) { setOutput(""); setError(cause instanceof Error ? `JSON inválido: ${cause.message}` : "JSON inválido."); } }
  async function copy() { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 p-4 md:p-8"><div className="container max-w-screen-xl mx-auto">
    <div className="mb-8 flex items-start justify-between gap-4"><div><h1 className="mb-2 text-3xl font-bold">JSON para TypeScript</h1><p className="text-muted-foreground">Transforme uma resposta JSON em interfaces TypeScript prontas para usar.</p></div><ShareButton /></div>
    <div className="mb-4 flex flex-wrap items-end gap-3"><label className="text-sm">Nome do tipo raiz<input value={rootName} onChange={(e) => setRootName(e.target.value)} className="mt-2 block h-10 rounded-md border border-border bg-background px-3" /></label><Button onClick={() => setInput(example)} variant="outline"><FileJson2 />Usar exemplo</Button><Button onClick={generate} disabled={!input.trim()}><WandSparkles />Gerar tipos</Button></div>
    {error && <p role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">JSON</CardTitle></CardHeader><CardContent><Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Cole seu JSON..." className="min-h-[420px] font-mono text-xs" /></CardContent></Card><Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">TypeScript</CardTitle><Button variant="ghost" size="sm" disabled={!output} onClick={copy}>{copied ? <Check className="text-primary" /> : <Copy />}{copied ? "Copiado" : "Copiar"}</Button></div></CardHeader><CardContent><Textarea value={output} readOnly placeholder="As interfaces aparecerão aqui..." className="min-h-[420px] font-mono text-xs" /></CardContent></Card></div>
  </div></main></div>;
}
