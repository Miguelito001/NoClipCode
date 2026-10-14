"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, Hash } from "lucide-react";
import { FileHashCard } from "@/components/file-hash-card";

type HashResult = {
  algorithm: string;
  hash: string;
};

export default function HashPage() {
  const [input, setInput] = useUrlState("q", "");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateHashes = async () => {
    if (!input.trim()) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    const { md5 } = await import("hash-wasm");
    const results: HashResult[] = [{ algorithm: "MD5", hash: await md5(input) }];

    for (const algorithm of algorithms) {
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      results.push({ algorithm, hash: hashHex });
    }

    setHashes(results);
  };

  const copyToClipboard = async (hash: string, index: number) => {
    await navigator.clipboard.writeText(hash);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gerador de Hash
              </h1>
              <p className="text-muted-foreground">
                Gere hashes criptográficos para qualquer texto
              </p>
            </div>
            <ShareButton />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Texto de Entrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite o texto para gerar os hashes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button onClick={generateHashes} className="w-full gap-2">
                  <Hash className="h-4 w-4" />
                  Gerar Hashes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Hashes Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                {hashes.length > 0 ? (
                  <div className="space-y-4">
                    {hashes.map((result, index) => (
                      <div key={result.algorithm} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {result.algorithm}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.hash, index)}
                            className="h-8 px-2"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg font-mono text-xs break-all text-foreground">
                          {result.hash}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Os hashes aparecerão aqui
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <FileHashCard />
        </div>
      </main>
    </div>
  );
}
