"use client";

import { createElement, Fragment, useMemo, type ReactNode } from "react";
import { marked, type Token, type Tokens } from "marked";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { useUrlState } from "@/hooks/use-url-state";
import { safeImageUrl, safeMarkdownUrl } from "@/lib/markdown-safe";
import { FileText } from "lucide-react";

const DEFAULT_MD = `# Olá, Markdown!

Escreva no painel da **esquerda** e veja o resultado à *direita*.

## Recursos suportados

- Listas com marcadores
- **Negrito** e *itálico*
- \`código inline\`
- [Links](https://www.noclipcode.com/)

> Citações também funcionam.

\`\`\`
bloco de código
multilinha
\`\`\`
`;

function inlineTokens(tokens: Token[] = []): ReactNode {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}`;
    if (token.type === "text") return <Fragment key={key}>{"tokens" in token && token.tokens ? inlineTokens(token.tokens) : token.text}</Fragment>;
    if (token.type === "strong") return <strong key={key}>{inlineTokens(token.tokens)}</strong>;
    if (token.type === "em") return <em key={key}>{inlineTokens(token.tokens)}</em>;
    if (token.type === "del") return <del key={key}>{inlineTokens(token.tokens)}</del>;
    if (token.type === "codespan") return <code key={key} className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">{token.text}</code>;
    if (token.type === "br") return <br key={key} />;
    if (token.type === "escape") return <Fragment key={key}>{token.text}</Fragment>;
    if (token.type === "link") {
      const href = safeMarkdownUrl(token.href);
      return href ? <a key={key} href={href} title={token.title || undefined} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{inlineTokens(token.tokens)}</a> : <Fragment key={key}>{inlineTokens(token.tokens)}</Fragment>;
    }
    if (token.type === "image") {
      const src = safeImageUrl(token.href);
      // Markdown pode apontar para qualquer host; o preview não conhece dimensões para next/image.
      // eslint-disable-next-line @next/next/no-img-element
      return src ? <img key={key} src={src} alt={token.text} title={token.title || undefined} className="my-3 max-w-full rounded" /> : <Fragment key={key}>{token.text}</Fragment>;
    }
    return <Fragment key={key}>{"raw" in token ? token.raw : ""}</Fragment>;
  });
}

function blockTokens(tokens: Token[]): ReactNode {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}`;
    if (token.type === "space") return null;
    if (token.type === "heading") {
      return createElement(`h${token.depth}`, { key, className: "font-bold text-foreground mt-4 mb-2" }, inlineTokens(token.tokens));
    }
    if (token.type === "paragraph") return <p key={key} className="my-2 leading-relaxed">{inlineTokens(token.tokens)}</p>;
    if (token.type === "code") return <pre key={key} className="overflow-x-auto rounded-lg bg-secondary p-4 my-3"><code className="font-mono text-sm">{token.text}</code></pre>;
    if (token.type === "blockquote") return <blockquote key={key} className="border-l-4 border-primary/50 pl-4 my-3 text-muted-foreground italic">{blockTokens(token.tokens || [])}</blockquote>;
    if (token.type === "list") {
      const Tag = token.ordered ? "ol" : "ul";
      return <Tag key={key} start={token.ordered ? token.start || undefined : undefined} className={`${token.ordered ? "list-decimal" : "list-disc"} pl-6 my-2 space-y-1`}>{token.items.map((item: Tokens.ListItem, itemIndex: number) => <li key={itemIndex}>{blockTokens(item.tokens)}</li>)}</Tag>;
    }
    if (token.type === "hr") return <hr key={key} className="my-4 border-border" />;
    if (token.type === "html") return <pre key={key} className="my-2 whitespace-pre-wrap rounded bg-secondary/60 p-3 text-sm">{token.raw}</pre>;
    return <Fragment key={key}>{"tokens" in token && Array.isArray(token.tokens) ? blockTokens(token.tokens as Token[]) : token.raw}</Fragment>;
  });
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const content = useMemo(() => blockTokens(marked.lexer(markdown, { gfm: true }) as Token[]), [markdown]);
  return <>{content}</>;
}

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useUrlState("md", DEFAULT_MD);
  return <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 p-4 md:p-8"><div className="container max-w-screen-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap"><div><div className="flex items-center gap-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"><FileText className="h-5 w-5 text-sky-400" /></div><h1 className="text-3xl font-bold">Markdown Editor</h1></div><p className="text-muted-foreground">Pré-visualização segura: HTML bruto e URLs perigosas nunca são executados.</p></div><ShareButton /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col"><p className="mb-2 text-sm font-medium text-muted-foreground">Editor</p><textarea value={markdown} onChange={(event) => setMarkdown(event.target.value)} spellCheck={false} className="min-h-[500px] flex-1 resize-none rounded-lg border border-border bg-background p-4 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></div>
        <div className="flex flex-col"><p className="mb-2 text-sm font-medium text-muted-foreground">Pré-visualização</p><div className="min-h-[500px] flex-1 overflow-auto rounded-lg border border-border bg-card p-6"><MarkdownPreview markdown={markdown} /></div></div>
      </div>
    </div></main>
  </div>;
}
