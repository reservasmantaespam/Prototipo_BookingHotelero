import fs from "fs";

const content = fs.readFileSync("src/mantaHotels.ts", "utf-8");
const headerEnd = content.indexOf("export const MANTA_HOTELS: Hotel[] = [");
if (headerEnd === -1) {
  console.error("Could not find start of MANTA_HOTELS");
  process.exit(1);
}

const resStart = content.indexOf("export const INITIAL_DEMO_RESERVATIONS: MyReservation[] = [");
if (resStart === -1) {
  console.error("Could not find start of INITIAL_DEMO_RESERVATIONS");
  process.exit(1);
}

const header = content.substring(0, headerEnd);
const footer = content.substring(resStart);

const updatedHotels = JSON.parse(fs.readFileSync("./scratch/final_refined_hotels.json", "utf-8"));

const newHotelsTs = "export const MANTA_HOTELS: Hotel[] = " + JSON.stringify(updatedHotels, null, 2) + ";\n\n";

const fullNewContent = header + newHotelsTs + footer;
fs.writeFileSync("src/mantaHotels.ts", fullNewContent, "utf-8");
console.log("Successfully updated src/mantaHotels.ts!");

