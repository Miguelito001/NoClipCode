"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, Regex } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPotentiallyCatastrophic, REGEX_LIMITS, validateRegexInput } from "@/lib/regex-safety";

const FLAGS = [
  { flag: "g", label: "g", title: "Global — encontra todas as ocorrências" },
  { flag: "i", label: "i", title: "Case-insensitive — ignora maiúsculas/minúsculas" },
  { flag: "m", label: "m", title: "Multiline — ^ e $ funcionam por linha" },
  { flag: "s", label: "s", title: "DotAll — . corresponde a qualquer caractere incluindo newline" },
];

const EXAMPLES = [
  { label: "E-mail", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" },
  { label: "CPF", pattern: "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" },
  { label: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&/=]*)" },
  { label: "IP", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Data BR", pattern: "\\d{2}\\/\\d{2}\\/\\d{4}" },
  { label: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})" },
];

type Match = { index: number; end: number; value: string; groups: string[] };

function highlightText(text: string, matches: Match[]): React.ReactNode[] {
  if (!matches.length) return [<span key="full">{text}</span>];

  const nodes: React.ReactNode[] = [];
  let last = 0;

  matches.forEach((m, i) => {
    if (m.index > last) {
      nodes.push(<span key={`plain-${i}`}>{text.slice(last, m.index)}</span>);
    }
    nodes.push(
      <mark
        key={`match-${i}`}
        className="bg-primary/30 text-primary rounded-[2px] border-b border-primary"
        title={`Match ${i + 1}: "${m.value}"`}
      >
        {text.slice(m.index, m.end)}
      </mark>
    );
    last = m.end;
  });

  if (last < text.length) {
    nodes.push(<span key="tail">{text.slice(last)}</span>);
  }

  return nodes;
}

export default function RegexPage() {
  const [pattern, setPattern] = useUrlState("q", "");
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set(["g"]));
  const [testText, setTestText] = useState(
    "Contato: joao@email.com ou maria@empresa.com.br\nCPF: 123.456.789-00\nSite: https://www.exemplo.com.br"
  );
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);
  const [result, setResult] = useState<{ matches: Match[]; error: string; running: boolean }>({ matches: [], error: "", running: false });

  const toggleFlag = (f: string) => {
    setActiveFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  useEffect(() => {
    if (!pattern) { setResult({ matches: [], error: "", running: false }); return; }
    const validation = validateRegexInput(pattern, testText);
    if (validation) { setResult({ matches: [], error: validation, running: false }); return; }
    if (isPotentiallyCatastrophic(pattern)) { setResult({ matches: [], error: "Padrão recusado: quantificadores aninhados podem causar processamento excessivo.", running: false }); return; }
    setResult((previous) => ({ ...previous, error: "", running: true }));
    const worker = new Worker(new URL("./regex.worker.ts", import.meta.url));
    const timeout = window.setTimeout(() => {
      worker.terminate();
      setResult({ matches: [], error: `Execução interrompida após ${REGEX_LIMITS.timeoutMs} ms para proteger a página.`, running: false });
    }, REGEX_LIMITS.timeoutMs);
    worker.onmessage = (event: MessageEvent<{ matches: Match[]; error: string }>) => {
      window.clearTimeout(timeout); worker.terminate(); setResult({ ...event.data, running: false });
    };
    worker.onerror = () => { window.clearTimeout(timeout); worker.terminate(); setResult({ matches: [], error: "Não foi possível executar a expressão.", running: false }); };
    worker.postMessage({ pattern, flags: Array.from(activeFlags).join(""), text: testText });
    return () => { window.clearTimeout(timeout); worker.terminate(); };
  }, [pattern, activeFlags, testText]);

  const { matches, error, running } = result;

  const copyMatch = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedGroup(key);
    setTimeout(() => setCopiedGroup(null), 2000);
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
                  <Regex className="h-5 w-5 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Regex Tester</h1>
              </div>
              <p className="text-muted-foreground">
                Teste expressões regulares com destaque de correspondências em tempo real
              </p>
            </div>
            <ShareButton />
          </div>

          {/* Pattern Input */}
          <Card className="mb-6">
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Padrão (RegEx)</label>
                  <div className={cn(
                    "flex items-center rounded-md border bg-secondary/30 px-3 focus-within:ring-1 focus-within:ring-ring",
                    error ? "border-destructive" : "border-border"
                  )}>
                    <span className="text-muted-foreground mr-1 text-lg">/</span>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Ex: \\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"
                      className="flex-1 bg-transparent py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none"
                      spellCheck={false}
                    />
                    <span className="text-muted-foreground ml-1 text-lg">/</span>
                    <span className="font-mono text-primary ml-1 text-sm min-w-[2rem]">
                      {Array.from(activeFlags).join("")}
                    </span>
                  </div>
                  {error && <p className="text-destructive text-xs mt-1.5 font-mono">{error}</p>}
                  {running && <p className="text-muted-foreground text-xs mt-1.5">Executando em ambiente isolado…</p>}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Flags</label>
                  <div className="flex gap-1">
                    {FLAGS.map(({ flag, label, title }) => (
                      <button
                        key={flag}
                        title={title}
                        onClick={() => toggleFlag(flag)}
                        className={cn(
                          "px-3 py-2.5 rounded-md border text-sm font-mono transition-all",
                          activeFlags.has(flag)
                            ? "bg-primary/10 border-primary/50 text-primary"
                            : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick examples */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs text-muted-foreground self-center">Exemplos:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setPattern(ex.pattern)}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/70 text-muted-foreground hover:text-foreground border border-border transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Test input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Texto de Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  maxLength={REGEX_LIMITS.text}
                  className="min-h-[280px] font-mono text-sm"
                  placeholder="Cole o texto que deseja testar..."
                />
              </CardContent>
            </Card>

            {/* Highlighted output */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Resultado
                    {matches.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-primary">
                        {matches.length} {matches.length === 1 ? "correspondência" : "correspondências"}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[280px] p-3 bg-secondary/30 rounded-md border border-border font-mono text-sm whitespace-pre-wrap break-all leading-relaxed text-foreground">
                  {pattern && !error
                    ? highlightText(testText, matches)
                    : <span className="text-muted-foreground">{testText || "O texto destacado aparecerá aqui..."}</span>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches list */}
          {matches.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Correspondências encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 bg-secondary/40 rounded-lg p-3">
                      <span className="text-xs text-muted-foreground font-mono w-6 text-right flex-shrink-0 pt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-primary break-all">{m.value}</span>
                          <span className="text-xs text-muted-foreground">
                            índice {m.index}–{m.end}
                          </span>
                        </div>
                        {m.groups.length > 0 && m.groups.some(Boolean) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.groups.map((g, gi) =>
                              g !== undefined ? (
                                <span key={gi} className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono">
                                  Grupo {gi + 1}: {g}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => copyMatch(m.value, `m-${i}`)}
                      >
                        {copiedGroup === `m-${i}` ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
