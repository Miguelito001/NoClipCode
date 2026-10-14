export type ListOperation = "sort" | "sort-desc" | "unique" | "reverse" | "shuffle" | "clean";

export function transformLines(input: string, operation: ListOperation, caseSensitive = false): string {
  let lines = input.split(/\r?\n/);
  if (operation === "clean") lines = lines.map((line) => line.trim()).filter(Boolean);
  if (operation === "unique") {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = caseSensitive ? line : line.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: caseSensitive ? "variant" : "base" });
  if (operation === "sort") lines.sort(collator.compare);
  if (operation === "sort-desc") lines.sort(collator.compare).reverse();
  if (operation === "reverse") lines.reverse();
  if (operation === "shuffle") {
    for (let index = lines.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [lines[index], lines[target]] = [lines[target], lines[index]];
    }
  }
  return lines.join("\n");
}
