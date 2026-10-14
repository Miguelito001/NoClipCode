"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, Palette, Shuffle } from "lucide-react";

interface RGB {
  r: number;
  g: number;
  b: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  // HEX
  const hexMatch = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  // rgb(r, g, b)
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    return {
      r: clamp(Number(rgbMatch[1]), 0, 255),
      g: clamp(Number(rgbMatch[2]), 0, 255),
      b: clamp(Number(rgbMatch[3]), 0, 255),
    };
  }

  // hsl(h, s%, l%)
  const hslMatch = s.match(/^hsla?\(\s*(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
  if (hslMatch) {
    return hslToRgb(
      Number(hslMatch[1]),
      clamp(Number(hslMatch[2]), 0, 100),
      clamp(Number(hslMatch[3]), 0, 100)
    );
  }

  return null;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl({ r, g, b }: RGB) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToCmyk({ r, g, b }: RGB) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function randomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

export default function ColorPage() {
  const [value, setValue] = useUrlState("c", "#3b82f6");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => parseColor(value), [value]);

  const formats = useMemo(() => {
    if (!rgb) return [];
    const hsl = rgbToHsl(rgb);
    const cmyk = rgbToCmyk(rgb);
    return [
      { key: "hex", label: "HEX", value: rgbToHex(rgb) },
      { key: "rgb", label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { key: "hsl", label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      {
        key: "cmyk",
        label: "CMYK",
        value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      },
    ];
  }, [rgb]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const previewColor = rgb ? rgbToHex(rgb) : "transparent";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Palette className="h-5 w-5 text-pink-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Conversor de Cor</h1>
              </div>
              <p className="text-muted-foreground">
                Cole uma cor em HEX, RGB ou HSL e obtenha todos os formatos equivalentes.
              </p>
            </div>
            <ShareButton />
          </div>

          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Preview + entrada */}
            <Card>
              <CardContent className="pt-6">
                <div
                  className="aspect-square w-full rounded-lg border border-border mb-4"
                  style={{ backgroundColor: previewColor }}
                  aria-label="Pré-visualização da cor"
                />
                <input
                  type="text"
                  placeholder="#3b82f6"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mb-3"
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={rgb ? rgbToHex(rgb) : "#000000"}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-md border border-border bg-background"
                    aria-label="Seletor de cor"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setValue(randomHex())}
                  >
                    <Shuffle className="h-4 w-4" />
                    Aleatória
                  </Button>
                </div>
                {value && !rgb && (
                  <p className="mt-3 text-sm text-destructive">
                    Cor inválida. Tente HEX, rgb() ou hsl().
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Formatos */}
            <div className="space-y-3">
              {formats.length > 0 ? (
                formats.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/40 border border-border p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                      <p className="font-mono text-sm text-foreground truncate">{f.value}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copy(f.value, f.key)} title="Copiar">
                      {copied === f.key ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-secondary/40 border border-border p-8 text-center text-muted-foreground">
                  Informe uma cor válida para ver os formatos.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
