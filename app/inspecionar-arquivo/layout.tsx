import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspetor Local de Arquivos | NoClipCode",
  description: "Identifique formatos, signatures, hashes e metadados sem enviar o arquivo.",
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
