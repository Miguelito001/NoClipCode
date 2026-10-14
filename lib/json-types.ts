function typeName(value: string): string {
  const clean = value.replace(/[^a-zA-Z0-9_$]+/g, " ").trim().split(/\s+/).map((part) => part[0]?.toUpperCase() + part.slice(1)).join("");
  return /^[A-Za-z_$]/.test(clean) ? clean : `Type${clean || "Value"}`;
}

function propertyName(value: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
}

export function jsonToTypescript(input: string, rootName = "Root"): string {
  const data: unknown = JSON.parse(input);
  const declarations: string[] = [];
  const used = new Set<string>();

  function uniqueName(suggested: string): string {
    const base = typeName(suggested);
    let name = base; let suffix = 2;
    while (used.has(name)) name = `${base}${suffix++}`;
    used.add(name); return name;
  }

  function infer(value: unknown, suggested: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (!value.length) return "unknown[]";
      if (value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
        return `${infer(value[0], suggested.replace(/s$/i, "") || "Item")}[]`;
      }
      const types = [...new Set(value.map((item) => infer(item, suggested.replace(/s$/i, "") || "Item")))];
      const union = types.join(" | ");
      return types.length > 1 ? `(${union})[]` : `${union}[]`;
    }
    if (typeof value === "object") {
      const name = uniqueName(suggested);
      const fields = Object.entries(value as Record<string, unknown>).map(([key, child]) => `  ${propertyName(key)}: ${infer(child, key)};`);
      declarations.push(`export interface ${name} {\n${fields.join("\n")}\n}`);
      return name;
    }
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "string";
  }

  const root = uniqueName(rootName);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    used.delete(root);
    infer(data, root);
  } else {
    declarations.push(`export type ${root} = ${infer(data, `${root}Item`)};`);
  }
  return declarations.reverse().join("\n\n");
}
