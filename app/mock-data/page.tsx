"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, Database, Plus, Trash2, RefreshCw } from "lucide-react";

type FieldType =
  | "uuid"
  | "nome"
  | "email"
  | "inteiro"
  | "decimal"
  | "booleano"
  | "data"
  | "cidade"
  | "telefone"
  | "frase";

interface Field {
  name: string;
  type: FieldType;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "uuid", label: "UUID" },
  { value: "nome", label: "Nome" },
  { value: "email", label: "E-mail" },
  { value: "inteiro", label: "Inteiro" },
  { value: "decimal", label: "Decimal" },
  { value: "booleano", label: "Booleano" },
  { value: "data", label: "Data" },
  { value: "cidade", label: "Cidade" },
  { value: "telefone", label: "Telefone" },
  { value: "frase", label: "Frase" },
];

const PRIMEIROS = ["Ana", "Bruno", "Carla", "Diego", "Elena", "Felipe", "Gabriela", "Hugo", "Isabela", "João", "Karina", "Lucas", "Marina", "Nina", "Otávio", "Paula", "Rafael", "Sofia", "Tiago", "Vera"];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira", "Rodrigues", "Lima"];
const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Curitiba", "Recife", "Salvador", "Fortaleza", "Brasília", "Manaus"];
const PALAVRAS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "tempor", "magna", "aliqua"];

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateValue(type: FieldType): string | number | boolean {
  switch (type) {
    case "uuid":
      return uuid();
    case "nome":
      return `${pick(PRIMEIROS)} ${pick(SOBRENOMES)}`;
    case "email":
      return `${pick(PRIMEIROS).toLowerCase()}.${pick(SOBRENOMES).toLowerCase()}@exemplo.com`;
    case "inteiro":
      return Math.floor(Math.random() * 1000);
    case "decimal":
      return Math.round(Math.random() * 100000) / 100;
    case "booleano":
      return Math.random() > 0.5;
    case "data": {
      const start = new Date(2020, 0, 1).getTime();
      const end = Date.now();
      return new Date(start + Math.random() * (end - start)).toISOString().slice(0, 10);
    }
    case "cidade":
      return pick(CIDADES);
    case "telefone":
      return `(${Math.floor(Math.random() * 89) + 11}) 9${Math.floor(
        Math.random() * 9000 + 1000
      )}-${Math.floor(Math.random() * 9000 + 1000)}`;
    case "frase":
      return Array.from({ length: 6 }, () => pick(PALAVRAS)).join(" ");
    default:
      return "";
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export default function MockDataPage() {
  // Config de campos salva na URL como JSON.
  const [fieldsRaw, setFieldsRaw] = useUrlState(
    "fields",
    JSON.stringify([
      { name: "id", type: "uuid" },
      { name: "nome", type: "nome" },
      { name: "email", type: "email" },
      { name: "idade", type: "inteiro" },
    ])
  );
  const [countRaw, setCountRaw] = useUrlState("count", "5");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const fields: Field[] = useMemo(() => {
    try {
      const parsed = JSON.parse(fieldsRaw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignora
    }
    return [];
  }, [fieldsRaw]);

  const count = Math.min(Math.max(Number(countRaw) || 1, 1), 1000);

  const updateFields = (next: Field[]) => setFieldsRaw(JSON.stringify(next));

  const addField = () =>
    updateFields([...fields, { name: `campo${fields.length + 1}`, type: "frase" }]);

  const removeField = (i: number) => updateFields(fields.filter((_, idx) => idx !== i));

  const updateField = (i: number, patch: Partial<Field>) =>
    updateFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const output = useMemo(() => {
    void seed; // recalcula quando "Regenerar" é clicado
    if (!fields.length) return "";
    const rows = Array.from({ length: count }, () => {
      const row: Record<string, unknown> = {};
      for (const f of fields) {
        if (f.name) row[f.name] = generateValue(f.type);
      }
      return row;
    });
    return format === "json" ? JSON.stringify(rows, null, 2) : toCsv(rows);
  }, [fields, count, format, seed]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-2xl mx-auto">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Database className="h-5 w-5 text-lime-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Gerador de Mock Data</h1>
              </div>
              <p className="text-muted-foreground">
                Defina os campos e gere dados falsos em JSON ou CSV para testes.
              </p>
            </div>
            <ShareButton />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            {/* Configuração */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Campos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => updateField(i, { name: e.target.value })}
                      placeholder="nome do campo"
                      className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <select
                      value={f.type}
                      onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                      className="rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(i)}
                      title="Remover campo"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="w-full" onClick={addField}>
                  <Plus className="h-4 w-4" />
                  Adicionar campo
                </Button>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-sm text-muted-foreground">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={countRaw}
                    onChange={(e) => setCountRaw(e.target.value)}
                    className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Saída */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
                  {(["json", "csv"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        format === fmt
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
                    <RefreshCw className="h-4 w-4" />
                    Regenerar
                  </Button>
                  <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-primary" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[520px] overflow-auto rounded-lg bg-secondary/40 border border-border p-4 font-mono text-sm text-foreground">
                  {output || "Adicione ao menos um campo para gerar dados."}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
