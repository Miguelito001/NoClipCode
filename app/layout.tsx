import type { Metadata, Viewport } from "next";
import { Space_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoClipCode // Ferramentas para Desenvolvedores",
  description:
    "NoClipCode é uma caixa de ferramentas online para desenvolvedores. Atravesse as paredes da realidade: converta Base64, Binário, JSON, XML, YAML, gere hashes e muito mais — tudo no navegador.",
  keywords: [
    "noclipcode",
    "conversor",
    "base64",
    "binário",
    "json",
    "xml",
    "yaml",
    "hash",
    "desenvolvedor",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0906",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body
        className={`${spaceMono.variable} ${vt323.variable} font-sans min-h-screen`}
      >
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
