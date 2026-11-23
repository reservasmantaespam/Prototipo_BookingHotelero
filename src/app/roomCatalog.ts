import { useEffect, useState } from "react";
import { MANTA_HOTELS, type Hotel, type HotelPaymentConfig, type RoomOffer } from "../mantaHotels";

export function buildDefaultHotelPaymentConfig(stars: number): HotelPaymentConfig {
  return {
    cardEnabled: stars >= 4,
    cardProvider: "DATAFAST",
    cardMerchantId: "",
    payphoneEnabled: stars >= 3,
    payphoneStoreId: "",
    deunaEnabled: stars >= 3,
    deunaAccount: "",
    transferEnabled: true,
    receptionEnabled: true,
    transferInstructions: "Transfiere directo a la cuenta del alojamiento y presenta o adjunta tu comprobante.",
  };
}
import { countHeldRooms } from "../features/reservations/workflow";
import type { MyReservation } from "../features/reservations/types";

export const CATALOG_CHANGED = "alojamanta-catalog-changed";
export const HOTELS_STORAGE_KEY = "hoteldirekt.hotels.manta_116";
export const roomOffersKey = (hotelId: string) => `hoteldirekt.${hotelId}.room_offers`;

export function notifyCatalogChanged() {
  window.dispatchEvent(new Event(CATALOG_CHANGED));
}

export function getRoomOffers(hotelId: string): RoomOffer[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(roomOffersKey(hotelId)) ?? "null");
    if (Array.isArray(saved) && saved.every(room => typeof room.id === "string" && typeof room.type === "string" &&
      Number.isSafeInteger(room.available) && room.available >= 0 && Number.isFinite(room.pricePerNight) && room.pricePerNight >= 0)) return saved;
  } catch { /* Fall back to the catalog configuration, never to another hotel. */ }
  return MANTA_HOTELS.find(hotel => hotel.id === hotelId)?.rooms ?? [];
}

export function getHotelById(hotelId: string): Hotel | undefined {
  return getAllConfiguredHotels().find(h => h.id === hotelId);
}

