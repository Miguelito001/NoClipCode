"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { curlToAxios, curlToFetch, curlToPython, parseCurl } from "@/lib/curl-parser";
import { AlertTriangle, Check, Copy, TerminalSquare, Trash2 } from "lucide-react";

const languages = [
  { key: "fetch", label: "JS (fetch)", convert: curlToFetch },
  { key: "axios", label: "Axios", convert: curlToAxios },
  { key: "python", label: "Python", convert: curlToPython },
] as const;

export default function CurlPage() {
  const [input, setInput] = useUrlState("q", "");
  const [language, setLanguage] = useState<(typeof languages)[number]["key"]>("fetch");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const request = parseCurl(input);
      return { output: languages.find((item) => item.key === language)!.convert(request), error: "" };
    } catch (error) {
      return { output: "", error: error instanceof Error ? error.message : "Comando cURL inválido." };
    }
  }, [input, language]);

  async function copy() {
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 p-4 md:p-8"><div className="container max-w-screen-xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div><div className="flex items-center gap-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"><TerminalSquare className="h-5 w-5 text-green-400" /></div><h1 className="text-3xl font-bold">cURL para Código</h1></div>
          <p className="text-muted-foreground">Converta comandos cURL completos, incluindo headers, autenticação, cookies, múltiplos dados e formulários.</p></div>
        <ShareButton />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-lg">Comando cURL</CardTitle><Button variant="ghost" size="icon" onClick={() => setInput("")} title="Limpar"><Trash2 className="h-4 w-4" /></Button></div></CardHeader>
          <CardContent><Textarea placeholder={'curl -X POST https://api.exemplo.com/users \\\n  -H "Content-Type: application/json" \\\n  -d \'{"nome":"Maria"}\''} value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[320px] font-mono text-sm" /></CardContent></Card>
        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-2"><div className="flex gap-1 flex-wrap">{languages.map((item) => <button key={item.key} onClick={() => setLanguage(item.key)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${language === item.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>{item.label}</button>)}</div>
          <Button variant="ghost" size="icon" onClick={copy} disabled={!result.output} title="Copiar">{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}</Button></div></CardHeader>
          <CardContent><Textarea placeholder="O código gerado aparecerá aqui..." value={result.error || result.output} readOnly className={`min-h-[320px] font-mono text-sm ${result.error ? "text-destructive" : ""}`} />{result.error && <div className="mt-3 flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{result.error}</div>}</CardContent></Card>
      </div>
    </div></main>
  </div>;
}
