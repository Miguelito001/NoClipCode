"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { tools, getToolsByCategory } from "@/lib/tools";
import { SquareTerminal, Github, Search, ChevronDown, Menu, X } from "lucide-react";

function openPalette() {
  window.dispatchEvent(new Event("open-command-palette"));
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const grouped = getToolsByCategory();
  const activeTool = tools.find((t) => t.href === pathname);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/60 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <SquareTerminal className="h-4 w-4" />
          </div>
          <span className="font-display text-2xl leading-none tracking-wide text-foreground noclip-glow">
            NoClipCode
          </span>
        </Link>

        {/* Desktop: categories dropdown */}
        <nav className="hidden md:flex items-center gap-1">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-expanded={menuOpen}
            >
              Ferramentas
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  menuOpen && "rotate-180"
                )}
              />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-[36rem] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-2xl">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {grouped.map(([category, list]) => (
                    <div key={category}>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                        {category}
                      </p>
                      <div className="flex flex-col">
                        {list.map((tool) => {
                          const Icon = tool.icon;
                          const isActive = pathname === tool.href;
                          return (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                isActive
                                  ? "bg-secondary text-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              )}
                            >
                              <Icon className={cn("h-4 w-4 shrink-0", tool.color)} />
                              <span className="truncate">{tool.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeTool && (
            <span className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-secondary text-foreground">
              <activeTool.icon className={cn("h-4 w-4", activeTool.color)} />
              {activeTool.title}
            </span>
          )}
        </nav>

        <div className="flex-1" />

        {/* Search trigger */}
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>

        <a
          href="https://github.com/Miguelito001/EncodeHub2.0"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </a>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background max-h-[70vh] overflow-y-auto">
          <div className="container max-w-screen-2xl px-4 py-4 space-y-4">
            {grouped.map(([category, list]) => (
              <div key={category}>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {list.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", tool.color)} />
                        <span className="truncate">{tool.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