export function getAllConfiguredHotels(): Hotel[] {
  try {
    const raw = localStorage.getItem(HOTELS_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        return parsed.map((item: Record<string, unknown>) => {
          const base = MANTA_HOTELS.find(h => h.id === item.id);
          const id = String(item.id ?? "");
          const rooms = getRoomOffers(id);
          const gallery = Array.isArray(item.gallery) ? (item.gallery as string[]).filter(Boolean) : [];
          const stars = (Math.min(5, Math.max(1, Number(item.stars ?? base?.stars ?? 3))) as 1 | 2 | 3 | 4 | 5);
          const city = String(item.city ?? base?.city ?? "Manta");
          const parish = String(item.parish ?? base?.parish ?? (city.includes(" - ") ? city.split(" - ")[0] : "Manta"));
          const sector = String(item.sector ?? base?.sector ?? (city.includes(" - ") ? city.split(" - ").slice(1).join(" - ") : parish));
          const classification = String(item.classification ?? base?.classification ?? "Hotel");
          const activePrices = rooms.filter(r => !r.stopSell).map(r => r.pricePerNight);
          const minPrice = activePrices.length ? Math.min(...activePrices) : (rooms.length ? Math.min(...rooms.map(r => r.pricePerNight)) : 0);

          return {
            ...(base ?? {}),
            id,
            name: String(item.name ?? base?.name ?? "Alojamiento Manta"),
            stars,
            classification,
            category: String(item.category ?? base?.category ?? `${stars} Estrella${stars > 1 ? "s" : ""}`),
            parish,
            parroquia: parish.toUpperCase(),
            sector,
            city,
            address: String(item.address ?? base?.address ?? "Manta, Manabí"),
            lat: typeof item.lat === "number" ? item.lat : (base?.lat ?? -0.9537),
            lng: typeof item.lng === "number" ? item.lng : (base?.lng ?? -80.7286),
            image: gallery[0] || base?.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format",
            gallery: gallery.length ? gallery : base?.gallery,
            rating: typeof item.rating === "number" ? item.rating : (base?.rating ?? 4.5),
            reviews: base?.reviews ?? 12,
            priceFrom: minPrice,
            tags: base?.tags ?? [item.gravaServicio10 ? "10% Servicio Turístico" : "Tarifa Directa", "Convenio AlojaManta"],
            amenities: Array.isArray(item.amenities) ? (item.amenities as string[]) : (base?.amenities ?? ["WiFi gratis", "Aire acondicionado"]),
            description: String(item.description ?? base?.description ?? `Establecimiento oficial en ${city}.`),
            distance: base?.distance ?? "Manta, Manabí",
            gravaServicio10: item.gravaServicio10 !== undefined ? Boolean(item.gravaServicio10) : (base?.gravaServicio10 ?? false),
            phone: String(item.phone ?? base?.phone ?? "+593 5 262 0000"),
            email: typeof item.email === "string" ? item.email : base?.email,
            taxId: String(item.taxId ?? base?.taxId ?? "1390000000001"),
            razonSocial: typeof item.razonSocial === "string" ? item.razonSocial : base?.razonSocial,
            codigoSucursal: typeof item.codigoSucursal === "string" ? item.codigoSucursal : base?.codigoSucursal,
            owner: typeof item.owner === "string" ? item.owner : base?.owner,
            regNumber: typeof item.regNumber === "string" ? item.regNumber : base?.regNumber,
            licenciaLuaf: typeof item.licenciaLuaf === "string" ? item.licenciaLuaf : base?.licenciaLuaf,
            claveCatastral: typeof item.claveCatastral === "string" ? item.claveCatastral : base?.claveCatastral,
            horaCheckIn: typeof item.horaCheckIn === "string" ? item.horaCheckIn : base?.horaCheckIn,
            horaCheckOut: typeof item.horaCheckOut === "string" ? item.horaCheckOut : base?.horaCheckOut,
            diasCancelacionGratuita: typeof item.diasCancelacionGratuita === "number" ? item.diasCancelacionGratuita : base?.diasCancelacionGratuita,
            modeloCobroPlataforma: (item.modeloCobroPlataforma as Hotel["modeloCobroPlataforma"]) ?? base?.modeloCobroPlataforma,
            codigoConvenio: typeof item.codigoConvenio === "string" ? item.codigoConvenio : base?.codigoConvenio,
            fechaInicioConvenio: typeof item.fechaInicioConvenio === "string" ? item.fechaInicioConvenio : base?.fechaInicioConvenio,
            fechaFinConvenio: typeof item.fechaFinConvenio === "string" ? item.fechaFinConvenio : base?.fechaFinConvenio,
            porcentajeComisionConvenio: typeof item.porcentajeComisionConvenio === "number" ? item.porcentajeComisionConvenio : base?.porcentajeComisionConvenio,
            porcentajeComisionPostConvenio: typeof item.porcentajeComisionPostConvenio === "number" ? item.porcentajeComisionPostConvenio : base?.porcentajeComisionPostConvenio,
            tarifaMensualPorHabitacion: typeof item.tarifaMensualPorHabitacion === "number" ? item.tarifaMensualPorHabitacion : base?.tarifaMensualPorHabitacion,
            modeloCobroHuesped: (item.modeloCobroHuesped as Hotel["modeloCobroHuesped"]) ?? base?.modeloCobroHuesped ?? "PAGO_DIRECTO_HOTEL",
            paymentConfig: (item.paymentConfig as HotelPaymentConfig | undefined) ?? base?.paymentConfig ?? buildDefaultHotelPaymentConfig(stars),
            bancoAcreditacion: typeof item.bancoAcreditacion === "string" ? item.bancoAcreditacion : base?.bancoAcreditacion,
            tipoCuentaBancaria: (item.tipoCuentaBancaria as Hotel["tipoCuentaBancaria"]) ?? base?.tipoCuentaBancaria,
            numeroCuentaBancaria: typeof item.numeroCuentaBancaria === "string" ? item.numeroCuentaBancaria : base?.numeroCuentaBancaria,
            titularCuentaBancaria: typeof item.titularCuentaBancaria === "string" ? item.titularCuentaBancaria : base?.titularCuentaBancaria,
            status: (item.status as Hotel["status"]) ?? "active",
            rooms,
          };
        });
      }
    }
  } catch { /* fallback to MANTA_HOTELS */ }

  return MANTA_HOTELS.map(hotel => {
    const rooms = getRoomOffers(hotel.id);
    return {
      ...hotel,
      status: "active" as const,
      modeloCobroHuesped: hotel.modeloCobroHuesped ?? "PAGO_DIRECTO_HOTEL",
      paymentConfig: hotel.paymentConfig ?? buildDefaultHotelPaymentConfig(hotel.stars),
      rooms,
      priceFrom: rooms.length ? Math.min(...rooms.map(room => room.pricePerNight)) : 0,
    };
  });
}

export function getPublicHotels() {
  return getAllConfiguredHotels().filter(hotel => (hotel.status ?? "active") === "active");
}

export function saveRoomOffers(hotelId: string, rooms: RoomOffer[], reservations: MyReservation[]) {
  const ids = new Set<string>();
  for (const room of rooms) {
    if (!room.id || ids.has(room.id) || !room.type.trim() || !Number.isSafeInteger(room.available) || room.available < 0 ||
      !Number.isFinite(room.pricePerNight) || room.pricePerNight < 0 || !Number.isSafeInteger(room.capacity) || room.capacity < 1) {
      throw new Error("Revisa el tipo, el cupo, el precio y la capacidad de la habitación.");
    }
    ids.add(room.id);
    const held = countHeldRooms(reservations, hotelId, room.id, { checkIn: "2000-01-01", checkOut: "9999-12-31" });
    if (room.available < held) throw new Error("El cupo total no puede ser menor que los cupos apartados. Revisa las reservas activas.");
  }
  try { localStorage.setItem(roomOffersKey(hotelId), JSON.stringify(rooms)); }
  catch { throw new Error("No se pudo guardar el inventario."); }
  window.dispatchEvent(new Event(CATALOG_CHANGED));
}

export function useRoomCatalogRevision() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener(CATALOG_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(CATALOG_CHANGED, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  return revision;
}
