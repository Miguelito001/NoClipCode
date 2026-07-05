import Link from "next/link";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommandHint } from "@/components/command-hint";
import { getToolsByCategory, tools } from "@/lib/tools";
import { Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Rápido",
    description: "Processamento instantâneo no navegador",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Seus dados nunca saem do seu dispositivo",
  },
  {
    icon: Globe,
    title: "Online",
    description: "Acesse de qualquer lugar, sem instalação",
  },
];

export default function HomePage() {
  const grouped = getToolsByCategory();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container max-w-screen-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 text-primary text-sm mb-6 border border-primary/30 font-mono">
              <Zap className="h-4 w-4" />
              <span>{tools.length} ferramentas encontradas no nível</span>
            </div>
            <p className="font-mono text-sm text-muted-foreground mb-2">
              <span className="text-primary">visitante@noclipcode</span>:~$ ./noclip --enter
            </p>
            <h1 className="font-display text-6xl md:text-8xl leading-none text-foreground mb-6 text-balance noclip-glow">
              NoClipCode
              <span className="noclip-cursor align-middle" aria-hidden="true" />
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed">
              Você atravessou a parede. Uma caixa de ferramentas para desenvolvedores no vazio entre os builds — converta, formate, teste e gere dados sem sair do navegador. Rápido, seguro e estranhamente familiar.
            </p>

            <div className="mb-12 flex justify-center">
              <CommandHint />
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-8 mb-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-12 px-4 bg-secondary/30">
          <div className="container max-w-screen-xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-4xl text-foreground">
                <span className="text-primary">&gt;</span> Ferramentas Disponíveis
              </h2>
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-sm border border-border font-mono">
                {tools.length} salas
              </span>
            </div>

            <div className="space-y-10">
              {grouped.map(([category, list]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    {category}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((tool) => (
                      <Link key={tool.href} href={tool.href}>
                        <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group">
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors flex-shrink-0">
                                <tool.icon className={`h-5 w-5 ${tool.color}`} />
                              </div>
                              <CardTitle className="text-base">{tool.title}</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="container max-w-screen-xl mx-auto text-center text-sm text-muted-foreground font-mono">
            <p>
              <span className="text-primary">[EXIT]</span> NoClipCode // feito no vazio para a comunidade de desenvolvedores.{" "}
              <a
                href="https://github.com/Miguelito001/NoClipCode"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ver no GitHub
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
