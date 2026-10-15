import { describe, expect, it } from "vitest";
import { buildBatchFilename, calculateImageDimensions, validateBatchFiles } from "./batch-images";

describe("batch image naming", () => {
  it("keeps the original name with prefix, suffix and numbering", () => {
    expect(buildBatchFilename("photo.jpg", 1, "webp", {
      prefix: "produto-", suffix: "-thumb", useOriginalName: true, numbered: true, startAt: 1,
    })).toBe("produto-photo-thumb-2.webp");
  });

  it("supports the foto-{n} style without the original name", () => {
    expect(buildBatchFilename("ignored.png", 0, "jpg", {
      prefix: "foto", suffix: "", useOriginalName: false, numbered: true, startAt: 1,
    })).toBe("foto-1.jpg");
  });
});

describe("batch resize", () => {
  it("fits inside maximum bounds without enlarging", () => {
    expect(calculateImageDimensions(4000, 2000, { mode: "max", width: 1200, height: 1200, preserveAspectRatio: true }))
      .toEqual({ width: 1200, height: 600 });
    expect(calculateImageDimensions(800, 600, { mode: "max", width: 1200, height: 1200, preserveAspectRatio: true }))
      .toEqual({ width: 800, height: 600 });
  });

  it("preserves proportion for fixed dimensions by default", () => {
    expect(calculateImageDimensions(1600, 900, { mode: "fixed", width: 800, height: 800, preserveAspectRatio: true }))
      .toEqual({ width: 800, height: 450 });
  });

  it("rejects a resize without dimensions", () => {
    expect(() => calculateImageDimensions(100, 100, { mode: "max", preserveAspectRatio: true })).toThrow();
  });
});

describe("batch validation", () => {
  it("reports invalid formats without hiding valid files", () => {
    const errors = validateBatchFiles([
      { name: "ok.png", type: "image/png", size: 100 },
      { name: "bad.svg", type: "image/svg+xml", size: 100 },
    ]);
    expect(errors).toEqual(["bad.svg: formato não suportado."]);
  });

  it("enforces file count, per-file and total limits", () => {
    const tooMany = Array.from({ length: 31 }, (_, index) => ({ name: `${index}.png`, type: "image/png", size: 9 * 1024 * 1024 }));
    const errors = validateBatchFiles(tooMany);
    expect(errors.some((error) => error.includes("30 imagens"))).toBe(true);
    expect(errors.some((error) => error.includes("250 MB"))).toBe(true);
  });
});
