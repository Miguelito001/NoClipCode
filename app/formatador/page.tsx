"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Trash2, Check, Braces, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "json" | "css" | "html";

function formatJSON(code: string): string {
  const parsed = JSON.parse(code);
  return JSON.stringify(parsed, null, 2);
}

function minifyJSON(code: string): string {
  const parsed = JSON.parse(code);
  return JSON.stringify(parsed);
}

function formatCSS(code: string): string {
  const result = code
    .replace(/\s*{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/,\s*/g, ", ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
  return result;
}

function minifyCSS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*,\s*/g, ",")
    .trim();
}

function formatHTML(code: string): string {
  let indent = 0;
  const voidTags = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
  const lines: string[] = [];

  const tokens = code.split(/(<[^>]+>)/g).filter((t) => t.trim());

  for (const token of tokens) {
    const isClosing = /^<\//.test(token);
    const isSelfClosing = /\/>$/.test(token) || voidTags.has((token.match(/<([a-z]+)/i) || [])[1]?.toLowerCase() ?? "");
    const isOpening = /^<[^/]/.test(token) && !isSelfClosing;

    if (isClosing) indent = Math.max(0, indent - 1);
    lines.push("  ".repeat(indent) + token.trim());
    if (isOpening) indent++;
  }

  return lines.join("\n");
}

function minifyHTML(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

const TABS: { id: Language; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "css", label: "CSS" },
  { id: "html", label: "HTML" },
];

export default function FormatadorPage() {
  const [lang, setLang] = useState<Language>("json");
  const [input, setInput] = useUrlState("q", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const process = (action: "format" | "minify") => {
    setError("");
    setOutput("");
    try {
      let result = "";
      if (lang === "json") {
        result = action === "format" ? formatJSON(input) : minifyJSON(input);
      } else if (lang === "css") {
        result = action === "format" ? formatCSS(input) : minifyCSS(input);
      } else {
        result = action === "format" ? formatHTML(input) : minifyHTML(input);
      }
      setOutput(result);
    } catch (e) {
      setError(`Erro ao processar: ${(e as Error).message}`);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const placeholders: Record<Language, string> = {
    json: '{"nome":"João","idade":30,"ativo":true}',
    css: "body{margin:0;padding:0;font-family:sans-serif;} h1{color:red;font-size:2rem;}",
    html: "<html><head><title>Teste</title></head><body><h1>Olá</h1><p>Mundo</p></body></html>",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Braces className="h-5 w-5 text-orange-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Formatador de Código</h1>
              </div>
              <p className="text-muted-foreground">
                Formate ou minifique JSON, CSS e HTML com um clique
              </p>
            </div>
            <ShareButton />
          </div>

          {/* Language Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-6 border border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setLang(tab.id); clearAll(); }}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  lang === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Entrada</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                    {lang.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={`Cole seu código ${lang.toUpperCase()} aqui...\n\nExemplo: ${placeholders[lang]}`}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setOutput(""); setError(""); }}
                  className="min-h-[340px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Saída</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      disabled={!output}
                      title="Copiar resultado"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={clearAll} title="Limpar tudo">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="O resultado aparecerá aqui..."
                  value={error || output}
                  readOnly
                  className={cn(
                    "min-h-[340px] font-mono text-sm",
                    error ? "text-destructive" : ""
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button
              onClick={() => process("format")}
              className="gap-2"
              disabled={!input.trim()}
            >
              <Maximize2 className="h-4 w-4" />
              Formatar (Beautify)
            </Button>
            <Button
              onClick={() => process("minify")}
              variant="outline"
              className="gap-2"
              disabled={!input.trim()}
            >
              <Minimize2 className="h-4 w-4" />
              Minificar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
