import re

with open('src/mantaHotels.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Define landmark types and data to inject right before MANTA_HOTELS
landmarks_code = '''
export interface MantaLandmark {
  id: string;
  name: string;
  shortName: string;
  category: "aeropuerto" | "terminal" | "playa" | "centro" | "mall" | "deportes";
  lat: number;
  lng: number;
  icon: string;
  desc: string;
  badge: string;
}

export const MANTA_LANDMARKS: MantaLandmark[] = [
  {
    id: "aeropuerto-manta",
    name: "Aeropuerto Internacional Eloy Alfaro (MEC)",
    shortName: "Aeropuerto MEC",
    category: "aeropuerto",
    lat: -0.9500,
    lng: -80.6800,
    icon: "✈️",
    desc: "Terminal aérea de Manta en Los Esteros. Vuelos nacionales e internacionales.",
    badge: "Conectividad Aérea"
  },
  {
    id: "terminal-terrestre",
    name: "Terminal Terrestre Luis Valdivieso Morán",
    shortName: "Terminal El Palmar",
    category: "terminal",
    lat: -0.9645,
    lng: -80.6830,
    icon: "🚌",
    desc: "Terminal terrestre principal de Manta en El Palmar, conectando con todo el país.",
    badge: "Buses Interprovinciales"
  },
  {
    id: "playa-el-murcielago",
    name: "Playa El Murciélago & Malecón Escénico",
    shortName: "Playa El Murciélago",
    category: "playa",
    lat: -0.9440,
    lng: -80.7330,
    icon: "🏖️",
    desc: "Playa urbana ícono de Manta con malecón escénico, aguas mansas y coctelería marina.",
    badge: "Playa Principal"
  },
  {
    id: "mall-del-pacifico",
    name: "Mall del Pacífico & Zona Bancaria",
    shortName: "Mall del Pacífico",
    category: "mall",
    lat: -0.9485,
    lng: -80.7290,
    icon: "🛍️",
    desc: "El centro comercial más moderno de Manabí, cines, bancos y restaurantes en Av. Malecón.",
    badge: "Compras & Negocios"
  },
  {
    id: "centro-plaza-civica",
    name: "Centro Histórico & Plaza Cívica",
    shortName: "Centro de Manta",
    category: "centro",
    lat: -0.9500,
    lng: -80.7220,
    icon: "🏙️",
    desc: "Casco comercial de Manta, comercio tradicional, mercado de artesanías y puerto.",
    badge: "Comercio & Puerto"
  },
  {
    id: "playa-santa-marianita",
    name: "Playa Santa Marianita (Kitesurf)",
    shortName: "Santa Marianita",
    category: "deportes",
    lat: -0.9980,
    lng: -80.8375,
    icon: "🪁",
    desc: "Playa abierta con viento constante privilegiado, capital del kitesurf del Ecuador.",
    badge: "Kitesurf & Viento"
  },
  {
    id: "puerto-san-mateo",
    name: "Puerto Pesquero & Ensenada de San Mateo",
    shortName: "San Mateo (Surf)",
    category: "deportes",
    lat: -0.9625,
    lng: -80.8065,
    icon: "🏄",
    desc: "Pueblo marinero tradicional, miradores sobre acantilados y la mejor ola izquierda para surf.",
    badge: "Surf & Puerto Pesquero"
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function formatDistanceString(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    const mins = Math.max(1, Math.round(km * 12));
    return `${meters} m (${mins} min a pie)`;
  }
  const mins = Math.max(2, Math.round(km * 1.8));
  return `${km} km (${mins} min)`;
}
'''

# Check if MANTA_LANDMARKS is already in code
if 'export const MANTA_LANDMARKS' not in code:
    insert_target = 'export const MANTA_HOTELS: Hotel[] = ['
    idx = code.find(insert_target)
    if idx != -1:
        code = code[:idx] + landmarks_code + '\n' + code[idx:]
        print('Injected MANTA_LANDMARKS successfully')

# Update real coordinates for key hotels:
# 1. Oro Verde
code = re.sub(
    r'("id":\s*"hotel-oro-verde"[\s\S]*?"lat":\s*)-?[\d\.]+([\s\S]*?"lng":\s*)-?[\d\.]+',
    r'\g<1>-0.9452\g<2>-80.7328',
    code,
    count=1
)
# Update Oro Verde address
code = code.replace('"Malecón Escénico y Calle 23, Playa El Murciélago"', '"Malecón Jaime Chávez Gutiérrez y Calle 23, Frente a Playa El Murciélago"')

# 2. Mantahost Hotel
code = re.sub(
    r'("id":\s*"mantahost-hotel"[\s\S]*?"lat":\s*)-?[\d\.]+([\s\S]*?"lng":\s*)-?[\d\.]+',
    r'\g<1>-0.9444\g<2>-80.7490',
    code,
    count=1
)
code = code.replace('"Av. Malecón Jaime Chávez Gutiérrez y Calle 28"', '"Km 1.5 Vía a Barbasquillo (Frente al Mar)"')

# 3. Voyager Manta
code = re.sub(
    r'("id":\s*"hotel-voyager-manta"[\s\S]*?"lat":\s*)-?[\d\.]+([\s\S]*?"lng":\s*)-?[\d\.]+',
    r'\g<1>-0.9495\g<2>-80.7265',
    code,
    count=1
)

with open('src/mantaHotels.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated mantaHotels.ts with real landmarks and coordinates!')
