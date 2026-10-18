import { describe, expect, it } from "vitest";
import { createCharacter, isCharacter, parseCharacter } from "./model";
describe("character data", () => {
  it("creates valid character", () => expect(isCharacter(createCharacter())).toBe(true));
  it("roundtrips JSON", () => { const c=createCharacter(); expect(parseCharacter(JSON.stringify(c))).toEqual(c); });
  it("rejects unsupported schema", () => expect(() => parseCharacter('{"schemaVersion":2}')).toThrow());
});
