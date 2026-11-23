// ─── Catálogo Oficial Completo de Alojamientos de Manta (Consolidado 2026) ─────────────
// 116 establecimientos registrados oficialmente ante el Ministerio de Turismo y GAD Manta

export interface RoomOffer {
  id: string;
  type: string; // Tipo de Habitación (Ej: "1 Cama King Size Frente al Mar", "1 Cama Queen Matrimonial")
  beds: string; // Especificación de camas (Ej: "1 Cama King Size (2x2m)", "2 Camas Twin")
  capacity: number;
  size: number;
  pricePerNight: number;
  originalPrice?: number;
  image: string;
  amenities: string[];
  available: number;
  breakfastIncluded?: boolean;
  stopSell?: boolean;
}

export interface HotelPaymentConfig {
  cardEnabled: boolean;
  cardProvider?: "DATAFAST" | "KUSHKI" | "PLACETOPAY";
  cardMerchantId?: string;
  payphoneEnabled: boolean;
  payphoneStoreId?: string;
  deunaEnabled: boolean;
  deunaAccount?: string;
  transferEnabled: boolean;
  receptionEnabled: boolean;
  transferInstructions?: string;
}

export interface Hotel {
  id: string;
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  classification?: string; // "HOTEL" | "HOSTAL" | "HOSTERÍA"
  category?: string; // "5 Estrellas", "4 Estrellas", "3 Estrellas", "2 Estrellas", "1 Estrella"
  parroquia?: string;
  parish?: string;
  sector?: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  image: string;
  gallery?: string[];
  rating: number;
  reviews: number;
  priceFrom: number;
  tags: string[];
  amenities: string[];
  description: string;
  distance: string;
  gravaServicio10?: boolean;
  phone: string;
  email?: string;
  taxId: string;
  razonSocial?: string;
  codigoSucursal?: string;
  owner?: string;
  regNumber?: string;
  licenciaLuaf?: string;
  claveCatastral?: string;
  horaCheckIn?: string;
  horaCheckOut?: string;
  diasCancelacionGratuita?: number;
  modeloCobroPlataforma?: "CONVENIO_SIN_COBRO" | "COMISION_POR_RESERVA" | "MENSUAL_POR_HABITACION" | "HIBRIDO";
  codigoConvenio?: string;
  fechaInicioConvenio?: string;
  fechaFinConvenio?: string;
  porcentajeComisionConvenio?: number;
  porcentajeComisionPostConvenio?: number;
  tarifaMensualPorHabitacion?: number;
  modeloCobroHuesped?: "PAGO_DIRECTO_HOTEL" | "PAGO_EN_RECEPCION" | "MIXTO";
  paymentConfig?: HotelPaymentConfig;
  bancoAcreditacion?: string;
  tipoCuentaBancaria?: "CORRIENTE" | "AHORROS";
  numeroCuentaBancaria?: string;
  titularCuentaBancaria?: string;
  status?: "active" | "paused" | "pending";
  rooms: RoomOffer[];
}

import type { MyReservation } from "./features/reservations/types";
export type { MyReservation } from "./features/reservations/types";


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

export interface HotelDetailedDistances {
  centro: { km: number; label: string };
  playa: { km: number; label: string; name: string };
  mall: { km: number; label: string };
  aeropuerto: { km: number; label: string };
  terminal: { km: number; label: string };
}

export function getHotelDetailedDistances(lat?: number, lng?: number): HotelDetailedDistances {
  const safeLat = lat ?? -0.9520;
  const safeLng = lng ?? -80.7250;

  // Centro de Manta (Plaza Cívica & Malecón)
  const dCentro = calculateDistanceKm(safeLat, safeLng, -0.9500, -80.7220);

  // Playas de Manta
  const dMurcielago = calculateDistanceKm(safeLat, safeLng, -0.9440, -80.7330);
  const dTarqui = calculateDistanceKm(safeLat, safeLng, -0.9565, -80.7080);
  const dMarianita = calculateDistanceKm(safeLat, safeLng, -0.9980, -80.8375);
  const dSanMateo = calculateDistanceKm(safeLat, safeLng, -0.9625, -80.8065);
  const dSanLorenzo = calculateDistanceKm(safeLat, safeLng, -1.0632, -80.9035);

  const playas = [
    { name: "Playa Murciélago", km: dMurcielago },
    { name: "Playa Tarqui", km: dTarqui },
    { name: "Playa Santa Marianita", km: dMarianita },
    { name: "Playa San Mateo", km: dSanMateo },
    { name: "Playa San Lorenzo", km: dSanLorenzo },
  ].sort((a, b) => a.km - b.km);

  const closestPlaya = playas[0];

  // Centro Comercial más cercano: Mall del Pacífico (-0.9485, -80.7290)
  const dMall = calculateDistanceKm(safeLat, safeLng, -0.9485, -80.7290);

  // Aeropuerto Internacional Eloy Alfaro MEC (-0.9500, -80.6800)
  const dAeropuerto = calculateDistanceKm(safeLat, safeLng, -0.9500, -80.6800);

  // Terminal Terrestre El Palmar (-0.9645, -80.6830)
  const dTerminal = calculateDistanceKm(safeLat, safeLng, -0.9645, -80.6830);

  return {
    centro: { km: dCentro, label: formatDistanceString(dCentro) },
    playa: { km: closestPlaya.km, label: formatDistanceString(closestPlaya.km), name: closestPlaya.name },
    mall: { km: dMall, label: formatDistanceString(dMall) },
    aeropuerto: { km: dAeropuerto, label: formatDistanceString(dAeropuerto) },
    terminal: { km: dTerminal, label: formatDistanceString(dTerminal) },
  };
}

