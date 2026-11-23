import fs from "fs";

const code = fs.readFileSync("./src/mantaHotels.ts", "utf-8");
const match = code.match(/export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)/);
const jsonStr = match[1].replace(/;\s*$/, "");
const hotels = eval(jsonStr);

console.log(`Auditing ${hotels.length} hotels...\n`);

function isPointInOcean(lat, lng, parish) {
  // Coastline rules:
  // 1. Los Esteros: Coastline is at lat -0.9535. Anything north (lat > -0.9535) is in ocean.
  if (parish === "Los Esteros") {
    if (lat > -0.9538) return `In ocean: lat ${lat} > -0.9538`;
  }
  // 2. Tarqui: Coastline is at lat -0.9530. Anything north (lat > -0.9530) is in ocean.
  if (parish === "Tarqui") {
    if (lat > -0.9532) return `In ocean: lat ${lat} > -0.9532`;
  }
  // 3. Manta Centro / Murcielago:
  // Murcielago beach is at lat -0.9485 for lng -80.73 to -80.72.
  if (parish === "Manta") {
    if (lat > -0.9485) return `In ocean: lat ${lat} > -0.9485 (north of Murcielago beach)`;
    // Barbasquillo coast is diagonal: from (-0.955, -80.745) to (-0.963, -80.755)
    // West of this line is ocean: approx lng < -80.753 when lat > -0.960
    if (lng < -80.7535) return `In ocean: lng ${lng} < -80.7535 (west of Barbasquillo cliff)`;
  }
  // 4. San Mateo:
  // Coast is at lng -80.810. Lat around -0.962.
  if (parish === "San Mateo") {
    if (lng < -80.8080 || lat < -0.970) return `In ocean or wrong lat/lng: lat ${lat}, lng ${lng}`;
  }
  // 5. Santa Marianita:
  // Coast is at lng -80.840. Land is east (lng > -80.840). Town is between -0.990 and -1.010
  if (parish === "Santa Marianita") {
    if (lng < -80.8390) return `In ocean: lng ${lng} < -80.8390`;
    if (lat < -1.020 || lat > -0.985) return `Outside Santa Marianita area: lat ${lat}`;
  }
  // 6. San Lorenzo:
  // Coast is at lng -80.906. Land is east (lng > -80.906). Lat is around -1.060 to -1.066
  if (parish === "San Lorenzo") {
    if (lng < -80.9055) return `In ocean: lng ${lng} < -80.9055`;
    if (lat < -1.070 || lat > -1.055) return `Outside San Lorenzo area: lat ${lat}`;
  }
  return null;
}

const oceanIssues = [];
hotels.forEach(h => {
  const issue = isPointInOcean(h.lat, h.lng, h.parish);
  if (issue) {
    oceanIssues.push({ id: h.id, name: h.name, parish: h.parish, lat: h.lat, lng: h.lng, issue });
  }
});

console.log(`Found ${oceanIssues.length} hotels in ocean or misplaced:`);
oceanIssues.forEach(o => {
  console.log(`- [${o.id}] "${o.name}" (${o.parish}): [${o.lat}, ${o.lng}] -> ${o.issue}`);
});

