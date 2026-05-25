import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.resolve("outputs/precios-cerraduras");
const imageDir = path.join(outDir, "images");

const products = [
  {
    brand: "Prive",
    model: "Cerradura Prive 200",
    price: 23656.67,
    image: "prive.png",
    source: "https://www.serranoaceros.com.ar/productos/cerradura-prive-200/",
    notes: "Precio online de referencia. Modelo compatible con Trabex 6624, Kallay 4003 y Acytra 004 segun fuente.",
  },
  {
    brand: "Andif",
    model: "Cerradura Andif 857 F16",
    price: 22813,
    image: "andif.png",
    source: "https://www.arfe.com.ar/productos/cerradura-857-f16/",
    notes: "Linea aluminio. Fuente indica producto sin stock al momento de consulta.",
  },
  {
    brand: "Roa",
    model: "Cerradura Roa 508",
    price: 53205,
    image: "roa.png",
    source: "https://www.arfe.com.ar/productos/cerradura-508-roa/",
    notes: "Consorcio / seguridad exterior. Fuente indica producto sin stock al momento de consulta.",
  },
  {
    brand: "Kallay",
    model: "Cerradura Kallay 4003",
    price: 29790,
    image: "kallay.png",
    source: "https://herrajesassef.com.ar/productos/cerradura-de-seguridad-kallay-4003/",
    notes: "Cerradura de seguridad 4 combinaciones.",
  },
  {
    brand: "Acytra",
    model: "Cerradura Acytra 006",
    price: 29682.56,
    image: "acytra.png",
    source: "https://ferreteria-elsotano.com.ar/productos/cerradura-puerta-frente-largo-acytra-006/",
    notes: "Doble paleta. Precio online de referencia con promocion publicada.",
  },
];

async function imageDataUrl(fileName) {
  const file = await fs.readFile(path.join(imageDir, fileName));
  return `data:image/png;base64,${file.toString("base64")}`;
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Precios cerraduras");
sheet.showGridLines = false;

sheet.getRange("A1:F1").merge();
sheet.getRange("A1").values = [["Listado de precios de cerraduras"]];
sheet.getRange("A2:F2").merge();
sheet.getRange("A2").values = [["Precios orientativos online en Argentina. Revisar stock, IVA, envio y forma de pago antes de cotizar."]];

sheet.getRange("A4:F4").values = [["Imagen", "Marca", "Modelo", "Precio ref.", "Fuente", "Notas"]];
sheet.getRange("A5:F9").values = products.map((p) => [
  "",
  p.brand,
  p.model,
  p.price,
  p.source,
  p.notes,
]);

sheet.getRange("A1:F1").format = {
  fill: "#050505",
  font: { bold: true, color: "#FFC02E", size: 18 },
  horizontalAlignment: "center",
};
sheet.getRange("A2:F2").format = {
  fill: "#111113",
  font: { color: "#FFF8E9", italic: true },
  horizontalAlignment: "center",
  wrapText: true,
};
sheet.getRange("A4:F4").format = {
  fill: "#B9790A",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
};
sheet.getRange("A5:F9").format = {
  fill: "#FFF8E9",
  font: { color: "#111111" },
  verticalAlignment: "middle",
  wrapText: true,
};
sheet.getRange("D5:D9").format.numberFormat = '"$"#,##0.00';
sheet.getRange("E5:E9").format.font = { color: "#1155CC", underline: true };

sheet.getRange("A:A").format.columnWidthPx = 140;
sheet.getRange("B:B").format.columnWidthPx = 95;
sheet.getRange("C:C").format.columnWidthPx = 210;
sheet.getRange("D:D").format.columnWidthPx = 105;
sheet.getRange("E:E").format.columnWidthPx = 300;
sheet.getRange("F:F").format.columnWidthPx = 330;
sheet.getRange("1:1").format.rowHeightPx = 34;
sheet.getRange("2:2").format.rowHeightPx = 38;
sheet.getRange("4:4").format.rowHeightPx = 28;
sheet.getRange("5:9").format.rowHeightPx = 112;

sheet.freezePanes.freezeRows(4);
sheet.tables.add("A4:F9", true, "TablaPreciosCerraduras");

for (let i = 0; i < products.length; i += 1) {
  const row = 4 + i;
  sheet.images.add({
    dataUrl: await imageDataUrl(products[i].image),
    anchor: {
      from: { row, col: 0, rowOffsetPx: 8, colOffsetPx: 14 },
      extent: { widthPx: 110, heightPx: 92 },
    },
  });
}

const source = workbook.worksheets.add("Fuentes");
source.showGridLines = false;
source.getRange("A1:D1").values = [["Marca", "Modelo", "Precio ref.", "URL"]];
source.getRange("A2:D6").values = products.map((p) => [p.brand, p.model, p.price, p.source]);
source.getRange("A1:D1").format = {
  fill: "#050505",
  font: { bold: true, color: "#FFC02E" },
};
source.getRange("A2:D6").format = { wrapText: true };
source.getRange("C2:C6").format.numberFormat = '"$"#,##0.00';
source.getRange("A:D").format.autofitColumns();

const check = await workbook.inspect({
  kind: "table",
  range: "Precios cerraduras!A1:F9",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 6,
});
console.log(check.ndjson);

await fs.mkdir(outDir, { recursive: true });
const preview = await workbook.render({ sheetName: "Precios cerraduras", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outDir, "preview.png"), new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outDir, "listado-precios-cerraduras.xlsx"));
