import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Sheet } from "./Sheet";

const render = () => renderToStaticMarkup(<Sheet />);
const count = (text: string, expression: RegExp) => [...text.matchAll(expression)].length;

describe("sheet v2 template structure", () => {
  it("retains all six horizontal characteristic rows and seven table columns", () => {
    const html = render();
    const table = html.match(/<table class="stat-table">([\s\S]*?)<\/table>/)?.[1] ?? "";
    expect(table).not.toBe("");
    expect(count(table, /<th scope="row">/g)).toBe(6);
    expect(count(table, /<tr>/g)).toBe(7); // header + six attributes
    expect(count(table, /<th(?:\s|>)/g)).toBe(13); // seven headers + six row labels
    expect(count(table, /<td(?:\s|>)/g)).toBe(36); // six data columns per row
    expect(table).toContain("Итоговое значение");
    expect(table).toContain("Плюшки");
  });

  it("retains 42 editable skill rows and both weapon sets", () => {
    const html = render();
    expect(count(html, /class="skill-row"/g)).toBe(42);
    expect(html).toContain("Оружие / комплект 1");
    expect(html).toContain("Оружие / комплект 2");
  });

  it("retains twelve Astral Touch fields as in the PPTX", () => {
    const html = render();
    const grid = html.match(/class="astral-touch-grid">([\s\S]*?)<\/div>/)?.[1] ?? "";
    expect(count(grid, /<input\s/g)).toBe(12);
    expect(grid).toContain('aria-label="Касание Астрала — ячейка 1"');
    expect(grid).toContain('aria-label="Касание Астрала — ячейка 12"');
  });

  it("keeps the approved Twilight cap of 24 and editable unresolved vitals", () => {
    const html = render();
    expect(html).toContain("/ 24");
    expect(html).toContain("Здоровье — поле 1");
    expect(html).toContain("Мана — поле 3");
  });
});
