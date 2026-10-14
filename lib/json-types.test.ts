import { describe, expect, it } from "vitest";
import { jsonToTypescript } from "./json-types";

describe("jsonToTypescript", () => {
  it("creates nested interfaces", () => {
    const output = jsonToTypescript('{"id":1,"profile":{"display-name":"Ana","active":true}}', "User");
    expect(output).toContain("export interface User");
    expect(output).toContain('"display-name": string');
    expect(output).toContain("profile: Profile");
  });
  it("creates a root alias for arrays", () => expect(jsonToTypescript("[1,2]", "Numbers")).toContain("export type Numbers = number[]"));
  it("rejects invalid JSON", () => expect(() => jsonToTypescript("{")) .toThrow());
});
