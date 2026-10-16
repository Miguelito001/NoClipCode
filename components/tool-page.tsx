import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { LocalProcessingBadge } from "@/components/local-processing-badge";

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
              <div className="mt-3"><LocalProcessingBadge /></div>
            </div>
            <ShareButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
