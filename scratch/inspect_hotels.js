import fs from "fs";

// Read mantaHotels.ts
const code = fs.readFileSync("./src/mantaHotels.ts", "utf-8");

// Extract the MANTA_HOTELS array content
const match = code.match(/export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)/);
if (!match) {
  console.error("Could not find MANTA_HOTELS array");
  process.exit(1);
}

// Evaluate safely
const jsonStr = match[1].replace(/;\s*$/, "");
let hotels;
try {
  hotels = eval(jsonStr);
} catch (e) {
  console.error("Eval error:", e);
  process.exit(1);
}

console.log("Total hotels loaded:", hotels.length);

// Analyze 'Frente al Mar'
const frenteHotels = hotels.filter(h => h.tags && h.tags.includes("Frente al Mar"));
console.log(`\nHotels with 'Frente al Mar': ${frenteHotels.length}`);
frenteHotels.forEach(h => {
  console.log(`- [${h.id}] "${h.name}" | Parish: ${h.parish} | Addr: "${h.address}" | City: "${h.city}" | Lat: ${h.lat}, Lng: ${h.lng}`);
});

// Analyze coordinates
console.log("\nChecking coordinate extremes per parish:");
const parishes = [...new Set(hotels.map(h => h.parish))];
for (const p of parishes) {
  const inP = hotels.filter(h => h.parish === p);
  const lats = inP.map(h => h.lat).filter(l => typeof l === 'number');
  const lngs = inP.map(h => h.lng).filter(l => typeof l === 'number');
  console.log(`Parish ${p} (${inP.length} hotels):`);
  console.log(`  Lat min: ${Math.min(...lats)}, max: ${Math.max(...lats)}`);
  console.log(`  Lng min: ${Math.min(...lngs)}, max: ${Math.max(...lngs)}`);
}

