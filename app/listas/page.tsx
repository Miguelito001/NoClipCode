"use client";

import { useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, Copy, Eraser, FlipVertical2, Shuffle, ListFilter } from "lucide-react";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { transformLines, type ListOperation } from "@/lib/list-tools";

const operations: { id: ListOperation; label: string; icon: typeof ListFilter }[] = [
  { id: "clean", label: "Limpar", icon: Eraser }, { id: "unique", label: "Remover duplicadas", icon: ListFilter },
  { id: "sort", label: "Ordenar A–Z", icon: ArrowDownAZ }, { id: "sort-desc", label: "Ordenar Z–A", icon: ArrowUpAZ },
  { id: "reverse", label: "Inverter", icon: FlipVertical2 }, { id: "shuffle", label: "Embaralhar", icon: Shuffle },
];

export default function ListsPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [copied, setCopied] = useState(false);
  function run(operation: ListOperation) { setOutput(transformLines(input, operation, caseSensitive)); }
  async function copy() { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  const inputCount = input ? input.split(/\r?\n/).length : 0;
  const outputCount = output ? output.split(/\r?\n/).length : 0;

  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 p-4 md:p-8"><div className="container max-w-screen-xl mx-auto">
    <div className="mb-8 flex items-start justify-between gap-4"><div><h1 className="mb-2 text-3xl font-bold">Limpar e ordenar listas</h1><p className="text-muted-foreground">Organize linhas, remova duplicadas e limpe dados colados de planilhas ou logs.</p></div><ShareButton /></div>
    <div className="mb-4 flex flex-wrap gap-2">{operations.map(({ id, label, icon: Icon }) => <Button key={id} variant="outline" disabled={!input} onClick={() => run(id)}><Icon />{label}</Button>)}<label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-[hsl(var(--primary))]" />Diferenciar maiúsculas</label></div>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Entrada <span className="text-xs font-normal text-muted-foreground">{inputCount} linhas</span></CardTitle></CardHeader><CardContent><Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={'Cole uma lista, um item por linha...'} className="min-h-[360px]" /></CardContent></Card><Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">Resultado <span className="text-xs font-normal text-muted-foreground">{outputCount} linhas</span></CardTitle><Button variant="ghost" size="sm" disabled={!output} onClick={copy}>{copied ? <Check className="text-primary" /> : <Copy />}{copied ? "Copiado" : "Copiar"}</Button></div></CardHeader><CardContent><Textarea value={output} readOnly placeholder="Escolha uma operação..." className="min-h-[360px]" /></CardContent></Card></div>
  </div></main></div>;
}
