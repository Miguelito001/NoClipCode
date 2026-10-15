import { describe, expect, it } from "vitest";
import { zipSync } from "fflate";
import { bytesToAscii, bytesToHex, detectFileType, hasTypeConflict, imageAlpha, parseZipSummary, pdfVersion } from "./file-inspector";

const bytes = (...values: number[]) => new Uint8Array(values);

describe("magic byte detection", () => {
  it.each([
    [bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), "PNG"],
    [bytes(0xff, 0xd8, 0xff, 0xe0), "JPEG"],
    [bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37), "PDF"],
    [bytes(0x50, 0x4b, 0x03, 0x04), "ZIP"],
    [bytes(0x7f, 0x45, 0x4c, 0x46), "ELF"],
    [new TextEncoder().encode("SQLite format 3\0"), "SQLite Database"],
  ])("detects a signature", (input, kind) => expect(detectFileType(input).kind).toBe(kind));

  it("detects JSON and unknown binary content", () => {
    expect(detectFileType(new TextEncoder().encode('{"ok":true}')).kind).toBe("JSON");
    expect(detectFileType(bytes(0, 1, 2, 3, 4)).kind).toBe("Unknown");
  });
});

describe("inspection helpers", () => {
  it("flags extension conflicts and accepts ZIP-based office extensions", () => {
    const png = detectFileType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a));
    const zip = detectFileType(bytes(0x50, 0x4b, 0x03, 0x04));
    expect(hasTypeConflict("image.jpg", png)).toBe(true);
    expect(hasTypeConflict("sheet.xlsx", zip)).toBe(false);
  });

  it("formats safe byte previews", () => {
    expect(bytesToHex(bytes(0, 65, 255))).toBe("00 41 ff");
    expect(bytesToAscii(bytes(0, 65, 255))).toBe(".A.");
  });

  it("parses PDF versions and PNG alpha", () => {
    expect(pdfVersion(new TextEncoder().encode("%PDF-1.7"))).toBe("1.7");
    const png = new Uint8Array(26); png[25] = 6;
    expect(imageAlpha(png, "PNG")).toBe(true);
  });

  it("lists ZIP entries without extracting their contents", () => {
    const archive = zipSync({ "docs/readme.txt": new TextEncoder().encode("hello") });
    const summary = parseZipSummary(archive);
    expect(summary.entries).toHaveLength(1);
    expect(summary.entries[0]).toMatchObject({ name: "docs/readme.txt", uncompressedSize: 5, unsafePath: false });
  });
});
