export function parsePageRanges(input: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error("PDF sem páginas válidas.");
  const clean = input.trim();
  if (!clean) return Array.from({ length: pageCount }, (_, index) => index);

  const pages = new Set<number>();
  for (const token of clean.split(",").map((part) => part.trim()).filter(Boolean)) {
    const match = token.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Intervalo inválido: ${token}`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`Use páginas entre 1 e ${pageCount}.`);
    }
    for (let page = start; page <= end; page += 1) pages.add(page - 1);
  }
  return [...pages];
}
