import { useEffect, useState } from "react";
import "./sheet.css";

const attributes = ["Сила","Ловкость","Телосложение","Интеллект","Мудрость","Харизма"] as const;
const conditions = ["Кровотечение","Перелом","Отравление","Холод","Жара","Голод","Жажда","Истощение"];
const statColumns = ["Расовый бонус","Снаряжение","Бафф","Прокачка","Итоговое значение"];
const slots = ["Пояс","Разгрузка","Колчан"] as const;
type SheetData = Record<string,string>;
const STORAGE_KEY = "arcanum.sheet.v2.draft";
function initial(): SheetData {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string,string] => typeof entry[1] === "string"));
      }
    }
  } catch { /* unavailable browser storage */ }
  return {};
}
export function Sheet() {
  const [data,setData] = useState<SheetData>(initial);
  const [message,setMessage] = useState("");
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); }
    catch { setMessage("Сохранение в браузере недоступно. Экспортируйте JSON."); }
  },[data]);
  function field(key:string,label:string,placeholder="",type:"text"|"number"="text") {
    return <input aria-label={label} type={type} value={data[key]??""} placeholder={placeholder} onChange={e=>setData(old=>({...old,[key]:e.target.value}))}/>;
  }
  function exportSheet() {
    const url=URL.createObjectURL(new Blob([JSON.stringify({schemaVersion:2,fields:data},null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="arcanum-sheet-v2.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importSheet(file?:File) {
    if(!file)return;
    try {
      const raw:unknown=JSON.parse(await file.text());
      if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error();
      const object=raw as Record<string,unknown>;
      if(object.schemaVersion!==2||!object.fields||typeof object.fields!=="object"||Array.isArray(object.fields))throw Error();
      const entries=Object.entries(object.fields);
      if(entries.some(([key,value])=>key.length>200||typeof value!=="string"))throw Error();
      setData(Object.fromEntries(entries as [string,string][]));setMessage("Лист импортирован.");
    }catch{setMessage("Неподдерживаемый формат файла.");}
  }
  return <main className="sheet-page">
    <header className="sheet-top"><div><span className="sheet-kicker">АРКАНУМ · ЛИСТ ПЕРСОНАЖА</span><h1>Лист персонажа</h1><p>Интерактивный черновик по структуре шаблона v2. Расчёты не включены до уточнения правил.</p></div>
      <div className="sheet-actions"><button onClick={exportSheet}>Экспорт JSON</button><label className="sheet-upload">Импорт JSON<input type="file" accept=".json,application/json" onChange={e=>{void importSheet(e.target.files?.[0]);e.target.value="";}}/></label><button className="sheet-reset" onClick={()=>{if(window.confirm("Очистить все поля листа?"))setData({});}}>Очистить</button></div>
    </header>
    {message&&<p role="status" className="sheet-message">{message}</p>}
    <div className="sheet-layout">
      <section className="sheet-card identity"><h2>Персонаж</h2>{[["Имя","name"],["Раса","race"],["Возраст","age"],["Родной мир","world"],["Владелец","owner"]].map(([label,key])=><label className="sheet-line" key={key}><span>{label}</span>{field(key,label)}</label>)}</section>
      <section className="sheet-card vitals"><h2>Ресурсы и астрал</h2><p>«Сумерки» — ресурс с максимумом 24. Здоровье, мана и модификаторы пока без расчётов.</p><div className="vital-grid">{["Здоровье","Мана"].map(v=><div className="vital-row" key={v}><strong>{v}</strong>{[0,1,2].map(i=><span key={i}>{field("vital."+v+"."+i,v+" — поле "+(i+1))}</span>)}</div>)}</div><div className="modifiers"><span>Модифик</span><strong>−3</strong><strong>−1</strong><strong>0</strong></div><div className="astral-grid"><label>Сумерки <span className="paired">{field("twilight.current","Сумерки — текущее значение","0")}<b>/ 24</b></span></label><div className="astral-touch"><strong>Касание Астрала</strong><div className="astral-touch-grid">{Array.from({length:12},(_,i)=><span key={i}>{field(i===0?"astral":"astral."+i,"Касание Астрала — ячейка "+(i+1))}</span>)}</div></div></div></section>
      <section className="sheet-card stats"><h2>Характеристики</h2><p>«Плюшки»: текущий / максимальный ресурс.</p><div className="sheet-scroll"><table className="stat-table"><thead><tr><th>Характеристика</th>{statColumns.map(c=><th key={c}>{c}</th>)}<th>Плюшки</th></tr></thead><tbody>{attributes.map(a=><tr key={a}><th scope="row">{a}</th>{statColumns.map(c=><td key={c} data-label={c}>{field("stat."+a+"."+c,a+" — "+c)}</td>)}<td data-label="Плюшки"><div className="paired">{field("stat."+a+".bonus1",a+" — плюшки 1")}<span>/</span>{field("stat."+a+".bonus2",a+" — плюшки 2")}</div></td></tr>)}</tbody></table></div></section>
      <section className="sheet-card conditions"><h2>Состояние</h2>{conditions.map(c=><div className="condition-row" key={c}><strong>{c}</strong>{field("condition."+c+".a",c+" — поле 1")}{field("condition."+c+".b",c+" — поле 2")}</div>)}</section>
      <section className="sheet-card will"><h2>Воля и удача</h2><div className="will-grid"><strong>Показатель</strong><strong>Значение</strong><strong>Плюшки</strong><strong>Болезнь маны</strong>{["Воля","Доп. строка"].map((n,i)=><div className="will-grid-row" key={i}><strong>{i===0?n:""}</strong>{field("will."+i+".value",n+" — значение")}<div className="paired">{field("will."+i+".bonus1",n+" — плюшки 1")}<span>/</span>{field("will."+i+".bonus2",n+" — плюшки 2")}</div>{field("will."+i+".illness",n+" — болезнь маны")}</div>)}</div><div className="luck"><strong>Удача</strong>{Array.from({length:6},(_,i)=><span key={i}>{field("luck."+i,"Удача — поле "+(i+1))}</span>)}</div></section>
      <section className="sheet-card combat"><h2>Боевые блоки</h2><div className="combat-grid">{[1,2].map(n=><fieldset key={n}><legend>Оружие / комплект {n}</legend>{["Атака","Урон","Парирование","Контратака","Блокирование"].map(label=><label key={label}><span>{label}</span>{field("combat."+n+"."+label,"Блок "+n+" — "+label)}</label>)}</fieldset>)}</div></section>
      <section className="sheet-card inventory"><h2>Снаряжение</h2>{slots.map((slot,index)=><div className="inventory-group" key={slot}><h3>{slot}</h3>{Array.from({length:index===0?4:index===1?6:1},(_,i)=><div key={i}>{field("inventory."+slot+"."+i,slot+" — ячейка "+(i+1),"Предмет / заметка")}</div>)}</div>)}</section>
      <section className="sheet-card skills"><h2>Навыки</h2><p>Семь строк для каждой характеристики. «Плю»: текущий / максимальный ресурс.</p><div className="skills-grid">{attributes.map(a=><div className="skill-group" key={a}><div className="skill-heading"><strong>{a}</strong><span>Значение</span><span>Плю</span></div>{Array.from({length:7},(_,i)=><div className="skill-row" key={i}>{field("skill."+a+"."+i+".name",a+" — навык "+(i+1))}{field("skill."+a+"."+i+".value",a+" — навык "+(i+1)+" значение")}<div className="paired">{field("skill."+a+"."+i+".p1",a+" — навык "+(i+1)+" плю 1")}<span>/</span>{field("skill."+a+"."+i+".p2",a+" — навык "+(i+1)+" плю 2")}</div></div>)}</div>)}</div></section>
    </div><footer className="sheet-footer">Сохранение происходит в браузере на этом устройстве. Для резервной копии используйте экспорт JSON.</footer>
  </main>;
}
