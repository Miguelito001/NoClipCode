"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { convertStructuredData, type DataFormat } from "@/lib/data-converter";

type Format = DataFormat;

export default function ConverterPage() {
  const [input, setInput] = useUrlState("q", "");
  const [output, setOutput] = useState("");
  const [inputFormat, setInputFormat] = useState<Format>("json");
  const [outputFormat, setOutputFormat] = useState<Format>("yaml");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [converting, setConverting] = useState(false);

  const formats: { value: Format; label: string }[] = [
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
  ];

  const convert = async () => {
    setError("");
    setConverting(true);
    try {
      setOutput(await convertStructuredData(input, inputFormat, outputFormat));
    } catch (e) {
      setError(`Erro ao converter: ${e instanceof Error ? e.message : "formato inválido"}`);
      setOutput("");
    } finally {
      setConverting(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Conversor de Dados
              </h1>
              <p className="text-muted-foreground">
                Converta entre JSON, XML e YAML
              </p>
            </div>
            <ShareButton />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Entrada</CardTitle>
                  <div className="flex gap-1">
                    {formats.map((format) => (
                      <Button
                        key={format.value}
                        variant={inputFormat === format.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setInputFormat(format.value)}
                        className={cn(
                          "text-xs",
                          inputFormat === format.value && "bg-primary"
                        )}
                      >
                        {format.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={`Cole seu ${inputFormat.toUpperCase()} aqui...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Saída</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {formats.map((format) => (
                        <Button
                          key={format.value}
                          variant={outputFormat === format.value ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setOutputFormat(format.value)}
                          className={cn(
                            "text-xs",
                            outputFormat === format.value && "bg-primary"
                          )}
                        >
                          {format.label}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      disabled={!output}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="O resultado aparecerá aqui..."
                  value={error || output}
                  readOnly
                  className={cn("min-h-[300px]", error && "text-destructive")}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={convert} disabled={converting} className="gap-2">
              {converting ? "Convertendo..." : "Converter"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
