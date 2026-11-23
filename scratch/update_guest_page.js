import fs from "fs";

let content = fs.readFileSync("src/GuestPage.tsx", "utf-8");

// Update counts in MANTA_PARROQUIAS_OFICIALES
content = content.replace(
  /\{ name: "Tarqui", query: "Tarqui", type: "Parroquia Urbana", desc: "Playa de Tarqui, hotelería y comercio tradicional", count: \d+, icon: "🏖️" \}/,
  '{ name: "Tarqui", query: "Tarqui", type: "Parroquia Urbana", desc: "Playa de Tarqui, hotelería y comercio tradicional", count: 16, icon: "🏖️" }'
);
content = content.replace(
  /\{ name: "Los Esteros", query: "Los Esteros", type: "Parroquia Urbana", desc: "Zona costera, hoteles y playas del norte", count: \d+, icon: "🌊" \}/,
  '{ name: "Los Esteros", query: "Los Esteros", type: "Parroquia Urbana", desc: "Zona costera, hoteles y playas del norte", count: 21, icon: "🌊" }'
);
content = content.replace(
  /\{ name: "San Mateo", query: "San Mateo", type: "Parroquia Urbana", desc: "Puerto pesquero artesanal, acantilados y surf", count: \d+, icon: "⛵" \}/,
  '{ name: "San Mateo", query: "San Mateo", type: "Parroquia Urbana", desc: "Puerto pesquero artesanal, acantilados y surf", count: 2, icon: "⛵" }'
);
content = content.replace(
  /\{ name: "Santa Marianita", query: "Santa Marianita", type: "Parroquia Rural", desc: "Capital del kitesurf del Ecuador y playa amplia", count: \d+, icon: "🪁" \}/,
  '{ name: "Santa Marianita", query: "Santa Marianita", type: "Parroquia Rural", desc: "Capital del kitesurf del Ecuador y playa amplia", count: 7, icon: "🪁" }'
);
content = content.replace(
  /\{ name: "San Lorenzo", query: "San Lorenzo", type: "Parroquia Rural", desc: "Reserva Marina de Pacoche, El Faro y senderos", count: \d+, icon: "🌿" \}/,
  '{ name: "San Lorenzo", query: "San Lorenzo", type: "Parroquia Rural", desc: "Reserva Marina de Pacoche, El Faro y senderos", count: 3, icon: "🌿" }'
);
content = content.replace(
  /\{ name: "Eloy Alfaro", query: "Eloy Alfaro", type: "Parroquia Urbana", desc: "Sector residencial y comercial del cantón", count: \d+, icon: "🏘️" \}/,
  '{ name: "Eloy Alfaro", query: "Eloy Alfaro", type: "Parroquia Urbana", desc: "Sector residencial y comercial del cantón", count: 1, icon: "🏘️" }'
);

// Update DESTINATIONS
content = content.replace(
  /\{ city: "Manta - Barbasquillo", img: "[^"]+", hotels: \d+, type: "Playa & Zona Hotelera" \}/,
  '{ city: "Manta - Barbasquillo", img: "https://images.unsplash.com/photo-1563629986-97c92e385f66?w=400&h=300&fit=crop&auto=format", hotels: 28, type: "Playa & Zona Hotelera" }'
);
content = content.replace(
  /\{ city: "Manta - El Murciélago", img: "[^"]+", hotels: \d+, type: "Playa Urbana & Malecón" \}/,
  '{ city: "Manta - El Murciélago", img: "https://images.unsplash.com/photo-1563273410-ca16d83b2cce?w=400&h=300&fit=crop&auto=format", hotels: 26, type: "Playa Urbana & Malecón" }'
);
content = content.replace(
  /\{ city: "Manta - Tarqui", img: "[^"]+", hotels: \d+, type: "Parroquia Urbana" \}/,
  '{ city: "Manta - Tarqui", img: "https://images.unsplash.com/photo-1704908327293-82e8a6026450?w=400&h=300&fit=crop&auto=format", hotels: 16, type: "Parroquia Urbana" }'
);
content = content.replace(
  /\{ city: "Manta - Santa Marianita", img: "[^"]+", hotels: \d+, type: "Parroquia Rural · Kitesurf" \}/,
  '{ city: "Manta - Santa Marianita", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&auto=format", hotels: 7, type: "Parroquia Rural · Kitesurf" }'
);
content = content.replace(
  /\{ city: "Manta - San Mateo", img: "[^"]+", hotels: \d+, type: "Parroquia Urbana · Surf" \}/,
  '{ city: "Manta - San Mateo", img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400&h=300&fit=crop&auto=format", hotels: 2, type: "Parroquia Urbana · Surf" }'
);
content = content.replace(
  /\{ city: "Manta - Los Esteros", img: "[^"]+", hotels: \d+, type: "Parroquia Urbana" \}/,
  '{ city: "Manta - Los Esteros", img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop&auto=format", hotels: 21, type: "Parroquia Urbana" }'
);
content = content.replace(
  /\{ city: "Manta - San Lorenzo", img: "[^"]+", hotels: \d+, type: "Parroquia Rural · Pacoche" \}/,
  '{ city: "Manta - San Lorenzo", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format", hotels: 3, type: "Parroquia Rural · Pacoche" }'
);
content = content.replace(
  /\{ city: "Manta - Eloy Alfaro", img: "[^"]+", hotels: \d+, type: "Parroquia Urbana" \}/,
  '{ city: "Manta - Eloy Alfaro", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&auto=format", hotels: 1, type: "Parroquia Urbana" }'
);

fs.writeFileSync("src/GuestPage.tsx", content, "utf-8");
console.log("Updated GuestPage.tsx successfully!");

