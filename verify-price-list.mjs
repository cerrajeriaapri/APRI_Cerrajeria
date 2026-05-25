import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const input = await FileBlob.load("outputs/precios-cerraduras/listado-precios-cerraduras.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "table",
  range: "Precios cerraduras!A1:F9",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 6,
});
console.log(summary.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
});
console.log(errors.ndjson);
