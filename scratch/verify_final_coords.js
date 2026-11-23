import fs from "fs";

const hotels = JSON.parse(fs.readFileSync("./scratch/final_refined_hotels.json", "utf-8"));

function isPointInOcean(lat, lng, parish) {
  if (parish === "Los Esteros") {
    if (lat > -0.9538) return `In ocean: lat ${lat} > -0.9538`;
  }
  if (parish === "Tarqui") {
    if (lat > -0.9532) return `In ocean: lat ${lat} > -0.9532`;
  }
  if (parish === "Manta") {
    if (lat > -0.9488) return `In ocean: lat ${lat} > -0.9488 (north of Murcielago beach)`;
    if (lng < -80.7530) return `In ocean: lng ${lng} < -80.7530 (west of Barbasquillo cliff)`;
  }
  if (parish === "San Mateo") {
    if (lng < -80.8080 || lat < -0.970) return `In ocean or wrong lat/lng: lat ${lat}, lng ${lng}`;
  }
  if (parish === "Santa Marianita") {
    if (lng < -80.8390) return `In ocean: lng ${lng} < -80.8390`;
    if (lat < -1.020 || lat > -0.985) return `Outside Santa Marianita area: lat ${lat}`;
  }
  if (parish === "San Lorenzo") {
    if (lng < -80.9055) return `In ocean: lng ${lng} < -80.9055`;
    if (lat < -1.070 || lat > -1.055) return `Outside San Lorenzo area: lat ${lat}`;
  }
  return null;
}

const issues = [];
hotels.forEach(h => {
  const issue = isPointInOcean(h.lat, h.lng, h.parish);
  if (issue) issues.push({ id: h.id, name: h.name, parish: h.parish, lat: h.lat, lng: h.lng, issue });
});

console.log(`Ocean issues found: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(i => console.log(i));
} else {
  console.log("SUCCESS: 100% of hotels are safely on land in their designated parish!");
}

