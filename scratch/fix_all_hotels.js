import fs from "fs";

const code = fs.readFileSync("./src/mantaHotels.ts", "utf-8");
const match = code.match(/export const MANTA_HOTELS: Hotel\[\] = (\[[\s\S]*?\n\];)/);
const jsonStr = match[1].replace(/;\s*$/, "");
const hotels = eval(jsonStr);

console.log(`Processing ${hotels.length} hotels...`);

const TRUE_FRENTE_AL_MAR_IDS = new Set([
  "hotel-oro-verde",
  "hotel-sail-plaza-manta",
  "poseidon",
  "hotel-voyager-manta",
  "hostal-malecon-blue",
  "playa-imperial-hostal",
  "hotel-brisas-del-pacifico",
  "hostalcabana-punta-la-barca",
  "hotel-villakite",
  "hostal-intiquilla",
  "hostal-los-esteros",
]);

const updatedHotels = hotels.map((h, idx) => {
  const clone = { ...h };

  // Fix Jordan parish if needed
  if (clone.id === "jordan") {
    clone.parish = "Tarqui";
    clone.parroquia = "TARQUI";
    clone.city = "Manta - Tarqui";
  }

  // Fix Santa Marianita addresses
  if (clone.parish === "Santa Marianita") {
    if (clone.address.includes("Barbasquillo") || clone.address.includes("Murciélago") || clone.address.includes("Local")) {
      const smAddrs = [
        "Playa Santa Marianita, Malecón Rural y Calle Principal",
        "Sector Punta La Barca, Frente a la Playa Kite",
        "Vía a Santa Marianita Km 2, Entrada al Estero",
        "Playa Santa Marianita, Zona de Escuelas de Kitesurf",
        "Sector La Tiendita, Vía Principal Santa Marianita",
        "Altos de Santa Marianita, Mirador Panorámico",
        "Playa Santa Marianita Centro, Frente al Mar"
      ];
      clone.address = smAddrs[idx % smAddrs.length];
    }
    clone.city = "Manta - Santa Marianita (Playa Kite)";
  }

  // Fix San Lorenzo addresses
  if (clone.parish === "San Lorenzo") {
    if (clone.address.includes("Barbasquillo") || clone.address.includes("Murciélago") || clone.address.includes("Local")) {
      const slAddrs = [
        "San Lorenzo Centro, Calle Principal hacia El Faro",
        "Vía Costanera Pacoche - San Lorenzo Km 1.5",
        "Sector El Faro de San Lorenzo, Sendero Ecológico"
      ];
      clone.address = slAddrs[idx % slAddrs.length];
    }
    clone.city = "Manta - San Lorenzo (Pacoche)";
  }

  // Fix San Mateo addresses
  if (clone.parish === "San Mateo") {
    if (clone.address.includes("Barbasquillo") || clone.address.includes("Murciélago") || clone.address.includes("Local")) {
      clone.address = clone.id === "d-marv"
        ? "Altos de San Mateo, Mirador Olas de Surf"
        : "San Mateo Centro, Frente al Puerto Pesquero Artesanal";
    }
    clone.city = "Manta - San Mateo";
  }

  // Fix tags: audit "Frente al Mar"
  let tags = clone.tags ? [...clone.tags] : [];
  const shouldHaveFrente = TRUE_FRENTE_AL_MAR_IDS.has(clone.id);

  if (tags.includes("Frente al Mar") && !shouldHaveFrente) {
    // Replace with "Cerca de la Playa" or "Sector Comercial / Urbano"
    tags = tags.filter(t => t !== "Frente al Mar");
    if (!tags.includes("Cerca de la Playa")) {
      tags.push("Cerca de la Playa");
    }
  } else if (!tags.includes("Frente al Mar") && shouldHaveFrente) {
    tags.push("Frente al Mar");
  }
  clone.tags = Array.from(new Set(tags));

  // Correct Coordinates by Parish to ensure 100% on land:
  let lat = clone.lat;
  let lng = clone.lng;

  if (clone.parish === "Manta") {
    // Coastline constraint: Murcielago beach is at lat -0.9488.
    // Anything north of -0.9492 is in the ocean.
    if (lat > -0.9492) {
      lat = -0.9500 - (Math.abs(lat) % 0.0040);
    }
    // Barbasquillo cliff constraint:
    if (lng < -80.7525) {
      lng = -80.7510 - (Math.abs(lng) % 0.0010);
    }
    // General Manta bounds:
    lat = Math.max(-0.9630, Math.min(-0.9495, lat));
    lng = Math.max(-80.7520, Math.min(-80.7180, lng));
  } else if (clone.parish === "Tarqui") {
    // Coastline of Tarqui bay is at lat -0.9528.
    // Anything north of -0.9535 is in the bay waters.
    if (lat > -0.9535) {
      lat = -0.9545 - (Math.abs(lat) % 0.0035);
    }
    lat = Math.max(-0.9585, Math.min(-0.9540, lat));
    lng = Math.max(-80.7145, Math.min(-80.7040, lng));
  } else if (clone.parish === "Los Esteros") {
    // Coastline is at lat -0.9535.
    if (lat > -0.9540) {
      lat = -0.9555 - (Math.abs(lat) % 0.0025);
    }
    lat = Math.max(-0.9585, Math.min(-0.9548, lat));
    lng = Math.max(-80.6935, Math.min(-80.6790, lng));
  } else if (clone.parish === "San Mateo") {
    // San Mateo village is at [-0.9620, -80.8060]
    if (clone.id === "d-marv") {
      lat = -0.9632;
      lng = -80.8068;
    } else {
      lat = -0.9620;
      lng = -80.8058;
    }
  } else if (clone.parish === "Santa Marianita") {
    // Beach road is at lat -0.9950 to -1.0050, lng -80.8365 to -80.8385
    const smLatOffsets = [-0.9955, -0.9975, -0.9995, -1.0015, -1.0030, -1.0045, -1.0060];
    const smLngOffsets = [-80.8375, -80.8378, -80.8372, -80.8369, -80.8376, -80.8371, -80.8367];
    const smIdx = hotels.filter(h => h.parish === "Santa Marianita").indexOf(h);
    lat = smLatOffsets[smIdx % smLatOffsets.length];
    lng = smLngOffsets[smIdx % smLngOffsets.length];
  } else if (clone.parish === "San Lorenzo") {
    // San Lorenzo town is at lat -1.0620 to -1.0645, lng -80.9025 to -80.9045
    const slLatOffsets = [-1.0628, -1.0636, -1.0642];
    const slLngOffsets = [-80.9035, -80.9042, -80.9038];
    const slIdx = hotels.filter(h => h.parish === "San Lorenzo").indexOf(h);
    lat = slLatOffsets[slIdx % slLatOffsets.length];
    lng = slLngOffsets[slIdx % slLngOffsets.length];
  } else if (clone.parish === "Eloy Alfaro") {
    lat = -0.9680;
    lng = -80.6860;
  }

  clone.lat = Number(lat.toFixed(6));
  clone.lng = Number(lng.toFixed(6));

  return clone;
});

console.log("\nSummary of updated hotels:");
const parishCounts = {};
updatedHotels.forEach(h => {
  parishCounts[h.parish] = (parishCounts[h.parish] || 0) + 1;
});
console.log("Parish counts:", parishCounts);

const frenteCount = updatedHotels.filter(h => h.tags.includes("Frente al Mar"));
console.log(`Hotels with 'Frente al Mar': ${frenteCount.length}`);
frenteCount.forEach(h => {
  console.log(`  - [${h.id}] "${h.name}" (${h.parish}) -> coords: [${h.lat}, ${h.lng}], addr: "${h.address}"`);
});

fs.writeFileSync("./scratch/updated_hotels.json", JSON.stringify(updatedHotels, null, 2), "utf-8");
console.log("\nSaved to scratch/updated_hotels.json");

