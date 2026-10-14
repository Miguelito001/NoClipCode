import { describe, expect, it } from "vitest";
import { formatBytes, replaceExtension } from "./files";
import { parsePageRanges } from "./pdf";

describe("file helpers", () => {
  it("formats sizes for humans", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("replaces file extensions", () => {
    expect(replaceExtension("photo.jpeg", "webp")).toBe("photo.webp");
  });
});

describe("parsePageRanges", () => {
  it("parses ranges, individual pages and removes duplicates", () => {
    expect(parsePageRanges("1-3, 3, 5", 5)).toEqual([0, 1, 2, 4]);
  });

  it("selects every page for an empty range", () => {
    expect(parsePageRanges("", 3)).toEqual([0, 1, 2]);
  });

  it("rejects malformed and out-of-bounds ranges", () => {
    expect(() => parsePageRanges("3-1", 3)).toThrow();
    expect(() => parsePageRanges("4", 3)).toThrow();
    expect(() => parsePageRanges("one", 3)).toThrow();
  });
});
