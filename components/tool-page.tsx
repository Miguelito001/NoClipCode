import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { LockKeyhole } from "lucide-react";

interface ToolPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolPage({ title, description, children }: ToolPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-400">
                <LockKeyhole className="h-3.5 w-3.5" />
                Processamento 100% local. Seus arquivos não saem deste dispositivo.
              </p>
            </div>
            <ShareButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
