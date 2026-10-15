import { REGEX_LIMITS } from "@/lib/regex-safety";

self.onmessage = (event: MessageEvent<{ pattern: string; flags: string; text: string }>) => {
  try {
    const flags = event.data.flags.includes("g") ? event.data.flags : `${event.data.flags}g`;
    const expression = new RegExp(event.data.pattern, flags);
    const matches = [];
    let match: RegExpExecArray | null;
    while ((match = expression.exec(event.data.text)) !== null && matches.length < REGEX_LIMITS.matches) {
      matches.push({ index: match.index, end: match.index + match[0].length, value: match[0], groups: match.slice(1) });
      if (!event.data.flags.includes("g")) break;
      if (match[0].length === 0) expression.lastIndex++;
    }
    self.postMessage({ matches, error: "" });
  } catch (error) {
    self.postMessage({ matches: [], error: error instanceof Error ? error.message : "Expressão inválida." });
  }
};
