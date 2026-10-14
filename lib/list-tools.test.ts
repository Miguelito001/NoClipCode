import { describe, expect, it } from "vitest";
import { transformLines } from "./list-tools";

describe("transformLines", () => {
  it("sorts naturally", () => expect(transformLines("item 10\nitem 2\nitem 1", "sort")).toBe("item 1\nitem 2\nitem 10"));
  it("removes duplicates while preserving the first value", () => expect(transformLines("Alpha\nalpha\nBeta", "unique")).toBe("Alpha\nBeta"));
  it("cleans whitespace and blank lines", () => expect(transformLines("  a \n\n b  ", "clean")).toBe("a\nb"));
});