export const MANTA_HOTELS: Hotel[] = [
  {
    "id": "hotel-voyager-manta",
    "name": "Hotel Voyager Manta",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "Calle 24-A, M2, S/N (A una cuadra del Mall del Pacifico, diagonal al karaoke Candela)",
    "lat": -0.9495,
    "lng": -80.7265,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format",
    "rating": 4,
    "reviews": 80,
    "priceFrom": 45,
    "tags": [
      "Frente al Mar",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.2km de aeropuerto · 🚌 5.1km de terminal",
    "gravaServicio10": true,
    "phone": "0968817854",
    "taxId": "0103405833001",
    "owner": "De Cian Opitz Robert",
    "regNumber": "0103405833001.001.2002132",
    "rooms": [
      {
        "id": "hotel-voyager-manta-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-voyager-manta-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-voyager-manta-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-el-naufrago",
    "name": "Hostal el Naufrago",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "AV CARACOL Y AV. 42, AV.43, S/N (DIAGONAL A LA CLINICA MANADIALISIS)",
    "lat": -0.95082,
    "lng": -80.734554,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 52,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 6.1km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": false,
    "phone": "0995000437",
    "taxId": "0200508570001",
    "owner": "Gavilanes Gutierrez Luis Alberto",
    "regNumber": "0200508570001.001.2011200",
    "rooms": [
      {
        "id": "hostal-el-naufrago-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-el-naufrago-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-el-naufrago-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-el-naufrago-2",
    "name": "Hostal el Naufrago 2",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AV. 113, CALLE 117, S/N (DIAGONAL A INDUSTRIAS ALES)",
    "lat": -0.956978,
    "lng": -80.751305,
    "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 69,
    "priceFrom": 34,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "0995000437",
    "taxId": "0200508570001",
    "owner": "Gavilanes Gutierrez Luis Alberto",
    "regNumber": "0200508570001.002.2011539",
    "rooms": [
      {
        "id": "hostal-el-naufrago-2-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-el-naufrago-2-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-el-naufrago-2-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "mare-s-m-hostal",
    "name": "Mare S&M Hostal",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Los Gavilanes, Calle Principal, Vía a Colegio Talentos, S/N (Calle principal de los Gavilanes (Jesús de Nazareth), A 300 metros de la iglesia Sagrado Corazón)",
    "lat": -0.953269,
    "lng": -80.732878,
    "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 149,
    "priceFrom": 60,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "0962596059",
    "taxId": "0603073776001",
    "owner": "Santamaria Philco Alex Andres",
    "regNumber": "0603073776001.001.2000581",
    "rooms": [
      {
        "id": "mare-s-m-hostal-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "mare-s-m-hostal-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "mare-s-m-hostal-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-la-gran-familia",
    "name": "Hostal la Gran Familia",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.9548,
    "lng": -80.690624,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 103,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.9km de playa · ✈️ 1.3km de aeropuerto · 🚌 1.4km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "0700777592001",
    "owner": "Coronel Valarezo Fanny Rosa Aurora",
    "regNumber": "0700777592001.008.2015132",
    "rooms": [
      {
        "id": "hostal-la-gran-familia-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-la-gran-familia-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-la-gran-familia-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "black-white",
    "name": "Black & White",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "calle principal, calle secundarias, 6 (FRENTE AL TERMINAL TERRESTRE)",
    "lat": -0.957943,
    "lng": -80.688498,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 120,
    "priceFrom": 18,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.2km de playa · ✈️ 1.3km de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "052381056",
    "taxId": "0802757294001",
    "owner": "Zambrano Quiroz Freddy Jhonny",
    "regNumber": "0802757294001.007.5000119",
    "rooms": [
      {
        "id": "black-white-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "black-white-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "black-white-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-zambayas",
    "name": "Hostal Zambayas",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.955062,
    "lng": -80.686417,
    "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 137,
    "priceFrom": 20,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.3km de playa · ✈️ 900m de aeropuerto · 🚌 1.1km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "0802757294001",
    "owner": "Zambrano Quiroz Freddy Jhonny",
    "regNumber": "0802757294001.008.2014586",
    "rooms": [
      {
        "id": "hostal-zambayas-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-zambayas-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-zambayas-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 21,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-los-esteros",
    "name": "Hostal los Esteros",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "AV. 104, CALLE 121 Y 122, S/N (DIAGONAL A LA FARMACIA SANTA MARTHA)",
    "lat": -0.956767,
    "lng": -80.684182,
    "image": "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 154,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.6km de playa · ✈️ 900m de aeropuerto · 🚌 900m de terminal",
    "gravaServicio10": false,
    "phone": "0987751701",
    "taxId": "0803059245001",
    "owner": "Cabeza Bazan Yolanda Emerita",
    "regNumber": "0803059245001.002.2011540",
    "rooms": [
      {
        "id": "hostal-los-esteros-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-los-esteros-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-los-esteros-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-premier-inn",
    "name": "Hostal Premier Inn",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "107, AV. 105, 108 (ATRAS DE LA IGLESIA NUESTRA SEÑORA DEL ROSARIO)",
    "lat": -0.954212,
    "lng": -80.713158,
    "image": "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 171,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 3.7km de aeropuerto · 🚌 3.5km de terminal",
    "gravaServicio10": false,
    "phone": "0959112984",
    "taxId": "0904994795001",
    "owner": "Mantuano Anchundia Carmen Bernaldina",
    "regNumber": "0904994795001.001.2011196",
    "rooms": [
      {
        "id": "hostal-premier-inn-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-premier-inn-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-premier-inn-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "pikeiro-blue",
    "name": "Pikeiro Blue",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "AV. OLIVA MIRANDA, TERCERA TRANSVERSAL, SOLAR 13, 14 Y 15 (ATRAS DE LA GASOLINERA MOVIL.)",
    "lat": -0.955244,
    "lng": -80.682109,
    "image": "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 188,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.8km de playa · ✈️ 600m de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "052381932",
    "taxId": "0913279089001",
    "owner": "Mendoza Cedeño Edison Antonio",
    "regNumber": "0913279089001.001.2003235",
    "rooms": [
      {
        "id": "pikeiro-blue-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "pikeiro-blue-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "pikeiro-blue-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-san-lorenzo",
    "name": "Hostal San Lorenzo",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "SAN LORENZO",
    "parish": "San Lorenzo",
    "city": "Manta - San Lorenzo (Pacoche)",
    "address": "AV. MALECON, Malecón, S/N (ATRAS DEL CEMENTERIO)",
    "lat": -1.0628,
    "lng": -80.9035,
    "image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 205,
    "priceFrom": 18,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - San Lorenzo (Faro y Reserva), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 23.1km de playa · ✈️ 27.8km de aeropuerto · 🚌 26.8km de terminal",
    "gravaServicio10": false,
    "phone": "0991995331",
    "taxId": "0921306098001",
    "owner": "Montalvan Acosta Pedro Isidoro",
    "regNumber": "0921306098001.002.2011092",
    "rooms": [
      {
        "id": "hostal-san-lorenzo-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-san-lorenzo-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-san-lorenzo-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hosteria-el-bosque",
    "name": "Hostería el Bosque",
    "stars": 3,
    "classification": "Hostería",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "VIA SAN LORENZO SECTOR BOSQUE DE PACOCHE",
    "lat": -0.952093,
    "lng": -80.733595,
    "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 83,
    "priceFrom": 50,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostería - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 6.0km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "0927852277001",
    "owner": "Cerda Castillo Rolando Guillermo",
    "regNumber": "0927852277001.001.7002579",
    "rooms": [
      {
        "id": "hosteria-el-bosque-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hosteria-el-bosque-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hosteria-el-bosque-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-marina-breeze",
    "name": "Hotel Marina Breeze",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.955284,
    "lng": -80.710934,
    "image": "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 106,
    "priceFrom": 55,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.8km de playa · ✈️ 3.5km de aeropuerto · 🚌 3.3km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "0950683375001",
    "owner": "Hidalgo Velasquez Edy Eduardo",
    "regNumber": "0950683375001.002.2015111",
    "rooms": [
      {
        "id": "hotel-marina-breeze-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 55,
        "originalPrice": 64,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-marina-breeze-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 41,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-marina-breeze-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 74,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "the-lookout-hostel",
    "name": "The Lookout Hostel",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "SAN LORENZO",
    "parish": "San Lorenzo",
    "city": "Manta - San Lorenzo (Pacoche)",
    "address": "calle bella vista, calle malecon, 0000 (ingresar al malecon de san lorenzo por la primera entrada a la izquierda, despues girar hacia la derecha y se encontra el hotel a mano derecha)",
    "lat": -1.0636,
    "lng": -80.9042,
    "image": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=500&fit=crop&auto=format",
    "rating": 4.2,
    "reviews": 129,
    "priceFrom": 60,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - San Lorenzo (Faro y Reserva), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 23.2km de playa · ✈️ 27.9km de aeropuerto · 🚌 26.9km de terminal",
    "gravaServicio10": false,
    "phone": "0981929871",
    "taxId": "0959920927001",
    "owner": "Armstrong George",
    "regNumber": "0959920927001.001.2003064",
    "rooms": [
      {
        "id": "the-lookout-hostel-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "the-lookout-hostel-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "the-lookout-hostel-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-la-gaviota-dorada-de-manta",
    "name": "Hostal la Gaviota Dorada de Manta",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "12, 23, s/n (Calle 12 avenida 23 sector la dolorosa Manta.)",
    "lat": -0.959425,
    "lng": -80.751046,
    "image": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 93,
    "priceFrom": 40,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "0999704674",
    "taxId": "0961914934001",
    "owner": "Oliveira Macias Jhonny Albino",
    "regNumber": "0961914934001.002.2001842",
    "rooms": [
      {
        "id": "hostal-la-gaviota-dorada-de-manta-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-la-gaviota-dorada-de-manta-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-la-gaviota-dorada-de-manta-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-malania",
    "name": "Hostal Malania",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "VIA MANTA MONTECRISTI, DIAGONAL AL HOSPITAL IESS MANT, S/N (ATRAS DEL CENTRO DE CAPACITACION CECAP)",
    "lat": -0.957845,
    "lng": -80.679703,
    "image": "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&h=500&fit=crop&auto=format",
    "rating": 4.5,
    "reviews": 175,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 6.1km de playa · ✈️ 900m de aeropuerto · 🚌 800m de terminal",
    "gravaServicio10": false,
    "phone": "0983181664",
    "taxId": "0963198379001",
    "owner": "Marquez Marquez Massiel Katherine",
    "regNumber": "0963198379001.001.2001820",
    "rooms": [
      {
        "id": "hostal-malania-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-malania-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-malania-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-canarias",
    "name": "Hostal Canarias",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "CALLE 30, AV FLAVIO REYES, AV FLAVIO REYES (PASANDO EL EDIFICIO PLATINIUM ENFRENTE DEL EDIFICIO PUNTA ARENA)",
    "lat": -0.959239,
    "lng": -80.751273,
    "image": "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=500&fit=crop&auto=format",
    "rating": 4.3,
    "reviews": 198,
    "priceFrom": 50,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": true,
    "phone": "0984256348",
    "taxId": "0963925045001",
    "owner": "Muentes Mera Victor Yandry",
    "regNumber": "0963925045001.001.2001911",
    "rooms": [
      {
        "id": "hostal-canarias-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hostal-canarias-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-canarias-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-intiquilla",
    "name": "Hostal Intiquilla",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "LOTIZACIÓN LOS ESTEROS, LA TRAVESIA, LOTES 54 (LA TRAVESIA SANTA MARIANITA)",
    "lat": -0.9955,
    "lng": -80.8375,
    "image": "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 221,
    "priceFrom": 55,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.0km de playa · ✈️ 18.2km de aeropuerto · 🚌 17.5km de terminal",
    "gravaServicio10": false,
    "phone": "0989617726",
    "taxId": "0964994115001",
    "owner": "Mamane Naomi",
    "regNumber": "0964994115001.001.2002928",
    "rooms": [
      {
        "id": "hostal-intiquilla-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 55,
        "originalPrice": 64,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-intiquilla-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 41,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-intiquilla-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 74,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "mantahost-hotel",
    "name": "Mantahost Hotel",
    "stars": 5,
    "classification": "Hotel",
    "category": "5 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "VIA BARBASQUILLO, SN, S/N (A LADO DEL EDIFICIO PEÑON DEL MAR)",
    "lat": -0.9444,
    "lng": -80.7490,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop&auto=format",
    "rating": 4.5,
    "reviews": 366,
    "priceFrom": 145,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h",
      "Gimnasio & Spa",
      "Acceso directo a playa",
      "Salones de eventos",
      "Concierge"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 5 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.8km de playa · ✈️ 7.7km de aeropuerto · 🚌 7.7km de terminal",
    "gravaServicio10": true,
    "phone": "0967600540",
    "taxId": "0991429360001",
    "owner": "Manhost S.A.",
    "regNumber": "0991429360001.002.2000384",
    "rooms": [
      {
        "id": "mantahost-hotel-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 58,
        "pricePerNight": 145,
        "originalPrice": 166,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "mantahost-hotel-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 43,
        "pricePerNight": 123,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "mantahost-hotel-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 45,
        "pricePerNight": 127,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-porto-velho",
    "name": "Hotel Porto Velho",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "U11, Vía barbasquillo, Lote 10 11 y 12 (Atrás hotel hamilton)",
    "lat": -0.95338,
    "lng": -80.732664,
    "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 178,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "0999366644",
    "taxId": "0992669780001",
    "owner": "Servicios E Inmobiliaria Ata&far S.A.",
    "regNumber": "0992669780001.002.7002570",
    "rooms": [
      {
        "id": "hotel-porto-velho-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-porto-velho-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-porto-velho-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-sail-plaza-manta",
    "name": "Hotel Sail Plaza Manta",
    "stars": 5,
    "classification": "Hotel",
    "category": "5 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "VIA A BARBASQUILLO KM 1,7, VIA A BARBASQUILLO, 000 (KM 1,7 DE LA VIA A BARBASQUILLO, A UNA CUADRA DEL CENTRO COMERCIAL LA QUADRA)",
    "lat": -0.957685,
    "lng": -80.751624,
    "image": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 440,
    "priceFrom": 175,
    "tags": [
      "Frente al Mar",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h",
      "Gimnasio & Spa",
      "Acceso directo a playa",
      "Salones de eventos",
      "Concierge"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 5 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.7km de terminal",
    "gravaServicio10": true,
    "phone": "0999542857",
    "taxId": "0992855592001",
    "owner": "Fideicomiso Mercantil Hotel Sail Plaza Manta Ecuador",
    "regNumber": "0992855592001.002.2001345",
    "rooms": [
      {
        "id": "hotel-sail-plaza-manta-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 58,
        "pricePerNight": 175,
        "originalPrice": 201,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-sail-plaza-manta-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 43,
        "pricePerNight": 148,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-sail-plaza-manta-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 45,
        "pricePerNight": 154,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "goldenmar",
    "name": "Goldenmar",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "AV. M - 1, CALLE 24, S/N (FRENTE AL EDIFICIO SANTORINI)",
    "lat": -0.952099,
    "lng": -80.731667,
    "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=500&fit=crop&auto=format",
    "rating": 4,
    "reviews": 313,
    "priceFrom": 50,
    "tags": [
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.7km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": false,
    "phone": "052620113",
    "taxId": "1002180394001",
    "owner": "Miño Jativa Mario Javier",
    "regNumber": "1002180394001.001.2011087",
    "rooms": [
      {
        "id": "goldenmar-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "goldenmar-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "goldenmar-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "pacifico",
    "name": "Pacifico",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AV. 106 101 Y CALLE 101 Y 102",
    "lat": -0.951032,
    "lng": -80.72418,
    "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 49,
    "priceFrom": 34,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.3km de playa · ✈️ 4.9km de aeropuerto · 🚌 4.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1300071402001",
    "owner": "Vallejo Escobar Pedro Vicente",
    "regNumber": "1300071402001.001.7002568",
    "rooms": [
      {
        "id": "pacifico-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "pacifico-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "pacifico-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "maria-jose",
    "name": "Maria Jose",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "FLAVIO REYES Y CALLE 29 #110 *B/ UMIÑA",
    "lat": -0.952723,
    "lng": -80.73411,
    "image": "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=500&fit=crop&auto=format",
    "rating": 4.3,
    "reviews": 109,
    "priceFrom": 60,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 6.0km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1300165410001",
    "owner": "Espinoza Barcia Marcos Eduardo",
    "regNumber": "1300165410001.001.7008805",
    "rooms": [
      {
        "id": "maria-jose-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "maria-jose-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "maria-jose-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "jacintita",
    "name": "Jacintita",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "CALLE 8, AV 7, S/N (alado del portal de Fanny alado del edificio de las oficinas del IESS)",
    "lat": -0.956939,
    "lng": -80.749478,
    "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 83,
    "priceFrom": 26,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.3km de playa · ✈️ 7.8km de aeropuerto · 🚌 7.4km de terminal",
    "gravaServicio10": false,
    "phone": "0988850850",
    "taxId": "1300414156001",
    "owner": "Palma Franco Edith Yolanda",
    "regNumber": "1300414156001.002.2000964",
    "rooms": [
      {
        "id": "jacintita-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "jacintita-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "jacintita-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "leo-hotel",
    "name": "Leo Hotel",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "AVDA 24 DE MAYO Y AVDA 9 ESQ",
    "lat": -0.953902,
    "lng": -80.732276,
    "image": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 100,
    "priceFrom": 28,
    "tags": [
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.1km de playa · ✈️ 5.8km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1300630330001",
    "owner": "Guanoluisa Guanoluisa Leonidas",
    "regNumber": "1300630330001.004.7008806",
    "rooms": [
      {
        "id": "leo-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "leo-hotel-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "leo-hotel-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-torres-del-norte",
    "name": "Hotel Torres del Norte",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "calle 306, av 113, av113 (Tarqui- Manta calle 306 y Ave.113 torres del Norte Apart Hotel)",
    "lat": -0.954,
    "lng": -80.709077,
    "image": "https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 117,
    "priceFrom": 31,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.9km de playa · ✈️ 3.3km de aeropuerto · 🚌 3.1km de terminal",
    "gravaServicio10": false,
    "phone": "0983970718",
    "taxId": "1301845341001",
    "owner": "Mendoza Pinargote Ramon Vicente",
    "regNumber": "1301845341001.001.2001834",
    "rooms": [
      {
        "id": "hotel-torres-del-norte-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-torres-del-norte-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-torres-del-norte-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-la-tortuga",
    "name": "Hostal la Tortuga",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "SAN LORENZO",
    "parish": "San Lorenzo",
    "city": "Manta - San Lorenzo (Pacoche)",
    "address": "LA CASCADA, AV. SAN LORENZO, S/N (DIAGONAL AL ESTADIO SAN LORENZO)",
    "lat": -1.0642,
    "lng": -80.9038,
    "image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 134,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - San Lorenzo (Faro y Reserva), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 23.2km de playa · ✈️ 27.9km de aeropuerto · 🚌 26.9km de terminal",
    "gravaServicio10": false,
    "phone": "0988841580",
    "taxId": "1302014756001",
    "owner": "Triviño Montalvan Digna Landi",
    "regNumber": "1302014756001.002.2011118",
    "rooms": [
      {
        "id": "hostal-la-tortuga-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-la-tortuga-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-la-tortuga-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-perlamar",
    "name": "Hostal Perlamar",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "AV. 23, CALLE 20, S/N (A LADO DEL DEPOSITO DE MADERA SANTA MARIANITA)",
    "lat": -0.959417,
    "lng": -80.75154,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 151,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.7km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "0985323753",
    "taxId": "1302486046001",
    "owner": "Paredes Saltos Jenny Monserrate",
    "regNumber": "1302486046001.002.5000199",
    "rooms": [
      {
        "id": "hostal-perlamar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-perlamar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-perlamar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-los-cactus",
    "name": "Hostal los Cactus",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Vía Manta Jaramijo, Divino Niño, LOTE 56 (A LADO DE LA PARRILLADA EL GUSO FRENTE URB. LOS ALMENDROS)",
    "lat": -0.954971,
    "lng": -80.693396,
    "image": "https://images.unsplash.com/photo-1510414842594-a61752afb894?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 168,
    "priceFrom": 40,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.6km de playa · ✈️ 1.6km de aeropuerto · 🚌 1.6km de terminal",
    "gravaServicio10": false,
    "phone": "0980938147",
    "taxId": "1302606627001",
    "owner": "Bravo Moreira Nexar Antonio",
    "regNumber": "1302606627001.001.2001391",
    "rooms": [
      {
        "id": "hostal-los-cactus-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-los-cactus-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-los-cactus-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "maryormar",
    "name": "Maryormar",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "VILLAMARINA MZ V4 LOTE 05",
    "lat": -0.950759,
    "lng": -80.72259,
    "image": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 185,
    "priceFrom": 18,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.7km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1303415739001",
    "owner": "Mendoza Moreira Marcelina",
    "regNumber": "1303415739001.001.7001535",
    "rooms": [
      {
        "id": "maryormar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "maryormar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "maryormar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-hamilton",
    "name": "Hotel Hamilton",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "CDLA. UNIVERSITARIA",
    "lat": -0.950748,
    "lng": -80.7346,
    "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 397,
    "priceFrom": 82,
    "tags": [
      "WiFi Alta Velocidad",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 6.1km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "1303479826001",
    "owner": "Lopez Alonzo Hamilton Nery",
    "regNumber": "1303479826001.001.7007718",
    "rooms": [
      {
        "id": "hotel-hamilton-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 82,
        "originalPrice": 94,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-hamilton-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 69,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-hamilton-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 72,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "mar-y-tierra",
    "name": "Mar y Tierra",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "AV. FLAVIO REYES Y CALLE 29",
    "lat": -0.958049,
    "lng": -80.750878,
    "image": "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 316,
    "priceFrom": 55,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "1303501033001",
    "owner": "Peña Hidalgo Narcisa Clara",
    "regNumber": "1303501033001.001.7007229",
    "rooms": [
      {
        "id": "mar-y-tierra-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 55,
        "originalPrice": 64,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "mar-y-tierra-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 41,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "mar-y-tierra-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 74,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "maria-fernanda",
    "name": "Maria Fernanda",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "CALLE 23 Y AV. CIRCUNVALACION Y FLAVIO REYES",
    "lat": -0.952507,
    "lng": -80.732934,
    "image": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 56,
    "priceFrom": 37,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1303591422001",
    "owner": "Alvia Reyes Antonio Eduardo",
    "regNumber": "1303591422001.001.7008801",
    "rooms": [
      {
        "id": "maria-fernanda-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "maria-fernanda-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "maria-fernanda-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "playa-murcielago",
    "name": "Playa Murcielago",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "CALLE 27 AV. FLAVIO REYES",
    "lat": -0.951317,
    "lng": -80.723142,
    "image": "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 73,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1303652547001",
    "owner": "Alava Avila Mercy Morayma Jazmine",
    "regNumber": "1303652547001.001.7001530",
    "rooms": [
      {
        "id": "playa-murcielago-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "playa-murcielago-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "playa-murcielago-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-plata-de-mar",
    "name": "Hostal Plata de Mar",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "AV 103, CALLE 113 Y 114, 589 (FRENTE AL MERCADO DE LOS ESTEROS)",
    "lat": -0.9548,
    "lng": -80.690677,
    "image": "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800&h=500&fit=crop&auto=format",
    "rating": 4,
    "reviews": 135,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.9km de playa · ✈️ 1.3km de aeropuerto · 🚌 1.4km de terminal",
    "gravaServicio10": false,
    "phone": "0991176789",
    "taxId": "1303756934001",
    "owner": "Soledispa Mero Pastora Soledad",
    "regNumber": "1303756934001.002.2011056",
    "rooms": [
      {
        "id": "hostal-plata-de-mar-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-plata-de-mar-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-plata-de-mar-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-mi-kasa",
    "name": "Hostal Mi Kasa",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "C.12 VIA SAN MATEO",
    "lat": -0.959624,
    "lng": -80.750139,
    "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 107,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.5km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1304035684001",
    "owner": "Loor Cevallos Patricia Asuncion",
    "regNumber": "1304035684001.001.7008803",
    "rooms": [
      {
        "id": "hostal-mi-kasa-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-mi-kasa-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-mi-kasa-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "del-mar",
    "name": "Del Mar",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "CALLE 104 AVE. 105 ESQ.",
    "lat": -0.95082,
    "lng": -80.733598,
    "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 124,
    "priceFrom": 22,
    "tags": [
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 6.0km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1304309915001",
    "owner": "Gonzembach Pinoargote Grace Gina",
    "regNumber": "1304309915001.002.7008808",
    "rooms": [
      {
        "id": "del-mar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "del-mar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "del-mar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "rosa-mar",
    "name": "Rosa Mar",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "Av. 4 de noviembre, Calle 320, Calle 319 (<p>Diagonal a la consecionaria JAC frente a ala farmacia Cruz Azul</p>)",
    "lat": -0.958122,
    "lng": -80.749505,
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 141,
    "priceFrom": 24,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.4km de playa · ✈️ 7.8km de aeropuerto · 🚌 7.4km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1304572165001",
    "owner": "Arteaga Zambrano Rosa Teresa",
    "regNumber": "1304572165001.001.7001522",
    "rooms": [
      {
        "id": "rosa-mar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "rosa-mar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "rosa-mar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "avellan",
    "name": "Avellan",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "CALLE 3 Y AV. 3 VÍA SAN MATEO CIUDADELA MEDITERRANEO",
    "lat": -0.953857,
    "lng": -80.731912,
    "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 158,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.1km de playa · ✈️ 5.8km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1304923038001",
    "owner": "Avellan Zambrano Jorge Luis",
    "regNumber": "1304923038001.002.7007245",
    "rooms": [
      {
        "id": "avellan-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "avellan-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "avellan-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "cabanas-las-velas",
    "name": "Cabañas las Velas",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "102, AVENIDA 105, S/N (FRENTE AL PARQUE BOYS SCOUTS)",
    "lat": -0.955749,
    "lng": -80.70738,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 175,
    "priceFrom": 28,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.1km de playa · ✈️ 3.1km de aeropuerto · 🚌 2.9km de terminal",
    "gravaServicio10": false,
    "phone": "0982264746",
    "taxId": "1304989526001",
    "owner": "Cedeño Vega Laura Jessenia",
    "regNumber": "1304989526001.001.2010917",
    "rooms": [
      {
        "id": "cabanas-las-velas-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "cabanas-las-velas-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "cabanas-las-velas-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-oceanik",
    "name": "Hotel Oceanik",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952267,
    "lng": -80.732143,
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 192,
    "priceFrom": 31,
    "tags": [
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.8km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1305272187001",
    "owner": "Cevallos Cedeño Amantilia Monserrate",
    "regNumber": "1305272187001.004.2015221",
    "rooms": [
      {
        "id": "hotel-oceanik-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-oceanik-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-oceanik-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-manakin",
    "name": "Hostal Manakin",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952877,
    "lng": -80.723181,
    "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 209,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.5km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1305966838001",
    "owner": "Vera Marchan Eddie Fernando",
    "regNumber": "1305966838001.002.2014932",
    "rooms": [
      {
        "id": "hostal-manakin-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-manakin-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-manakin-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-malecon-blue",
    "name": "Hostal Malecon Blue",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "108, AV. 101, S/N (A UNA CUADRA DE PICANTERIA EL MARINO Y PLAZA DEL MAR)",
    "lat": -0.957686,
    "lng": -80.705166,
    "image": "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 46,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.4km de playa · ✈️ 2.9km de aeropuerto · 🚌 2.6km de terminal",
    "gravaServicio10": false,
    "phone": "0997681388",
    "taxId": "1306112101001",
    "owner": "Flores Franco Carmen Maritza",
    "regNumber": "1306112101001.001.2011108",
    "rooms": [
      {
        "id": "hostal-malecon-blue-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-malecon-blue-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-malecon-blue-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-manakin-45",
    "name": "Hostal Manakin",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "20, AV. 12, S/N (ATRAS DEL CC MALL DEL PACIFCO Y CERCA A LAS OFICINAS DE TVCABLE)",
    "lat": -0.957678,
    "lng": -80.749373,
    "image": "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=500&fit=crop&auto=format",
    "rating": 4.3,
    "reviews": 92,
    "priceFrom": 65,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.4km de playa · ✈️ 7.8km de aeropuerto · 🚌 7.4km de terminal",
    "gravaServicio10": true,
    "phone": "042620413",
    "taxId": "1306112911001",
    "owner": "Vera Marchan Eduardo Antonio",
    "regNumber": "1306112911001.001.2011465",
    "rooms": [
      {
        "id": "hostal-manakin-45-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 65,
        "originalPrice": 76,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hostal-manakin-45-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 48,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-manakin-45-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 87,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "manta-airport-hotel",
    "name": "Manta Airport Hotel",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "AV MANTA ROCAFUERTE, PUERTO AEROPUERTO, LOTE 56 (FRENTE AL REDONDEL DEL AEROPUERTO DIAGONAL A GASOLINERA PRIMAX)",
    "lat": -0.956833,
    "lng": -80.688437,
    "image": "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 115,
    "priceFrom": 45,
    "tags": [
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.2km de playa · ✈️ 1.2km de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "052384045",
    "taxId": "1306375682001",
    "owner": "Velez Velez Lady Elizabeth",
    "regNumber": "1306375682001.001.2001272",
    "rooms": [
      {
        "id": "manta-airport-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "manta-airport-hotel-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "manta-airport-hotel-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "dorita",
    "name": "Dorita",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "CALLE 2 10 AVENIDA 5 (CONSULTORIO MEDICO DR. LEONARDO ZAMBRANO)",
    "lat": -0.955993,
    "lng": -80.686733,
    "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 97,
    "priceFrom": 20,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.3km de playa · ✈️ 1.0km de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1306882463001",
    "owner": "Garcia Monge Doris Edith",
    "regNumber": "1306882463001.001.7009733",
    "rooms": [
      {
        "id": "dorita-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "dorita-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "dorita-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 21,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-sisu",
    "name": "Hostal Sisu",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "PRINCIPAL, AV. UNIVERSITARIA, S/N (A los lados Plaza Kai)",
    "lat": -0.950268,
    "lng": -80.733126,
    "image": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 114,
    "priceFrom": 34,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 700m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "0985336661",
    "taxId": "1306887868001",
    "owner": "Cuaces Oviedo Rosa Elvira",
    "regNumber": "1306887868001.001.5000053",
    "rooms": [
      {
        "id": "hostal-sisu-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-sisu-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-sisu-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-paris",
    "name": "Hostal Paris",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "AV. OLIVA MIRANDA, ONOFRE DE GENNA, S/N (FRENTE AL HOTEL PIKEIRO BLUE)",
    "lat": -0.957404,
    "lng": -80.68391,
    "image": "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 131,
    "priceFrom": 37,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.7km de playa · ✈️ 900m de aeropuerto · 🚌 800m de terminal",
    "gravaServicio10": false,
    "phone": "052382698",
    "taxId": "1307112332001",
    "owner": "Zambrano Macias Kenia Marisol",
    "regNumber": "1307112332001.002.2011047",
    "rooms": [
      {
        "id": "hostal-paris-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-paris-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-paris-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "playa-imperial-hostal",
    "name": "Playa Imperial Hostal",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "108, AV. 103, S/N (A UNA CUADRA DE LA LUBRICADORA POPULAR)",
    "lat": -0.957524,
    "lng": -80.7145,
    "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 148,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 3.9km de aeropuerto · 🚌 3.6km de terminal",
    "gravaServicio10": false,
    "phone": "0995069031",
    "taxId": "1307382224001",
    "owner": "Lopez Feiz Magaly Guadalupe",
    "regNumber": "1307382224001.001.2014028",
    "rooms": [
      {
        "id": "playa-imperial-hostal-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "playa-imperial-hostal-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "playa-imperial-hostal-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-la-caida-del-sol",
    "name": "Hostal la Caida del Sol",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "CALLE PRINCIPAL, SD, SD (SITIO LA TRAVESIA)",
    "lat": -0.9975,
    "lng": -80.8378,
    "image": "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 165,
    "priceFrom": 18,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.1km de playa · ✈️ 18.3km de aeropuerto · 🚌 17.6km de terminal",
    "gravaServicio10": false,
    "phone": "0988085028",
    "taxId": "1307426682001",
    "owner": "Holguin Muentes Carmen Piedad",
    "regNumber": "1307426682001.002.2002913",
    "rooms": [
      {
        "id": "hostal-la-caida-del-sol-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-la-caida-del-sol-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-la-caida-del-sol-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-baumer",
    "name": "Hostal Baumer",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Vía Manta Rocafuerte km 41/2 calle principal2, Loma d Agencia de transito, SN (A UNA CUADRA DEL UPC)",
    "lat": -0.956399,
    "lng": -80.681764,
    "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 182,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.9km de playa · ✈️ 700m de aeropuerto · 🚌 900m de terminal",
    "gravaServicio10": false,
    "phone": "0993854100",
    "taxId": "1307763712001",
    "owner": "Garcia Mero Walter Ecuador",
    "regNumber": "1307763712001.006.2001957",
    "rooms": [
      {
        "id": "hostal-baumer-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-baumer-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-baumer-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "casa-umina",
    "name": "Casa Umiña",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "Avenida Flavio Reyes, Calle 32, S/N (A UNA CUADRA DE LA ESCUELA DE PESCA)",
    "lat": -0.959494,
    "lng": -80.752,
    "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 276,
    "priceFrom": 55,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.7km de playa · ✈️ 8.1km de aeropuerto · 🚌 7.7km de terminal",
    "gravaServicio10": true,
    "phone": "052620000",
    "taxId": "1307983179001",
    "owner": "Zambrano Arteaga Maria Magdalena",
    "regNumber": "1307983179001.001.7009762",
    "rooms": [
      {
        "id": "casa-umina-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 55,
        "originalPrice": 64,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "casa-umina-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 41,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "casa-umina-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 74,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-mayita",
    "name": "Hotel Mayita",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.954,
    "lng": -80.713125,
    "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 36,
    "priceFrom": 37,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 3.7km de aeropuerto · 🚌 3.5km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1308127222001",
    "owner": "Orama Quijije Jenny Mayra",
    "regNumber": "1308127222001.001.5000174",
    "rooms": [
      {
        "id": "hotel-mayita-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-mayita-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-mayita-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-brisas-del-pacifico-m-s",
    "name": "Hostal Brisas del Pacifico m.s.",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "103 Y 104, AV. 105, S/N (A LADO DEL HOTEL BOULEVARD)",
    "lat": -0.95457,
    "lng": -80.711097,
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 53,
    "priceFrom": 40,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.7km de playa · ✈️ 3.5km de aeropuerto · 🚌 3.3km de terminal",
    "gravaServicio10": false,
    "phone": "0994679801",
    "taxId": "1308360138001",
    "owner": "Lopez Tumbaco Silvia Alexandra",
    "regNumber": "1308360138001.004.2014192",
    "rooms": [
      {
        "id": "hostal-brisas-del-pacifico-m-s-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-brisas-del-pacifico-m-s-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-brisas-del-pacifico-m-s-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "jordan",
    "name": "Jordan",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "307 Y AV. 112, CIUDADELA ROCAFUERTE, SN (ATRAS DE LA MOLINERA)",
    "lat": -0.954828,
    "lng": -80.712614,
    "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 70,
    "priceFrom": 18,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 3.7km de aeropuerto · 🚌 3.5km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1308444916001",
    "owner": "De la Cruz Mendoza Jorge Luis",
    "regNumber": "1308444916001.002.7008907",
    "rooms": [
      {
        "id": "jordan-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "jordan-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "jordan-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-jordan-ii",
    "name": "Hostal Jordan II",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "CAlle 115 av 108, AV.108, SN (A UNA CUADRA DE LA UNIDAD EDUCATIVA LEONIE AVIAT)",
    "lat": -0.957646,
    "lng": -80.751697,
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 87,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.7km de terminal",
    "gravaServicio10": false,
    "phone": "0939573281",
    "taxId": "1308444916001",
    "owner": "De la Cruz Mendoza Jorge Luis",
    "regNumber": "1308444916001.004.2000298",
    "rooms": [
      {
        "id": "hostal-jordan-ii-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-jordan-ii-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-jordan-ii-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "veranera-hostal",
    "name": "Veranera Hostal",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "31, AV. FLAVIO REYES, S/N (A LADO DEL RESTAURANTE HORSE)",
    "lat": -0.950175,
    "lng": -80.731716,
    "image": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 104,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 700m de playa · ✈️ 5.7km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": false,
    "phone": "0992740863",
    "taxId": "1308660941001",
    "owner": "Vallejo Zambrano Maria Angelica",
    "regNumber": "1308660941001.002.2001733",
    "rooms": [
      {
        "id": "veranera-hostal-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "veranera-hostal-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "veranera-hostal-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-los-mantas-i",
    "name": "Hostal los Mantas I",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AV. 8, CALLE 13, S/N (DIAGONAL A LA IGLESIADE LA MERCED)",
    "lat": -0.952922,
    "lng": -80.723742,
    "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 121,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.9km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "0984929590",
    "taxId": "1308853553001",
    "owner": "Loor Achong Silvia Vanessa",
    "regNumber": "1308853553001.001.2011139",
    "rooms": [
      {
        "id": "hostal-los-mantas-i-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-los-mantas-i-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-los-mantas-i-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-costa-verde",
    "name": "Hostal Costa Verde",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "AV. 30, CALLE 24, 406 (ATRAS DE ALMACENES BOYACA)",
    "lat": -0.953467,
    "lng": -80.731313,
    "image": "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 138,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.1km de playa · ✈️ 5.7km de aeropuerto · 🚌 5.5km de terminal",
    "gravaServicio10": false,
    "phone": "052450535",
    "taxId": "1308853553001",
    "owner": "Loor Achong Silvia Vanessa",
    "regNumber": "1308853553001.004.2001336",
    "rooms": [
      {
        "id": "hostal-costa-verde-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-costa-verde-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-costa-verde-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-blue-pacific",
    "name": "Hostal Blue Pacific",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "AV. FLAVIO REYES Y CALLE 20",
    "lat": -0.959592,
    "lng": -80.750521,
    "image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 155,
    "priceFrom": 28,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.5km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1309064481001",
    "owner": "Davalos Andrade Nanci Cecilia",
    "regNumber": "1309064481001.001.7007242",
    "rooms": [
      {
        "id": "hostal-blue-pacific-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-blue-pacific-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-blue-pacific-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-araguaney",
    "name": "Hotel Araguaney",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "av 107, calle 103, S/N (* Cerca del antiguo Banco de Pacifico del centro comercial Tarqui&nbsp)",
    "lat": -0.954714,
    "lng": -80.708704,
    "image": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 172,
    "priceFrom": 31,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.0km de playa · ✈️ 3.2km de aeropuerto · 🚌 3.1km de terminal",
    "gravaServicio10": false,
    "phone": "0987202573",
    "taxId": "1309661054001",
    "owner": "Macias Arauz Gustavo Junior",
    "regNumber": "1309661054001.002.2001028",
    "rooms": [
      {
        "id": "hotel-araguaney-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-araguaney-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-araguaney-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-boulevard-1",
    "name": "Hotel Boulevard 1",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.955602,
    "lng": -80.706651,
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 189,
    "priceFrom": 34,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.2km de playa · ✈️ 3.0km de aeropuerto · 🚌 2.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1309661112001",
    "owner": "Hermida Intriago Cristhian Enrique",
    "regNumber": "1309661112001.004.2015173",
    "rooms": [
      {
        "id": "hotel-boulevard-1-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-boulevard-1-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-boulevard-1-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "tepools",
    "name": "Tepools",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.955896,
    "lng": -80.704611,
    "image": "https://images.unsplash.com/photo-1510414842594-a61752afb894?w=800&h=500&fit=crop&auto=format",
    "rating": 4,
    "reviews": 279,
    "priceFrom": 60,
    "tags": [
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.4km de playa · ✈️ 2.8km de aeropuerto · 🚌 2.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1309702288001",
    "owner": "Quiroz Ponce Celso Nazario",
    "regNumber": "1309702288001.005.2015209",
    "rooms": [
      {
        "id": "tepools-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "tepools-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "tepools-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "minotauro",
    "name": "Minotauro",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "VIA CIRCUNVALACION TRAMO 1",
    "lat": -0.958371,
    "lng": -80.751102,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 43,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1309902771001",
    "owner": "Pico Arteaga Fabricio Daniel",
    "regNumber": "1309902771001.999.7008811",
    "rooms": [
      {
        "id": "minotauro-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "minotauro-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "minotauro-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-piazolla",
    "name": "Hostal Piazolla",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "CIENTO DIEZ, AV. MARIA AUXILIADORA, S/N (DIAGONAL A LA CLINICA SAN GREGORIO)",
    "lat": -0.956287,
    "lng": -80.67957,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 60,
    "priceFrom": 28,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 6.1km de playa · ✈️ 700m de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "0990927132",
    "taxId": "1310227275001",
    "owner": "De la Cruz Carreño Viviana Alexandra",
    "regNumber": "1310227275001.004.2013350",
    "rooms": [
      {
        "id": "hostal-piazolla-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-piazolla-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-piazolla-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-old-navy",
    "name": "Hotel Old Navy",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.954,
    "lng": -80.7145,
    "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 77,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.3km de playa · ✈️ 3.9km de aeropuerto · 🚌 3.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1310314057001",
    "owner": "Mendoza Guanoluisa Evelyn Carolina",
    "regNumber": "1310314057001.003.2015481",
    "rooms": [
      {
        "id": "hotel-old-navy-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-old-navy-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-old-navy-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "san-roque-hostal",
    "name": "San Roque Hostal",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "VIA MANTA ROCAFUERTE, calle 407, LOTE 8 MZ A (A 200 METROS DE LA SUBESTACION ELECTRICA DIAGONAL a SEGURILLANTA)",
    "lat": -0.957047,
    "lng": -80.693303,
    "image": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 94,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.6km de playa · ✈️ 1.7km de aeropuerto · 🚌 1.4km de terminal",
    "gravaServicio10": false,
    "phone": "0982588184",
    "taxId": "1310355944001",
    "owner": "Cedeño Bermudez Roque Ivan",
    "regNumber": "1310355944001.003.2002352",
    "rooms": [
      {
        "id": "san-roque-hostal-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "san-roque-hostal-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "san-roque-hostal-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-yormari",
    "name": "Hotel Yormari",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "19, AV. 14, S/N (ATRAS DE HOTEL CABAÑAS BALANDRAS)",
    "lat": -0.957041,
    "lng": -80.751399,
    "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 144,
    "priceFrom": 60,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": true,
    "phone": "052624375",
    "taxId": "1310412935001",
    "owner": "Merchan Ponce Roberto Carlos",
    "regNumber": "1310412935001.001.7001586",
    "rooms": [
      {
        "id": "hotel-yormari-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-yormari-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-yormari-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-internacional-del-pacifico",
    "name": "Hostal Internacional del Pacifico",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "AVENIDA 106, CALLE 101, 1 (Frente a Parque Pescador)",
    "lat": -0.955365,
    "lng": -80.713035,
    "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 128,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 3.7km de aeropuerto · 🚌 3.5km de terminal",
    "gravaServicio10": false,
    "phone": "0999520844",
    "taxId": "1311435018001",
    "owner": "Vallejo Calderon Pedro Vicente",
    "regNumber": "1311435018001.001.2013339",
    "rooms": [
      {
        "id": "hostal-internacional-del-pacifico-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-internacional-del-pacifico-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-internacional-del-pacifico-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-porto-alegre",
    "name": "Hostal Porto Alegre",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "Avenida 35, Calle 27, S/N (Frente Restaurante Finisterre)",
    "lat": -0.952514,
    "lng": -80.722872,
    "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 145,
    "priceFrom": 18,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.5km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.6km de terminal",
    "gravaServicio10": false,
    "phone": "0988685949",
    "taxId": "1311772139001",
    "owner": "Cañarte Mero Maria Jasmin",
    "regNumber": "1311772139001.001.7001567",
    "rooms": [
      {
        "id": "hostal-porto-alegre-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-porto-alegre-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-porto-alegre-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "habitaciones-sky",
    "name": "Habitaciones Sky",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.95284,
    "lng": -80.733315,
    "image": "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?w=800&h=500&fit=crop&auto=format",
    "rating": 4.5,
    "reviews": 213,
    "priceFrom": 50,
    "tags": [
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1311847907001",
    "owner": "Lara Ponce Karla Ximena",
    "regNumber": "1311847907001.001.2015426",
    "rooms": [
      {
        "id": "habitaciones-sky-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "habitaciones-sky-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "habitaciones-sky-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "luz-de-aurora-hotel",
    "name": "Luz de Aurora Hotel",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "ELOY ALFARO",
    "parish": "Eloy Alfaro",
    "city": "Manta - Eloy Alfaro",
    "address": "AV. 113, CALLE U 3, VILLA 23 (Cada LA AURORA, A LADO DEL ALMACEN ZURITA)",
    "lat": -0.968,
    "lng": -80.686,
    "image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 179,
    "priceFrom": 34,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Eloy Alfaro, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.9km de playa · ✈️ 2.1km de aeropuerto · 🚌 500m de terminal",
    "gravaServicio10": false,
    "phone": "0962794352",
    "taxId": "1313413013001",
    "owner": "Loor Cedeño Marlon Ariolfo",
    "regNumber": "1313413013001.001.5000017",
    "rooms": [
      {
        "id": "luz-de-aurora-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "luz-de-aurora-hotel-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "luz-de-aurora-hotel-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostalcabana-punta-la-barca",
    "name": "Hostalcabaña Punta la Barca",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "SANTA MARIANITA, VÍA A LIGUIQUI, S/N (A TRECIENTOS METROS DE LAS ANTENAS DE CLARO Y MOVISTAR.)",
    "lat": -0.9995,
    "lng": -80.8372,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb92b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 196,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.1km de playa · ✈️ 18.3km de aeropuerto · 🚌 17.6km de terminal",
    "gravaServicio10": false,
    "phone": "0959839180",
    "taxId": "1313591370001",
    "owner": "Vera Delgado Juan Andres",
    "regNumber": "1313591370001.001.2013080",
    "rooms": [
      {
        "id": "hostalcabana-punta-la-barca-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostalcabana-punta-la-barca-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostalcabana-punta-la-barca-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-la-pinta",
    "name": "Hostal la Pinta",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.954,
    "lng": -80.710945,
    "image": "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 213,
    "priceFrom": 40,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.7km de playa · ✈️ 3.5km de aeropuerto · 🚌 3.3km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1314685171001",
    "owner": "Macias Peñarrieta Michelle Jamilet",
    "regNumber": "1314685171001.003.2014330",
    "rooms": [
      {
        "id": "hostal-la-pinta-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-la-pinta-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-la-pinta-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-amelia-de-la-rosa",
    "name": "Hostal Amelia de la Rosa",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "CALLE 39, 136, LOTES 1 2 (URB LAS ORQUIDEAS MZ-A LOTES 1,2 Y 3 LOS ESTEROS)",
    "lat": -0.956721,
    "lng": -80.690942,
    "image": "https://images.unsplash.com/photo-1471922694855-fa59acdb3605?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 305,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.9km de playa · ✈️ 1.4km de aeropuerto · 🚌 1.2km de terminal",
    "gravaServicio10": false,
    "phone": "0980872928",
    "taxId": "1315075885001",
    "owner": "Macias Arauz Gustavo Adolfo",
    "regNumber": "1315075885001.002.2011013",
    "rooms": [
      {
        "id": "hostal-amelia-de-la-rosa-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-amelia-de-la-rosa-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-amelia-de-la-rosa-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-las-orquideas",
    "name": "Hostal las Orquideas",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.955591,
    "lng": -80.688366,
    "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 67,
    "priceFrom": 20,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.1km de playa · ✈️ 1.1km de aeropuerto · 🚌 1.2km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1315728533001",
    "owner": "Cahuasqui Arauz Mario Fabian",
    "regNumber": "1315728533001.002.2015148",
    "rooms": [
      {
        "id": "hostal-las-orquideas-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-las-orquideas-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-las-orquideas-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 21,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-los-tres-reyes",
    "name": "Hostal los Tres Reyes",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.956214,
    "lng": -80.68624,
    "image": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 84,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.4km de playa · ✈️ 1.0km de aeropuerto · 🚌 1.0km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1315728905001",
    "owner": "De la Cruz Alarcon Nataly Yuleisy",
    "regNumber": "1315728905001.002.2015471",
    "rooms": [
      {
        "id": "hostal-los-tres-reyes-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-los-tres-reyes-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-los-tres-reyes-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-porlamar",
    "name": "Hostal Porlamar",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "28, AV. 35, S/N (DIAGONAL AL HOSTAL PORTO ALEGRE)",
    "lat": -0.951476,
    "lng": -80.723283,
    "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 101,
    "priceFrom": 37,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "0998146634",
    "taxId": "1350113237001",
    "owner": "Muentes Cañarte Luz Jazmin",
    "regNumber": "1350113237001.001.2014084",
    "rooms": [
      {
        "id": "hostal-porlamar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-porlamar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-porlamar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-oromar",
    "name": "Hostal Oromar",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952219,
    "lng": -80.731299,
    "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=500&fit=crop&auto=format",
    "rating": 4.3,
    "reviews": 147,
    "priceFrom": 65,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.7km de aeropuerto · 🚌 5.5km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1351080062001",
    "owner": "Muñoz Machacury Bianca Jhulley",
    "regNumber": "1351080062001.003.2015682",
    "rooms": [
      {
        "id": "hostal-oromar-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 65,
        "originalPrice": 76,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-oromar-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 48,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-oromar-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 87,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-oro-verde",
    "name": "Hotel Oro Verde",
    "stars": 5,
    "classification": "Hotel",
    "category": "5 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "Av. Malecon, Calle 23, S/N (Frente al Mall del Pacifico)",
    "lat": -0.9452,
    "lng": -80.7328,
    "image": "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 410,
    "priceFrom": 165,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Frente al Mar",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h",
      "Gimnasio & Spa",
      "Acceso directo a playa",
      "Salones de eventos",
      "Concierge"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 5 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 100m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": true,
    "phone": "0967098031",
    "taxId": "1390142389001",
    "owner": "Mantaoro Hotelera Manta S.A.",
    "regNumber": "1390142389001.001.2000206",
    "rooms": [
      {
        "id": "hotel-oro-verde-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 58,
        "pricePerNight": 165,
        "originalPrice": 189,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-oro-verde-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 43,
        "pricePerNight": 140,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-oro-verde-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 45,
        "pricePerNight": 145,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-perla-spondylus",
    "name": "Hotel Perla Spondylus",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "avenida 3, calle 15, sn (<p>Frente al colegio Stella Maris</p>)",
    "lat": -0.952297,
    "lng": -80.73229,
    "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 447,
    "priceFrom": 82,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.8km de aeropuerto · 🚌 5.6km de terminal",
    "gravaServicio10": true,
    "phone": "052613074",
    "taxId": "1391739680001",
    "owner": "Joima S. A.",
    "regNumber": "1391739680001.002.7008798",
    "rooms": [
      {
        "id": "hotel-perla-spondylus-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 82,
        "originalPrice": 94,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-perla-spondylus-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 69,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-perla-spondylus-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 72,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "balandra-hotel",
    "name": "Balandra Hotel",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AV. 7, CALLE 20, S/N (A UNA CUADRA DEL MALECON ESCENICO DE MANTA)",
    "lat": -0.952805,
    "lng": -80.72451,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format",
    "rating": 4.8,
    "reviews": 484,
    "priceFrom": 89,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 5.0km de aeropuerto · 🚌 4.8km de terminal",
    "gravaServicio10": true,
    "phone": "052625550",
    "taxId": "1391764944001",
    "owner": "Hotel Cabañas Balandra S.A.",
    "regNumber": "1391764944001.001.2000220",
    "rooms": [
      {
        "id": "balandra-hotel-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 89,
        "originalPrice": 102,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "balandra-hotel-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 75,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "balandra-hotel-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 78,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-villakite",
    "name": "Hotel Villakite",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "Malecón Santa Marianita, Malecón, S/N (FRENTE AL MAR)",
    "lat": -1.0015,
    "lng": -80.8369,
    "image": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=500&fit=crop&auto=format",
    "rating": 4.2,
    "reviews": 239,
    "priceFrom": 60,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.2km de playa · ✈️ 18.4km de aeropuerto · 🚌 17.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1391765983001",
    "owner": "Ecuadorkitesurf S.A.",
    "regNumber": "1391765983001.001.7009701",
    "rooms": [
      {
        "id": "hotel-villakite-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hotel-villakite-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-villakite-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-aquamarina",
    "name": "Hotel Aquamarina",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Via al Aeropuerto - Sector El Palmar, Via Manta Rocafuerte, sn (FRENTE A LA GASOLINERA MASGAS)",
    "lat": -0.957379,
    "lng": -80.684265,
    "image": "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.7,
    "reviews": 558,
    "priceFrom": 103,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.6km de playa · ✈️ 900m de aeropuerto · 🚌 800m de terminal",
    "gravaServicio10": true,
    "phone": "05-500-260",
    "taxId": "1391837879001",
    "owner": "Fishturismo S.A.",
    "regNumber": "1391837879001.001.7010862",
    "rooms": [
      {
        "id": "hotel-aquamarina-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 103,
        "originalPrice": 118,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-aquamarina-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 87,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-aquamarina-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 90,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-poseidon",
    "name": "Hotel Poseidon",
    "stars": 5,
    "classification": "Hotel",
    "category": "5 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "PRINCIPAL, A LADO DE HOTEL MANTAHOST, S/N (DIAGONAL AL HOTEL MANTA HOST)",
    "lat": -0.953152,
    "lng": -80.731383,
    "image": "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 595,
    "priceFrom": 175,
    "tags": [
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h",
      "Gimnasio & Spa",
      "Acceso directo a playa",
      "Salones de eventos",
      "Concierge"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 5 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 5.7km de aeropuerto · 🚌 5.5km de terminal",
    "gravaServicio10": true,
    "phone": "055002800",
    "taxId": "1391844697001",
    "owner": "Fiallo & Fiallo Servicios Hoteleros Fhs S.A.",
    "regNumber": "1391844697001.001.2014233",
    "rooms": [
      {
        "id": "hotel-poseidon-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 58,
        "pricePerNight": 175,
        "originalPrice": 201,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-poseidon-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 43,
        "pricePerNight": 148,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-poseidon-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 45,
        "pricePerNight": 154,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "navio-hotel",
    "name": "Navio Hotel",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "U10, B, S/N (FRENTE A LA URBANIZACION PORTAL DEL SOL)",
    "lat": -0.959715,
    "lng": -80.750041,
    "image": "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 182,
    "priceFrom": 82,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.5km de terminal",
    "gravaServicio10": true,
    "phone": "056053146",
    "taxId": "1391883714001",
    "owner": "Nefamavi S.A.",
    "regNumber": "1391883714001.001.2001996",
    "rooms": [
      {
        "id": "navio-hotel-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 82,
        "originalPrice": 94,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "navio-hotel-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 69,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "navio-hotel-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 72,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "manta-mar-hotel",
    "name": "Manta Mar Hotel",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Av 24, Flavio Reyes, s/n (frente a almacenes Colineal)",
    "lat": -0.953839,
    "lng": -80.733311,
    "image": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 81,
    "priceFrom": 55,
    "tags": [
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.1km de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "0987624519",
    "taxId": "1391922914001",
    "owner": "Hoteleria y Turismo del Ecuador, Turiscuador S.A.",
    "regNumber": "1391922914001.001.2001558",
    "rooms": [
      {
        "id": "manta-mar-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 55,
        "originalPrice": 64,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "manta-mar-hotel-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 41,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "manta-mar-hotel-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 74,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "playa-mar-hotel",
    "name": "Playa Mar Hotel",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "CALLE 19, AVENIDA 12, SN (A DOS CUADRAS DE PLAYA MURCIELAGO)",
    "lat": -0.95898,
    "lng": -80.750822,
    "image": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 91,
    "priceFrom": 37,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "0999394798",
    "taxId": "1391922914001",
    "owner": "Hoteleria y Turismo del Ecuador, Turiscuador S.A.",
    "regNumber": "1391922914001.002.2011640",
    "rooms": [
      {
        "id": "playa-mar-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "playa-mar-hotel-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "playa-mar-hotel-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-internacional",
    "name": "Hostal Internacional",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "CALLE UMIÑA, AVENIDA MARIA AUXILIADORA, s/n (REDONDEL AEROPUERTO)",
    "lat": -0.957747,
    "lng": -80.682093,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 108,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 5.9km de playa · ✈️ 900m de aeropuerto · 🚌 800m de terminal",
    "gravaServicio10": false,
    "phone": "0986233099",
    "taxId": "1391931923001",
    "owner": "Interdelacruz S.A.",
    "regNumber": "1391931923001.001.5000114",
    "rooms": [
      {
        "id": "hostal-internacional-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-internacional-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-internacional-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "stella-blu",
    "name": "Stella Blu",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AVENIDA UNIVERSITARIA 7, AVENIDA UNIVERSITARIA 4, SN (CIUDADELA UNIVERSITARIA SECTOR BARBASQUILLO)",
    "lat": -0.950921,
    "lng": -80.723004,
    "image": "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 125,
    "priceFrom": 28,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "0992373460",
    "taxId": "1391932704001",
    "owner": "Stellablu S.A.S.",
    "regNumber": "1391932704001.001.2013369",
    "rooms": [
      {
        "id": "stella-blu-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "stella-blu-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "stella-blu-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "puerto-manta-hostal",
    "name": "Puerto Manta Hostal",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "AVENIDA 7, CALLE 18, S/N (DIAGONAL AL HOTEL CABAÑAS BALANDRA)",
    "lat": -0.953263,
    "lng": -80.734456,
    "image": "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 142,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 6.1km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": false,
    "phone": "0939518473",
    "taxId": "1391935426001",
    "owner": "Mantaportcruz S.A.S.",
    "regNumber": "1391935426001.001.2013379",
    "rooms": [
      {
        "id": "puerto-manta-hostal-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "puerto-manta-hostal-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "puerto-manta-hostal-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-santa-fe",
    "name": "Hotel Santa Fe",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "16 Y 17, AVENIDA 23, 17 (A LADO DE LA COMPANIIA FABICON)",
    "lat": -0.957048,
    "lng": -80.750444,
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 159,
    "priceFrom": 34,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.4km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.5km de terminal",
    "gravaServicio10": false,
    "phone": "0984865545",
    "taxId": "1391935852001",
    "owner": "Santa Fe Hotel Servicios y Alojamiento S.A.S.",
    "regNumber": "1391935852001.001.2014137",
    "rooms": [
      {
        "id": "hotel-santa-fe-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-santa-fe-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-santa-fe-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "manta-surf-hotel",
    "name": "Manta Surf Hotel",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "AV 11, CALLE 19, AV 10 (POR EL CLUB DE NUTRICION CORDOVA ANDRES QUIJIJE)",
    "lat": -0.95209,
    "lng": -80.732937,
    "image": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=500&fit=crop&auto=format",
    "rating": 4.3,
    "reviews": 219,
    "priceFrom": 60,
    "tags": [
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "0978687322",
    "taxId": "1391935987001",
    "owner": "Surf Hotel S.A.S.",
    "regNumber": "1391935987001.001.2013356",
    "rooms": [
      {
        "id": "manta-surf-hotel-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "manta-surf-hotel-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "manta-surf-hotel-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "soga-corp",
    "name": "Soga Corp",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -1.003,
    "lng": -80.8376,
    "image": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 242,
    "priceFrom": 65,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.4km de playa · ✈️ 18.5km de aeropuerto · 🚌 17.7km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "1391936408001",
    "owner": "Soga Corp S.A.S.",
    "regNumber": "1391936408001.001.2014921",
    "rooms": [
      {
        "id": "soga-corp-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 65,
        "originalPrice": 76,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "soga-corp-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 48,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "soga-corp-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 87,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "d-marv",
    "name": "D'marv",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "SAN MATEO",
    "parish": "San Mateo",
    "city": "Manta - San Mateo",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.9632,
    "lng": -80.8068,
    "image": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.6,
    "reviews": 265,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - San Mateo (Puerto y Playas), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 8.5km de playa · ✈️ 14.2km de aeropuerto · 🚌 13.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1391936934001",
    "owner": "Oasismanaba S.A.S.",
    "regNumber": "1391936934001.002.2014348",
    "rooms": [
      {
        "id": "d-marv-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "d-marv-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "d-marv-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-mar-azul",
    "name": "Hotel Mar Azul",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "AV. 22, FLAVIO REYES, TRAS DEL MALL DEL PACIFICO (INSTALACIONES DEL HOTEL MAR AZUL)",
    "lat": -0.956954,
    "lng": -80.750478,
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 288,
    "priceFrom": 50,
    "tags": [
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.4km de playa · ✈️ 7.9km de aeropuerto · 🚌 7.5km de terminal",
    "gravaServicio10": true,
    "phone": "0986994342",
    "taxId": "1391937207001",
    "owner": "Marazulmanta S.A.S.",
    "regNumber": "1391937207001.001.2014310",
    "rooms": [
      {
        "id": "hotel-mar-azul-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-mar-azul-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-mar-azul-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-dsh",
    "name": "Hotel DSH",
    "stars": 4,
    "classification": "Hotel",
    "category": "4 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952543,
    "lng": -80.73362,
    "image": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop&auto=format",
    "rating": 4.8,
    "reviews": 589,
    "priceFrom": 89,
    "tags": [
      "Cerca de la Playa",
      "WiFi Alta Velocidad",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 4 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 6.0km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "1391938892001",
    "owner": "Servicios Hoteleros Select",
    "regNumber": "1391938892001.001.2015252",
    "rooms": [
      {
        "id": "hotel-dsh-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 54,
        "pricePerNight": 89,
        "originalPrice": 102,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-dsh-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 40,
        "pricePerNight": 75,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-dsh-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 42,
        "pricePerNight": 78,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-rishuo",
    "name": "Hotel Rishuo",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "MALECON, AV COLON, sn (ENTRANDO POR EL MALECON DE SANTA MARIANITA FRENTE AL MAR A MANO IZQUIERDA, A LADO DEL BARRIO EL PESCADOR - HOTEL RISHUO)",
    "lat": -1.0045,
    "lng": -80.8371,
    "image": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=500&fit=crop&auto=format",
    "rating": 4,
    "reviews": 84,
    "priceFrom": 60,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.4km de playa · ✈️ 18.5km de aeropuerto · 🚌 17.7km de terminal",
    "gravaServicio10": true,
    "phone": "0981187445",
    "taxId": "1704444544001",
    "owner": "Ulloa Garcia Jaime Cristobal",
    "regNumber": "1704444544001.004.2001799",
    "rooms": [
      {
        "id": "hotel-rishuo-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 60,
        "originalPrice": 70,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "hotel-rishuo-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 45,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-rishuo-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 81,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-d-marios",
    "name": "Hostal D'marios",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "Av.3, calle primera y segunda, villa 9 (Ciudadela el Palmar diagonal a la iglesia del Palmar por la entrada de la farmacia Santa Martha)",
    "lat": -0.957533,
    "lng": -80.679842,
    "image": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 98,
    "priceFrom": 40,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 6.1km de playa · ✈️ 800m de aeropuerto · 🚌 900m de terminal",
    "gravaServicio10": false,
    "phone": "0979447833",
    "taxId": "1704768330001",
    "owner": "Cahuasqui Tapia Mario Giovanny",
    "regNumber": "1704768330001.001.2003243",
    "rooms": [
      {
        "id": "hostal-d-marios-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-d-marios-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-d-marios-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hoteles-manta-real",
    "name": "Hoteles Manta Real",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "Avenida 24, calle 17, esquina (desde el Aeropuerto Internacional Eloy Alfaro avanza por la via puerto- aeropuerto pasa por el terminal terrestre, el mercado de mariscos (Playita Mia), pasa frente a Tarqui hasta el puente a desnivel gira a la derecha por la via Malecón hasta calle 15 donde gira a la izquierda sube la 15 hasta avenida 24 y gira a la derecha 2 cuadras hasta llegar a la calle 17 esquina, alli queda el edificio del Hotel Manta Real. color crema con tomate.)",
    "lat": -0.959554,
    "lng": -80.751298,
    "image": "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 115,
    "priceFrom": 28,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.7km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "052450332",
    "taxId": "1706464748001",
    "owner": "Mosquera Mackenzie Fernando Eduardo",
    "regNumber": "1706464748001.002.2000830",
    "rooms": [
      {
        "id": "hoteles-manta-real-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hoteles-manta-real-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hoteles-manta-real-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-antares",
    "name": "Hostal Antares",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "CALLE 29, AV. FLAVIO REYES, 109 (ATRAS DEL EDIFICIO PLATINIUM)",
    "lat": -0.950736,
    "lng": -80.734008,
    "image": "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 132,
    "priceFrom": 31,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 6.0km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": false,
    "phone": "0991429275",
    "taxId": "1706520267001",
    "owner": "Montenegro Ayora Claudia Gissel",
    "regNumber": "1706520267001.002.2003094",
    "rooms": [
      {
        "id": "hostal-antares-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 31,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-antares-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-antares-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 32,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-oro-y-mar",
    "name": "Hostal Oro y Mar",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "AV.24 Y CALLE 17",
    "lat": -0.952079,
    "lng": -80.724036,
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 149,
    "priceFrom": 22,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.3km de playa · ✈️ 4.9km de aeropuerto · 🚌 4.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1708156672001",
    "owner": "Cadena Morán Pamela René",
    "regNumber": "1708156672001.999.7008816",
    "rooms": [
      {
        "id": "hostal-oro-y-mar-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 22,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-oro-y-mar-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-oro-y-mar-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 23,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-timon-del-shaddai",
    "name": "Hostal Timon del Shaddai",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.950991,
    "lng": -80.733056,
    "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 166,
    "priceFrom": 24,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1708283302001",
    "owner": "Tinitana Ludeña Meri Janet",
    "regNumber": "1708283302001.006.2014413",
    "rooms": [
      {
        "id": "hostal-timon-del-shaddai-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-timon-del-shaddai-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 17,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-timon-del-shaddai-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 25,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "blanjop",
    "name": "Blanjop",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "LOS ESTEROS",
    "parish": "Los Esteros",
    "city": "Manta - Los Esteros",
    "address": "CIUDADELA EL PALMAR, ENTRADA PRINCIPAL, 15-16 (A TREINTA METROS DE LA IGLESIA MARIA INMACULADA)",
    "lat": -0.9548,
    "lng": -80.693018,
    "image": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 183,
    "priceFrom": 26,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Los Esteros, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 4.6km de playa · ✈️ 1.5km de aeropuerto · 🚌 1.6km de terminal",
    "gravaServicio10": false,
    "phone": "0995185426",
    "taxId": "1711443182001",
    "owner": "Paredes Mieles Jose Miguel",
    "regNumber": "1711443182001.001.2011100",
    "rooms": [
      {
        "id": "blanjop-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "blanjop-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "blanjop-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-stockholm-suites",
    "name": "Hostal Stockholm Suites.",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952276,
    "lng": -80.732937,
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 200,
    "priceFrom": 28,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 900m de playa · ✈️ 5.9km de aeropuerto · 🚌 5.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1711555399001",
    "owner": "Zambrano Alcivar Cielo Dineis",
    "regNumber": "1711555399001.002.2014608",
    "rooms": [
      {
        "id": "hostal-stockholm-suites-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-stockholm-suites-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-stockholm-suites-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 29,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-jireh",
    "name": "Hostal Jireh",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Centro Comercial",
    "address": "calle 8, av 9, sn (DIAGONAL A LAS OFICINAS DEL IESS)",
    "lat": -0.951395,
    "lng": -80.72322,
    "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 37,
    "priceFrom": 20,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - Centro Comercial, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.4km de playa · ✈️ 4.8km de aeropuerto · 🚌 4.7km de terminal",
    "gravaServicio10": false,
    "phone": "052699633",
    "taxId": "1715202634001",
    "owner": "Sandoval Tinitana Stefany Scarleth",
    "regNumber": "1715202634001.001.2001717",
    "rooms": [
      {
        "id": "hostal-jireh-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 20,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-jireh-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 15,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-jireh-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 21,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-milan",
    "name": "Hostal Milan",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.950871,
    "lng": -80.733921,
    "image": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 54,
    "priceFrom": 34,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 800m de playa · ✈️ 6.0km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1723341366001",
    "owner": "Jimenez Gomez Esther Elizabeth",
    "regNumber": "1723341366001.001.2015359",
    "rooms": [
      {
        "id": "hostal-milan-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 34,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-milan-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 24,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-milan-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 35,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "san-marino",
    "name": "San Marino",
    "stars": 2,
    "classification": "Hostal",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.959176,
    "lng": -80.751311,
    "image": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 71,
    "priceFrom": 37,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 2 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.6km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.6km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1724866957001",
    "owner": "Gavilanes Tamayo Joel Israel",
    "regNumber": "1724866957001.003.2014572",
    "rooms": [
      {
        "id": "san-marino-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "san-marino-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "san-marino-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-san-mateo",
    "name": "Hostal San Mateo",
    "stars": 1,
    "classification": "Hostal",
    "category": "1 Estrella",
    "parroquia": "SAN MATEO",
    "parish": "San Mateo",
    "city": "Manta - San Mateo",
    "address": "Calle principal, Calle San Gregorio, ninguna (Ingresar por el UPC DE SAN MATEO, EN TODA UNA CURVA)",
    "lat": -0.962,
    "lng": -80.8058,
    "image": "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 88,
    "priceFrom": 26,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Parqueadero gratuito",
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 1 Estrella). Ubicado en Manta - San Mateo (Puerto y Playas), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 8.3km de playa · ✈️ 14.0km de aeropuerto · 🚌 13.7km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1727132308001",
    "owner": "Lopez Lopez Miriam Juanita",
    "regNumber": "1727132308001.002.2003112",
    "rooms": [
      {
        "id": "hostal-san-mateo-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hostal-san-mateo-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 18,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hostal-san-mateo-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 27,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "villaluna",
    "name": "Villaluna",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "SANTA MARIANITA",
    "parish": "Santa Marianita",
    "city": "Manta - Santa Marianita (Playa Kite)",
    "address": "malecon, diagonal a las letras, LOTE 52-59 (A LADO DEL EDIFICIO KITE BEACH)",
    "lat": -1.006,
    "lng": -80.8367,
    "image": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=500&fit=crop&auto=format",
    "rating": 4.4,
    "reviews": 110,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea",
      "Cerca de la Playa"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Santa Marianita (Playa Kite), ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 13.4km de playa · ✈️ 18.5km de aeropuerto · 🚌 17.7km de terminal",
    "gravaServicio10": true,
    "phone": "0994129286",
    "taxId": "1727926618001",
    "owner": "Diaz Barrios Marco Antonio",
    "regNumber": "1727926618001.004.2011421",
    "rooms": [
      {
        "id": "villaluna-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "villaluna-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "villaluna-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-vista-al-mar",
    "name": "Hotel Vista Al Mar",
    "stars": 3,
    "classification": "Hotel",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "M1, AV. 24, S/N (FRENTE AL EDIFICIO EL DORADO 1)",
    "lat": -0.952921,
    "lng": -80.733935,
    "image": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=500&fit=crop&auto=format",
    "rating": 4.2,
    "reviews": 133,
    "priceFrom": 50,
    "tags": [
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 6.0km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "0987966674",
    "taxId": "1792177022001",
    "owner": "Orangefuture S.A.",
    "regNumber": "1792177022001.002.2013364",
    "rooms": [
      {
        "id": "hotel-vista-al-mar-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 50,
        "originalPrice": 59,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hotel-vista-al-mar-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hotel-vista-al-mar-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 67,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "poseidon",
    "name": "Poseidon",
    "stars": 5,
    "classification": "Hotel",
    "category": "5 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Barbasquillo",
    "address": "Via Barbasquillo km 1.1/2, Barbasquillo, S/N (JUNTO A MANTAHOST HOTEL)",
    "lat": -0.956859,
    "lng": -80.751458,
    "image": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=500&fit=crop&auto=format",
    "rating": 4.8,
    "reviews": 244,
    "priceFrom": 190,
    "tags": [
      "Frente al Mar",
      "Piscina",
      "10% Servicio Turístico",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero",
      "Piscina exterior",
      "Restaurante gourmet",
      "Bar / Lounge",
      "Room Service 24h",
      "Gimnasio & Spa",
      "Acceso directo a playa",
      "Salones de eventos",
      "Concierge"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 5 Estrellas). Ubicado en Manta - Barbasquillo, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 2.5km de playa · ✈️ 8.0km de aeropuerto · 🚌 7.7km de terminal",
    "gravaServicio10": true,
    "phone": "No registrado en catastro",
    "taxId": "1792433622001",
    "owner": "Fabrica Ecuatoriana Ecuavau S.a",
    "regNumber": "1792433622001.002.7009760",
    "rooms": [
      {
        "id": "poseidon-cama-king",
        "type": "Habitación King Premium con Vista al Mar",
        "beds": "1 Cama King Size (2x2m)",
        "capacity": 2,
        "size": 58,
        "pricePerNight": 190,
        "originalPrice": 218,
        "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Vista panorámica al mar",
          "Caja fuerte"
        ],
        "available": 4,
        "breakfastIncluded": true
      },
      {
        "id": "poseidon-cama-queen",
        "type": "Habitación Matrimonial Deluxe",
        "beds": "1 Cama Queen (1.60x2m)",
        "capacity": 2,
        "size": 43,
        "pricePerNight": 161,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "A/C climatizado",
          "Balcón privado"
        ],
        "available": 5,
        "breakfastIncluded": true
      },
      {
        "id": "poseidon-camas-twin",
        "type": "Habitación Doble Ejecutiva",
        "beds": "2 Camas Individuales Twin (1.05x1.90m)",
        "capacity": 2,
        "size": 45,
        "pricePerNight": 167,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi alta velocidad",
          "Smart TV",
          "A/C climatizado",
          "Mesa de trabajo"
        ],
        "available": 3,
        "breakfastIncluded": true
      }
    ]
  },
  {
    "id": "hotel-agata",
    "name": "Hotel Agata",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - El Murciélago",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.953434,
    "lng": -80.734596,
    "image": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 156,
    "priceFrom": 37,
    "tags": [
      "Cerca de la Playa",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - El Murciélago, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.1km de playa · ✈️ 6.1km de aeropuerto · 🚌 5.9km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1805747449001",
    "owner": "Andagana Andagana Joel Alexander",
    "regNumber": "1805747449001.002.2015467",
    "rooms": [
      {
        "id": "hotel-agata-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 37,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-agata-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 26,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-agata-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 38,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hotel-brisas-del-pacifico",
    "name": "Hotel Brisas del Pacifico",
    "stars": 2,
    "classification": "Hotel",
    "category": "2 Estrellas",
    "parroquia": "TARQUI",
    "parish": "Tarqui",
    "city": "Manta - Tarqui",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.957806,
    "lng": -80.709002,
    "image": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=500&fit=crop&auto=format",
    "rating": 3.7,
    "reviews": 173,
    "priceFrom": 40,
    "tags": [
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea",
      "Frente al Mar"
    ],
    "amenities": [
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hotel - 2 Estrellas). Ubicado en Manta - Tarqui, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 3.1km de playa · ✈️ 3.3km de aeropuerto · 🚌 3.0km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "1900715473001",
    "owner": "Morocho Remachi Melania Esperanza",
    "regNumber": "1900715473001.002.2015649",
    "rooms": [
      {
        "id": "hotel-brisas-del-pacifico-cama-matrimonial",
        "type": "Habitación Matrimonial Confort",
        "beds": "1 Cama Matrimonial (2 plazas)",
        "capacity": 2,
        "size": 18,
        "pricePerNight": 40,
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Ventilador o A/C",
          "Baño privado",
          "Agua caliente"
        ],
        "available": 4
      },
      {
        "id": "hotel-brisas-del-pacifico-cama-individual",
        "type": "Habitación Individual Económica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 13,
        "pricePerNight": 28,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador"
        ],
        "available": 3
      },
      {
        "id": "hotel-brisas-del-pacifico-camas-twin",
        "type": "Habitación Doble Twin",
        "beds": "2 Camas Individuales separadas",
        "capacity": 2,
        "size": 19,
        "pricePerNight": 42,
        "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi gratis",
          "Baño privado",
          "Ventilador / A/C"
        ],
        "available": 2
      }
    ]
  },
  {
    "id": "hostal-casa-latina",
    "name": "Hostal Casa Latina",
    "stars": 3,
    "classification": "Hostal",
    "category": "3 Estrellas",
    "parroquia": "MANTA",
    "parish": "Manta",
    "city": "Manta - Malecón Escénico",
    "address": "Dirección no publicada en catastro oficial",
    "lat": -0.952675,
    "lng": -80.733448,
    "image": "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=500&fit=crop&auto=format",
    "rating": 4.1,
    "reviews": 225,
    "priceFrom": 45,
    "tags": [
      "Pet Friendly (Admite Mascotas)",
      "WiFi Alta Velocidad",
      "Tarifa Neta Hospedaje",
      "Pago en el Hotel o en Línea"
    ],
    "amenities": [
      "Admite mascotas (Pet Friendly)",
      "WiFi gratis",
      "Aire acondicionado",
      "Recepción",
      "TV Smart con cable",
      "Desayuno disponible",
      "Parqueadero"
    ],
    "description": "Establecimiento oficial de hospedaje adscrito al Catastro Turístico de Manta (Hostal - 3 Estrellas). Ubicado en Manta - Malecón Escénico, ofrece atención cordial, excelente conectividad y tarifas directas garantizadas con confirmación de reserva inmediata.",
    "distance": "🏖️ 1.0km de playa · ✈️ 5.9km de aeropuerto · 🚌 5.8km de terminal",
    "gravaServicio10": false,
    "phone": "No registrado en catastro",
    "taxId": "2300692122001",
    "owner": "Lozano Quijije Emily Liz",
    "regNumber": "2300692122001.002.2015350",
    "rooms": [
      {
        "id": "hostal-casa-latina-cama-matrimonial",
        "type": "Habitación Matrimonial Queen",
        "beds": "1 Cama Queen o Matrimonial",
        "capacity": 2,
        "size": 22,
        "pricePerNight": 45,
        "originalPrice": 53,
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV con cable",
          "A/C",
          "Baño privado"
        ],
        "available": 4,
        "breakfastIncluded": false
      },
      {
        "id": "hostal-casa-latina-cama-individual",
        "type": "Habitación Individual Clásica",
        "beds": "1 Cama Individual (1 plaza)",
        "capacity": 1,
        "size": 16,
        "pricePerNight": 33,
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV",
          "A/C",
          "Baño privado"
        ],
        "available": 5
      },
      {
        "id": "hostal-casa-latina-cama-triple",
        "type": "Habitación Triple (Queen + Twin)",
        "beds": "1 Cama Matrimonial + 1 Cama Individual",
        "capacity": 3,
        "size": 28,
        "pricePerNight": 60,
        "image": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=380&fit=crop&auto=format",
        "amenities": [
          "WiFi",
          "TV Smart",
          "A/C",
          "Baño privado amplio"
        ],
        "available": 2
      }
    ]
  }
];

export const INITIAL_DEMO_RESERVATIONS: MyReservation[] = [
  {
    id: "RES-4821",
    hotel: "MantaHost Hotel",
    hotelId: "mantahost-hotel",
    city: "Manta - Barbasquillo",
    room: "Habitación King Premium con Vista al Mar",
    checkIn: "2026-10-20",
    checkOut: "2026-10-23",
    nights: 3,
    total: 465.75,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop&auto=format",
    guestName: "Carlos Méndez",
    guestEmail: "cmendez@gmail.com",
    guestPhone: "+593 98 421 8890",
    payMethod: "Transferencia DeUna",
  },
  {
    id: "RES-7720",
    hotel: "Hotel Oro Verde",
    hotelId: "hotel-oro-verde",
    city: "Manta - El Murciélago",
    room: "Habitación Matrimonial Deluxe",
    checkIn: "2026-10-24",
    checkOut: "2026-10-27",
    nights: 3,
    total: 390.00,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop&auto=format",
    guestName: "Laura Fernández",
    guestEmail: "lfernandez@hotmail.com",
    guestPhone: "+593 99 334 1122",
    payMethod: "PayPhone Ecuador",
  },
  {
    id: "RES-8941",
    hotel: "Hotel Voyager Manta",
    hotelId: "hotel-voyager-manta",
    city: "Manta - Centro Comercial",
    room: "Habitación Matrimonial Queen",
    checkIn: "2026-11-01",
    checkOut: "2026-11-04",
    nights: 3,
    total: 195.00,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=250&fit=crop&auto=format",
    guestName: "Miguel Torres",
    guestEmail: "mtorres@gmail.com",
    guestPhone: "+593 98 123 4567",
    payMethod: "Tarjeta de Crédito",
  },
  {
    id: "RES-9210",
    hotel: "Hostal El Náufrago",
    hotelId: "hostal-el-naufrago",
    city: "Manta - Tarqui",
    room: "Habitación Doble Twin",
    checkIn: "2026-11-05",
    checkOut: "2026-11-07",
    nights: 2,
    total: 64.40,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=250&fit=crop&auto=format",
    guestName: "Andrea Salazar",
    guestEmail: "asalazar@yahoo.com",
    guestPhone: "+593 99 876 5432",
    payMethod: "Efectivo Recepción",
  }
];
