import fs from "fs";
import xlsx from "node-xlsx";

// Read excel
const workSheets = xlsx.parse("./Consolidado-Nacional-2026-publico-8.xlsx");
const rows = workSheets[0].data;
const header = rows[0];
const rucCol = header.indexOf("RUC");
const nameCol = header.indexOf("Nombre Comercial");
const parishCol = header.indexOf("Parroquia");

const excelMap = new Map();
for (let i = 1; i < rows.length; i++) {
  const ruc = String(rows[i][rucCol] || "").trim();
  const name = String(rows[i][nameCol] || "").trim().toUpperCase();
  const parish = String(rows[i][parishCol] || "").trim();
  excelMap.set(ruc, { name, parish });
}

// Read TS
const code = fs.readFileSync("./src/mantaHotels.ts", "utf-8");
const match = code.match(/export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)/);
const hotels = eval(match[1].replace(/;\s*$/, ""));

console.log(`Comparing ${hotels.length} hotels with Excel...`);
hotels.forEach(h => {
  const ex = excelMap.get(h.taxId);
  if (ex) {
    const p1 = h.parish.toUpperCase().replace(/\s+/g, "");
    const p2 = ex.parish.toUpperCase().replace(/\s+/g, "");
    if (p1 !== p2) {
      console.log(`Mismatch: "${h.name}" (taxId: ${h.taxId}) -> TS: "${h.parish}" vs Excel: "${ex.parish}"`);
    }
  } else {
    console.log(`RUC not found in Excel: "${h.name}" (taxId: ${h.taxId})`);
  }
});

