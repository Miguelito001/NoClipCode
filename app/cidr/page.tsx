"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { Copy, Check, Network } from "lucide-react";

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Endereço IPv4 inválido");
  }
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join(".");
}

function calc(cidr: string) {
  const [ip, prefixStr] = cidr.trim().split("/");
  const prefix = Number(prefixStr);
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Prefixo inválido (use /0 a /32)");
  }
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : totalHosts - 2;
  const firstHost = prefix >= 31 ? network : network + 1;
  const lastHost = prefix >= 31 ? broadcast : broadcast - 1;

  return {
    netmask: intToIp(mask),
    wildcard: intToIp(~mask >>> 0),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts: Math.max(0, usableHosts),
    range: `${intToIp(network)} - ${intToIp(broadcast)}`,
  };
}

export default function CidrPage() {
  const [input, setInput] = useUrlState("q", "192.168.1.0/24");
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => {
    try {
      return { data: calc(input), error: null as string | null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Erro" };
    }
  }, [input]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const rows = result.data
    ? [
        { label: "Máscara de subrede", value: result.data.netmask },
        { label: "Wildcard", value: result.data.wildcard },
        { label: "Endereço de rede", value: result.data.network },
        { label: "Broadcast", value: result.data.broadcast },
        { label: "Primeiro host", value: result.data.firstHost },
        { label: "Último host", value: result.data.lastHost },
        { label: "Intervalo", value: result.data.range },
        { label: "Total de endereços", value: result.data.totalHosts.toLocaleString("pt-BR") },
        { label: "Hosts utilizáveis", value: result.data.usableHosts.toLocaleString("pt-BR") },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-md mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Network className="h-5 w-5 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Calculadora CIDR</h1>
              </div>
              <p className="text-muted-foreground">
                Calcule range de IPs, máscara e número de hosts a partir da notação CIDR.
              </p>
            </div>
            <ShareButton />
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notação CIDR</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="192.168.1.0/24"
                className="w-full h-11 rounded-md border border-border bg-background px-3 font-mono text-base text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />
              {result.error && (
                <p className="mt-2 text-sm text-red-400">{result.error}</p>
              )}
            </CardContent>
          </Card>

          {result.data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resultado</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/50">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-3 py-2.5 group"
                  >
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">{r.value}</span>
                      <button
                        onClick={() => copy(String(r.value), r.label)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        title="Copiar"
                      >
                        {copied === r.label ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
