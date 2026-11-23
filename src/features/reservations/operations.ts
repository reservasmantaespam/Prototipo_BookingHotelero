import { getReservationStatus } from "./status";
import type { MyReservation } from "./types";
import type { Hotel } from "../../mantaHotels";

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function hotelMetrics(reservations: MyReservation[], hotelId: string, date = localDate()) {
  const rows = reservations.filter(item => item.hotelId === hotelId);
  const active = rows.filter(item => ["pending", "confirmed", "validated"].includes(getReservationStatus(item)));
  const payments = rows.filter(item => item.payment && item.paymentStatus === "paid");
  const sum = (items: MyReservation[]) => Math.round(items.reduce((total, item) => total + (item.payment?.amount ?? 0), 0) * 100) / 100;
  return {
    reservations: rows.length,
    pending: rows.filter(item => getReservationStatus(item) === "pending").length,
    heldToday: active.filter(item => item.checkIn <= date && item.checkOut > date).length,
    arrivals: active.filter(item => item.checkIn === date && getReservationStatus(item) === "confirmed").length,
    totalCollected: sum(payments),
    monthCollected: sum(payments.filter(item => item.payment!.recordedAt.slice(0, 7) === date.slice(0, 7))),
    outstanding: Math.round(active.filter(item => item.paymentStatus !== "paid").reduce((total, item) => total + item.total, 0) * 100) / 100,
  };
}

export function guestDirectory(reservations: MyReservation[], hotelId: string) {
  const grouped = new Map<string, MyReservation[]>();
  for (const reservation of reservations.filter(item => item.hotelId === hotelId)) {
    const key = reservation.guestEmail.trim().toLowerCase();
    grouped.set(key, [...(grouped.get(key) ?? []), reservation]);
  }
  return [...grouped.entries()].map(([email, rows]) => {
    const history = [...rows].sort((a, b) => (b.createdAt ?? b.checkIn).localeCompare(a.createdAt ?? a.checkIn));
    return {
      email, latest: history[0], history,
      totalPaid: history.reduce((sum, item) => sum + (item.payment?.amount ?? 0), 0),
      completed: history.filter(item => getReservationStatus(item) === "completed").length,
    };
  });
}

export interface HotelAnalyticsSummary {
  adr: number;
  alos: number;
  leadTimeAvg: number;
  occupiedNights: number;
  grossAmount: number;
  retentionCommissionTotal: number;
  netHotelTotal: number;
  tasaPernoctacionTotal: number;
  monthlyRoomFee: number;
  billingMode: string;
  demographics: { label: string; count: number; total: number }[];
  travelPurposes: { label: string; count: number; total: number }[];
  parishDemand: { parish: string; hotels: number; reservations: number; revenue: number }[];
}

export function hotelAnalytics(
  reservations: MyReservation[],
  hotelId: string,
  hotel?: Hotel,
  allHotels: Hotel[] = [],
): HotelAnalyticsSummary {
  const validRows = reservations.filter(
    item =>
      item.hotelId === hotelId &&
      !["cancelled", "rejected", "expired"].includes(getReservationStatus(item)),
  );
  const occupiedNights = validRows.reduce((s, r) => s + Math.max(1, r.nights || 1), 0);
  const grossAmount = Number(validRows.reduce((s, r) => s + r.total, 0).toFixed(2));
  const hostingBase = validRows.reduce(
    (s, r) => s + (r.breakdown?.roomSubtotal ?? r.total),
    0,
  );
  const adr = occupiedNights > 0 ? Number((hostingBase / occupiedNights).toFixed(2)) : 0;
  const alos = validRows.length > 0 ? Number((occupiedNights / validRows.length).toFixed(1)) : 0;

  const leadDays = validRows
    .map(r => {
      if (!r.createdAt) return null;
      const created = Date.parse(r.createdAt);
      const arrival = Date.parse(`${r.checkIn}T00:00:00`);
      if (!Number.isFinite(created) || !Number.isFinite(arrival)) return null;
      return Math.max(0, Math.round((arrival - created) / 86400000));
    })
    .filter((d): d is number => d !== null);

  const leadTimeAvg = leadDays.length > 0
    ? Number((leadDays.reduce((a, b) => a + b, 0) / leadDays.length).toFixed(1))
    : 0;

  const retentionCommissionTotal = Number(
    validRows.reduce((s, r) => s + (r.breakdown?.retentionCommissionAmount ?? 0), 0).toFixed(2),
  );
  const netHotelTotal = Number(
    validRows.reduce((s, r) => s + (r.breakdown?.netHotelAmount ?? r.total), 0).toFixed(2),
  );
  const tasaPernoctacionTotal = Number(
    validRows.reduce((s, r) => s + (r.breakdown?.tasaPernoctacionAmount ?? (r.nights * 2.5)), 0).toFixed(2),
  );

  const billingMode = hotel?.modeloCobroPlataforma ?? "CONVENIO_SIN_COBRO";
  const roomCount = (hotel?.rooms ?? []).reduce((s, r) => s + r.available, 0);
  const roomRate = hotel?.tarifaMensualPorHabitacion ?? 2.5;
  const monthlyRoomFee =
    billingMode === "MENSUAL_POR_HABITACION" || billingMode === "HIBRIDO"
      ? Number((roomCount * roomRate).toFixed(2))
      : 0;

  const demoMap = new Map<string, { count: number; total: number }>();
  const purposeMap = new Map<string, { count: number; total: number }>();
  for (const r of validRows) {
    const origin = r.guestProvince
      ? `${r.guestProvince} (${r.guestCountry || "EC"})`
      : [r.guestCity, r.guestCountry].filter(Boolean).join(", ") || "No especificada";
    const curOrigin = demoMap.get(origin) ?? { count: 0, total: 0 };
    demoMap.set(origin, { count: curOrigin.count + 1, total: Number((curOrigin.total + r.total).toFixed(2)) });

    const purpose = r.travelPurpose || "Vacacional / Playa";
    const curPurpose = purposeMap.get(purpose) ?? { count: 0, total: 0 };
    purposeMap.set(purpose, { count: curPurpose.count + 1, total: Number((curPurpose.total + r.total).toFixed(2)) });
  }

  const parishMap = new Map<string, { hotels: number; reservations: number; revenue: number }>();
  for (const h of allHotels) {
    const pName = h.parish || "Manta";
    const cur = parishMap.get(pName) ?? { hotels: 0, reservations: 0, revenue: 0 };
    const hRows = reservations.filter(
      r => r.hotelId === h.id && !["cancelled", "rejected", "expired"].includes(getReservationStatus(r)),
    );
    parishMap.set(pName, {
      hotels: cur.hotels + 1,
      reservations: cur.reservations + hRows.length,
      revenue: Number((cur.revenue + hRows.reduce((s, r) => s + r.total, 0)).toFixed(2)),
    });
  }

  return {
    adr,
    alos,
    leadTimeAvg,
    occupiedNights,
    grossAmount,
    retentionCommissionTotal,
    netHotelTotal,
    tasaPernoctacionTotal,
    monthlyRoomFee,
    billingMode,
    demographics: [...demoMap.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.count - a.count),
    travelPurposes: [...purposeMap.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.count - a.count),
    parishDemand: [...parishMap.entries()].map(([parish, v]) => ({ parish, ...v })).sort((a, b) => b.hotels - a.hotels),
  };
}
