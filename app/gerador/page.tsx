"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, RefreshCw, Shuffle, KeyRound, Palette, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSecurePassword, generateSecureUUID } from "@/lib/secure-random";

// ─── UUID v4 ─────────────────────────────────────────────
const generateUUID = generateSecureUUID;

// ─── Password ─────────────────────────────────────────────
function generatePassword(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  const sets = [
    opts.upper && "uppercase",
    opts.lower && "lowercase",
    opts.numbers && "numbers",
    opts.symbols && "symbols",
  ].filter(Boolean) as Array<"uppercase" | "lowercase" | "numbers" | "symbols">;
  return generateSecurePassword(opts.length, sets);
}

// ─── Color ────────────────────────────────────────────────
function generateColor(): { hex: string; rgb: string; hsl: string } {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
  };
}

type CopiedKey = string | null;

function CopyButton({ value, id, copiedKey, onCopy }: { value: string; id: string; copiedKey: CopiedKey; onCopy: (id: string, value: string) => void }) {
  return (
    <button
      onClick={() => onCopy(id, value)}
      className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      title="Copiar"
    >
      {copiedKey === id ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

export default function GeradorPage() {
  // UUID
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, generateUUID));
  const [uuidCount, setUuidCount] = useState(5);

  // Password
  const [passwords, setPasswords] = useState<string[]>(() => [generatePassword({ length: 16, upper: true, lower: true, numbers: true, symbols: false })]);
  const [pwOpts, setPwOpts] = useState({ length: 16, upper: true, lower: true, numbers: true, symbols: false });

  // Colors
  const [colors, setColors] = useState<ReturnType<typeof generateColor>[]>(() => Array.from({ length: 5 }, generateColor));

  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);

  const handleCopy = useCallback(async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const regenUUIDs = () => setUuids(Array.from({ length: uuidCount }, generateUUID));
  const regenPasswords = () => setPasswords([generatePassword(pwOpts)]);
  const regenColors = () => setColors(Array.from({ length: 5 }, generateColor));

  const togglePwOpt = (key: keyof typeof pwOpts) => {
    if (typeof pwOpts[key] === "boolean") {
      setPwOpts((p) => {
        const active = [p.upper, p.lower, p.numbers, p.symbols].filter(Boolean).length;
        if (p[key] && active === 1) return p;
        return { ...p, [key]: !p[key] };
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Shuffle className="h-5 w-5 text-pink-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Gerador</h1>
            </div>
            <p className="text-muted-foreground">
              Gere UUIDs, senhas seguras e cores aleatórias instantaneamente
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* UUID */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-blue-400" />
                    <CardTitle className="text-base">UUID v4</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={regenUUIDs} title="Gerar novos">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">Quantidade:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                    className="w-16 bg-secondary border border-border rounded-md px-2 py-1 text-sm text-foreground text-center"
                  />
                </div>
                <div className="space-y-2">
                  {uuids.map((uuid, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                      <span className="font-mono text-xs text-foreground truncate">{uuid}</span>
                      <CopyButton value={uuid} id={`uuid-${i}`} copiedKey={copiedKey} onCopy={handleCopy} />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full gap-2 mt-1" onClick={regenUUIDs}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Gerar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground text-xs"
                  onClick={() => handleCopy("uuid-all", uuids.join("\n"))}
                >
                  {copiedKey === "uuid-all" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  Copiar todos
                </Button>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-yellow-400" />
                    <CardTitle className="text-base">Senha Segura</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={regenPasswords} title="Gerar nova">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">Tamanho:</label>
                  <input
                    type="range"
                    min={6}
                    max={64}
                    value={pwOpts.length}
                    onChange={(e) => setPwOpts((p) => ({ ...p, length: Number(e.target.value) }))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm font-mono w-6 text-foreground">{pwOpts.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["upper", "lower", "numbers", "symbols"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => togglePwOpt(key)}
                      className={cn(
                        "text-xs px-3 py-2 rounded-md border transition-all",
                        pwOpts[key]
                          ? "bg-primary/10 border-primary/50 text-primary"
                          : "bg-secondary/50 border-border text-muted-foreground"
                      )}
                    >
                      {key === "upper" ? "A–Z" : key === "lower" ? "a–z" : key === "numbers" ? "0–9" : "!@#$"}
                    </button>
                  ))}
                </div>
                {passwords.map((pw, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm text-foreground break-all">{pw}</span>
                    <CopyButton value={pw} id={`pw-${i}`} copiedKey={copiedKey} onCopy={handleCopy} />
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2" onClick={regenPasswords}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Gerar nova senha
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Entropia: {Math.floor(pwOpts.length * Math.log2(
                    (pwOpts.upper ? 26 : 0) + (pwOpts.lower ? 26 : 0) +
                    (pwOpts.numbers ? 10 : 0) + (pwOpts.symbols ? 28 : 0) || 26
                  ))} bits
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-rose-400" />
                    <CardTitle className="text-base">Cores Aleatórias</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={regenColors} title="Gerar novas">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-2">
                    <div
                      className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">{color.hex}</span>
                        <CopyButton value={color.hex} id={`color-hex-${i}`} copiedKey={copiedKey} onCopy={handleCopy} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{color.rgb}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{color.hsl}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2 mt-1" onClick={regenColors}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Gerar novas cores
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
