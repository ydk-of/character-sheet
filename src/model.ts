export interface Character { schemaVersion: 1; id: string; name: string; concept: string; ancestry: string; world: string; notes: string }
export function createCharacter(): Character { return { schemaVersion: 1, id: crypto.randomUUID(), name: "", concept: "", ancestry: "", world: "", notes: "" }; }
export function isCharacter(v: unknown): v is Character {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return obj.schemaVersion === 1 && ["id","name","concept","ancestry","world","notes"].every(key => typeof obj[key] === "string");
}
export function parseCharacter(text: string): Character {
  const value: unknown = JSON.parse(text);
  if (!isCharacter(value)) throw new Error("Invalid character file");
  return value;
}
