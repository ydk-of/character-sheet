import { useEffect, useRef, useState } from "react";
import { Character, createCharacter, isCharacter, parseCharacter } from "./model";
const KEY = "arcanum.character.v1";
function initial(): Character {
  try { const raw = localStorage.getItem(KEY); if (raw) { const v: unknown = JSON.parse(raw); if (isCharacter(v)) return v; } } catch { /* storage unavailable */ }
  return createCharacter();
}
export function App() {
  const [character, setCharacter] = useState<Character>(initial);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(character)); } catch { setMessage("Не удалось сохранить данные. Экспортируйте JSON."); } }, [character]);
  function update(key: "name" | "concept" | "ancestry" | "world" | "notes", value: string) { setCharacter(prev => ({ ...prev, [key]: value })); }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(character, null, 2)], {type:"application/json"}));
    const a = document.createElement("a"); a.href=url; a.download="character-sheet.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function upload(file?: File) {
    if (!file) return;
    try { setCharacter(parseCharacter(await file.text())); setMessage("Импорт выполнен."); }
    catch { setMessage("Неверный формат файла персонажа."); }
    if (inputRef.current) inputRef.current.value="";
  }
  return <main className="shell">
    <header><small>АРКАНУМ · НРИ</small><h1>Лист персонажа</h1><p>Черновой редактор. Игровые расчёты будут добавлены после утверждения правил.</p></header>
    <nav><button onClick={download}>Экспорт JSON</button><button onClick={() => inputRef.current?.click()}>Импорт JSON</button><input hidden type="file" accept=".json,application/json" ref={inputRef} onChange={e => void upload(e.target.files?.[0])}/><button onClick={() => { if (window.confirm("Заменить текущего персонажа?")) setCharacter(createCharacter()); }}>Новый персонаж</button></nav>
    {message && <p role="status">{message}</p>}
    <section><h2>Основные сведения</h2><div className="grid">
      {([["name","Имя"],["concept","Концепция"],["ancestry","Раса / происхождение"],["world","Мир"]] as const).map(([key,label]) => <label key={key}>{label}<input value={character[key]} onChange={e => update(key,e.target.value)}/></label>)}
    </div></section>
    <section><h2>Заметки</h2><label>Биография, инвентарь и прочее<textarea rows={10} value={character.notes} onChange={e => update("notes",e.target.value)}/></label></section>
    <footer>Сохранение локальное, в текущем браузере. Для резервной копии используйте экспорт JSON.</footer>
  </main>;
}
