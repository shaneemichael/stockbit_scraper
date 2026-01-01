interface ParsedTable {
  headers: string[];
  rows: string[][];
}

function parseHtmlTable(html: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tableElements = doc.querySelectorAll("table");

  tableElements.forEach((table) => {
    const headers: string[] = [];
    const rows: string[][] = [];

    const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
    if (headerRow) {
      const headerCells = headerRow.querySelectorAll("th, td");
      headerCells.forEach((cell) => {
        headers.push(cell.textContent?.trim() || "");
      });
    }

    const bodyRows = table.querySelectorAll("tbody tr");
    if (bodyRows.length > 0) {
      bodyRows.forEach((row) => {
        const cells: string[] = [];
        row.querySelectorAll("td, th").forEach((cell) => {
          cells.push(cell.textContent?.trim() || "");
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
    } else {
      const allRows = table.querySelectorAll("tr");
      allRows.forEach((row, idx) => {
        if (idx === 0 && headers.length > 0) return;
        const cells: string[] = [];
        row.querySelectorAll("td, th").forEach((cell) => {
          cells.push(cell.textContent?.trim() || "");
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
    }

    if (headers.length > 0 || rows.length > 0) {
      tables.push({ headers, rows });
    }
  });

  return tables;
}