import fs from "fs";

const code = fs.readFileSync("./src/mantaHotels.ts", "utf-8");
const match = code.match(/export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)/);
const jsonStr = match[1].replace(/;\s*$/, "");
const hotels = eval(jsonStr);

console.log("Analyzing 'Frente al Mar' and tags for all 116 hotels:\n");

const frenteHotels = hotels.filter(h => h.tags && h.tags.includes("Frente al Mar"));
console.log(`Currently ${frenteHotels.length} hotels have 'Frente al Mar':`);
frenteHotels.forEach(h => {
  console.log(`- [${h.id}] "${h.name}" | Parish: ${h.parish} | Addr: "${h.address}" | City: "${h.city}"`);
});

