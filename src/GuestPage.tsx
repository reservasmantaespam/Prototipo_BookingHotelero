import { buildDefaultHotelPaymentConfig, getPublicHotels, useRoomCatalogRevision } from "./app/roomCatalog";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { GuestUser } from "./AuthPage";
import {
  getActiveIvaPercent,
  getIvaDecretoConfig,
  TASA_PERNOCTACION_MANTA,
  addAuditLog,
  addErrorLog,
  calculatePlatformSettlement,
  HOTEL_COMMERCIAL_INFO,
} from "./hotelData";
import {
  type Hotel,
  type RoomOffer,
  MANTA_LANDMARKS,
  calculateDistanceKm,
  formatDistanceString,
  getHotelDetailedDistances,
} from "./mantaHotels";
import MantaMapModal from "./MantaMapModal";
import {
  reservationWorkflow,
  getRoomAvailability,
  guestReservationRepository,
  consumeRoomAvailability,
  RESERVATIONS_CHANGED_EVENT,
} from "./app/reservations";
import { useGuestReservations, useReservationSnapshot } from "./app/useGuestReservations";
import { useArrivalPolicy } from "./app/arrivalPolicy";
import { RequestDeadline } from "./features/reservations/RequestDeadline";
import { GuestMessengerBarAndDock, IconMessenger } from "./features/messaging/MessagingComponents";
import {
  openGuestChatForReservation,
  openGuestSupportChat,
  ensureReservationThread,
} from "./features/messaging/messagingStore";
import { ReservationDialog } from "./features/reservations/ReservationDialog";
import { ReservationSummary, ReservationVoucherModal as InvoiceModal } from "./features/reservations/ReservationSummary";
import { canCancelReservation, getPaymentLabel, getReservationStatus, getReservationStyle } from "./features/reservations/status";
import type { MyReservation } from "./features/reservations/types";
import { useI18n, useLang, setLang, getLang, txDesc } from "./i18n";
import mantaHeroImage from "./assets/manta-playa-murcielago.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuestView = "home" | "results" | "hotel" | "account";

interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export function buildWhatsAppUrl(
  phone: string | undefined,
  hotelName: string,
  resId?: string,
  guestName?: string,
  checkIn?: string,
  checkOut?: string,
  roomType?: string
): string {
  const raw = (phone || "593999999999").replace(/\D/g, "");
  let formatted = raw;
  if (!formatted.startsWith("593")) {
    formatted = formatted.startsWith("0") ? "593" + formatted.slice(1) : "593" + formatted;
  }
  let msg = "";
  if (resId) {
    msg = `¡Hola ${hotelName}! Acabo de registrar mi solicitud de reserva #${resId} en AlojaManta para el ${checkIn || ""} al ${checkOut || ""} (${roomType || "Habitación"}). Mi nombre es ${guestName || "Huésped"}. Quisiera coordinar los detalles de mi llegada.`;
  } else {
    msg = `¡Hola ${hotelName}! Vi su alojamiento en AlojaManta y quisiera consultar sobre disponibilidad y tarifas para mi estancia.`;
  }
  return `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`;
}

const FALLBACK_HOTEL_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format";

export function matchSmartDestination(h: Hotel, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;
  const q = rawQuery
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Palabras genéricas que abarcan toda la ciudad de Manta
  const genericWords = [
    "alojamiento", "alojamientos", "hospedaje", "hospedajes",
    "hotel", "hoteles", "hostal", "hostales",
    "manta", "canton", "manabi", "ecuador", "toda", "todo",
    "dormir", "reserva", "reservar", "estancia",
  ];
  const tokens = q.split(" ").filter(Boolean);
  const isOnlyGeneric = tokens.length > 0 && tokens.every(tok => genericWords.includes(tok));
  if (isOnlyGeneric) return true;

  const hText = `${h.name} ${h.city} ${h.address} ${h.parish || ""} ${h.parroquia || ""} ${h.sector || ""} ${h.tags?.join(" ") || ""} ${h.amenities?.join(" ") || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Puntos de interés con filtro estricto (devuelven booleano exacto)
  if (q === "aeropuerto" || q.includes("aeropuerto") || q.includes("vuelo") || q === "mec") {
    const distMec = calculateDistanceKm(h.lat ?? -0.952, h.lng ?? -80.725, -0.9500, -80.6800);
    return distMec <= 3.5 || hText.includes("aeropuerto");
  }
  if (q === "terminal" || q.includes("terminal") || q.includes("palmar") || q === "bus") {
    const distTerm = calculateDistanceKm(h.lat ?? -0.952, h.lng ?? -80.725, -0.9645, -80.6830);
    return distTerm <= 3.5 || hText.includes("terminal") || hText.includes("palmar");
  }
  if (q === "mall" || q.includes("mall") || q.includes("pacifico") || q.includes("centro comercial")) {
    const distMall = calculateDistanceKm(h.lat ?? -0.952, h.lng ?? -80.725, -0.9485, -80.7290);
    return distMall <= 2.2 || hText.includes("mall") || hText.includes("centro comercial");
  }
  if (q === "centro" || q.includes("plaza civica")) {
    const distCentro = calculateDistanceKm(h.lat ?? -0.952, h.lng ?? -80.725, -0.9500, -80.7220);
    return distCentro <= 2.2 || hText.includes("centro");
  }
  if (q === "playa" || q === "frente al mar" || q === "cerca de la playa") {
    const beachAnchors = [
      [-0.9440, -80.7330], [-0.9555, -80.7525], [-0.9505, -80.7095],
      [-0.9515, -80.6875], [-0.9615, -80.8090], [-1.0030, -80.8420], [-1.0650, -80.9080],
    ];
    const minBeachDist = Math.min(...beachAnchors.map(([lat, lng]) => calculateDistanceKm(h.lat ?? -0.952, h.lng ?? -80.725, lat, lng)));
    return minBeachDist <= 1.2 || (h.tags?.some(t => t.toLowerCase().includes("mar") || t.toLowerCase().includes("playa")) ?? false);
  }
  if (q.includes("kitesurf") || q.includes("kite") || q.includes("santa marianita")) {
    return hText.includes("santa marianita") || hText.includes("kitesurf");
  }
  if (q.includes("surf") || q.includes("san mateo")) {
    return hText.includes("san mateo") || hText.includes("surf");
  }
  if (q.includes("barato") || q.includes("economico")) {
    return h.priceFrom <= 28;
  }
  if (q.includes("lujo") || q.includes("5 estrellas") || q.includes("primera")) {
    return h.stars >= 4 || h.priceFrom >= 60;
  }

  // Filtrar stop-words y "manta" para que "Manta - Los Esteros" filtre solo por "esteros"
  const stopWords = new Set([
    "de", "en", "el", "la", "los", "las", "un", "una", "y", "a", "del", "al",
    "manta", "zona", "sector", "parroquia", "cerca", "playa",
  ]);
  const significantTokens = tokens.filter(t => t.length > 1 && !stopWords.has(t));
  if (significantTokens.length === 0) return true;

  return significantTokens.every(tok => hText.includes(tok));
}



const MANTA_POINTS_OF_INTEREST = [
  { name: "Cerca de la playa", query: "Playa", desc: "Barbasquillo, El Murciélago y costas" },
  { name: "Mall del Pacífico", query: "Mall", desc: "Zona comercial, cines y restaurantes" },
  { name: "Aeropuerto", query: "Aeropuerto", desc: "A menos de 5 min de la terminal aérea" },
  { name: "Terminal Terrestre", query: "Terminal", desc: "Acceso rápido para viajes de paso" },
];

const MANTA_ZONES = [
  { name: "Playa El Murciélago", query: "El Murciélago", desc: "Malecón, playa urbana y restaurantes" },
  { name: "Barbasquillo", query: "Barbasquillo", desc: "Hoteles frente al mar y zona gastronómica" },
  { name: "Tarqui", query: "Tarqui", desc: "Playa, comercio local y opciones accesibles" },
  { name: "Los Esteros", query: "Los Esteros", desc: "Zona costera norte" },
  { name: "Santa Marianita", query: "Santa Marianita", desc: "Playa amplia y kitesurf" },
  { name: "San Mateo", query: "San Mateo", desc: "Puerto, miradores y surf" },
  { name: "San Lorenzo", query: "San Lorenzo", desc: "Reserva Pacoche y playas tranquilas" },
  { name: "Eloy Alfaro", query: "Eloy Alfaro", desc: "Zona urbana y residencial" },
];

// Iconos monocromáticos ligeros (estilo editorial, sin emojis)
function IconPin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMap({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function IconSun({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}



// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  const locale = getLang() === "en" ? "en-US" : "es-EC";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}
function todayStr() { return new Date().toISOString().split("T")[0]; }
function addDays(date: string, n: number) {
  const d = new Date(date + "T12:00:00"); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}
function fmtDateShort(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString(getLang() === "en" ? "en-US" : "es-ES", { day: "numeric", month: "short", year: "numeric" });
}
function StarsRow({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? "#f59e0b" : "var(--border)", fontSize: 11 }}>★</span>
      ))}
    </span>
  );
}

// ─── Price breakdown component (Booking.com style) ───────────────────────────

interface PriceBreakdownProps {
  basePrice: number;
  nights?: number;
  hasService10?: boolean;
  serviceFee?: number;
  hotelName?: string;
  className?: string;
  showToggle?: boolean;
  defaultExpanded?: boolean;
}

function PriceBreakdownBox({
  basePrice,
  nights = 1,
  hasService10 = false,
  hotelName,
  className = "",
  showToggle = true,
  defaultExpanded = false,
}: PriceBreakdownProps) {
  const tx = useI18n();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [ivaPct, setIvaPct] = useState<15 | 8>(() => getActiveIvaPercent());
  const decretoCfg = getIvaDecretoConfig();

  useEffect(() => {
    const syncIva = () => setIvaPct(getActiveIvaPercent());
    window.addEventListener("alojamanta-iva-change", syncIva);
    window.addEventListener("storage", syncIva);
    return () => {
      window.removeEventListener("alojamanta-iva-change", syncIva);
      window.removeEventListener("storage", syncIva);
    };
  }, []);

  const n = Math.max(nights, 1);
  const subtotal = Number((basePrice * n).toFixed(2));
  const iva = Number((subtotal * (ivaPct / 100)).toFixed(2));
  // El 10% de servicio turístico se calcula sobre el subtotal neto según Art. 41 Ley de Turismo
  const servicio = hasService10 ? Number((subtotal * 0.10).toFixed(2)) : 0;
  // Tasa de Pernoctación Turística Municipal (GAD Manta): US$ 2.50 por noche de estancia
  const tasaPernoctacion = Number((TASA_PERNOCTACION_MANTA * n).toFixed(2));
  const totalImpuestos = Number((iva + servicio + tasaPernoctacion).toFixed(2));
  const totalPagar = Number((subtotal + totalImpuestos).toFixed(2));

  return (
    <div className={`rounded-xl border bg-card p-3.5 shadow-sm text-left transition-all ${className}`} style={{ borderColor: "var(--border)" }}>
      {/* Resumen de precio */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{tx("Desglose del precio")}</span>
            {ivaPct === 8 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {tx("IVA 8% tarifa feriado")}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs text-muted-foreground font-medium">{tx("Precio base")}</span>
            <span className="text-xl font-black text-foreground tracking-tight">US${subtotal.toFixed(2)}</span>
            {n > 1 && <span className="text-[11px] text-muted-foreground">({n} {tx("noches")})</span>}
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
            + US${totalImpuestos.toFixed(2)} {tx("de impuestos y tasas")} ({ivaPct}% IVA{hasService10 ? " + 10% Serv." : ""} + $2.50/n Tasa Pernoctación)
          </p>
        </div>
        {showToggle && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-sky-50 border border-sky-100 flex items-center gap-1"
          >
            <span>{expanded ? tx("Ver menos") : tx("Ver desglose")}</span>
            <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
            <span>{tx("Detalle de impuestos y tasas")}</span>
          </div>

          <div className="rounded-lg p-3 bg-background border border-border/80 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px] pb-1.5 border-b border-border">
              <span>{tx("Impuestos y cargos")}: US${totalImpuestos.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <span>
                {ivaPct}% IVA {ivaPct === 8 ? `(${decretoCfg.decretoNombre})` : ""}
              </span>
              <span className={`font-mono font-medium ${ivaPct === 8 ? "text-emerald-700 font-bold" : ""}`}>US${iva.toFixed(2)}</span>
            </div>

            {hasService10 ? (
              <div className="flex justify-between items-center text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                <span>{tx("10% Servicio turístico")}</span>
                <span className="font-mono font-bold">US${servicio.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-muted-foreground italic text-[11px]">
                <span>{tx("10% Servicio turístico (no aplica)")}</span>
                <span className="font-mono">US$0.00</span>
              </div>
            )}

            <div className="flex justify-between items-center text-muted-foreground">
              <span>
                {tx("Tasa de Pernoctación Turística Municipal (GAD Manta)")} ({n} {n === 1 ? tx("noche") : tx("noches")} × $2.50)
              </span>
              <span className="font-mono font-bold text-foreground">US${tasaPernoctacion.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 font-bold text-foreground text-sm border-t border-border">
            <span>{tx("Total a pagar")}</span>
            <span className="text-base font-black text-amber-600 font-mono">US${totalPagar.toFixed(2)}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-tight">
            <div>
              <strong>{tx("Voucher digital de reserva:")}</strong> {tx("Emitido con tu código de confirmación al validar el pago. Preséntalo a tu llegada a")} {hotelName ? <strong>{hotelName}</strong> : tx("el alojamiento")}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({
  params,
  onChange,
  onSearch,
  variant = "hero",
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  variant?: "hero" | "sticky";
}) {
  const tx = useI18n();
  const [isPopOpen, setIsPopOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const publicHotels = getPublicHotels();
  const typed = params.destination.trim().toLowerCase();
  const matchingPois = typed
    ? MANTA_POINTS_OF_INTEREST.filter(p => `${p.name} ${p.query} ${p.desc}`.toLowerCase().includes(typed))
    : MANTA_POINTS_OF_INTEREST;
  const matchingZones = typed
    ? MANTA_ZONES.filter(z => `${z.name} ${z.query} ${z.desc}`.toLowerCase().includes(typed))
    : MANTA_ZONES;

  function handleSelectDestination(destQuery: string) {
    onChange({ ...params, destination: destQuery });
    setIsPopOpen(false);
  }

  return (
    <div
      className={`w-full max-w-full flex flex-col md:flex-row md:items-stretch bg-card border border-border text-left ${
        variant === "hero"
          ? "rounded-2xl shadow-lg shadow-slate-950/15 p-1.5 gap-1.5 md:gap-0 md:divide-x md:divide-border"
          : "rounded-xl shadow-xs p-1.5 gap-1.5 md:gap-0 md:divide-x md:divide-border"
      }`}
    >
      {/* ─── Zonas y puntos de interés en Manta ─── */}
      <div className="flex-1 min-w-0 relative flex items-center px-3 py-1.5" ref={popoverRef}>
        <IconPin className="w-4 h-4 text-muted-foreground shrink-0 mr-2.5" />
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-medium text-muted-foreground leading-none mb-1">
            {tx("Zonas y puntos de interés")}
          </label>
          <input
            type="text"
            value={params.destination}
            onFocus={() => setIsPopOpen(true)}
            onClick={() => setIsPopOpen(true)}
            onChange={e => {
              onChange({ ...params, destination: e.target.value });
              if (!isPopOpen) setIsPopOpen(true);
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                setIsPopOpen(false);
                onSearch();
              } else if (e.key === "Escape") {
                setIsPopOpen(false);
              }
            }}
            placeholder={tx("Toda Manta, playa, aeropuerto o mall")}
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/80 outline-none pr-6"
          />
        </div>

        {params.destination && (
          <button
            type="button"
            onClick={() => {
              onChange({ ...params, destination: "" });
              setIsPopOpen(false);
            }}
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            title={tx("Borrar filtro de destino")}
            aria-label={tx("Borrar filtro de destino")}
          >
            ✕
          </button>
        )}

        {/* Dropdown limpio solo por puntos de interés y zonas de Manta */}
        {isPopOpen && (
          <div className="absolute left-0 top-full mt-3 w-full sm:w-[380px] max-w-[94vw] rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden text-left">
            <div className="max-h-96 overflow-y-auto py-1.5">
              {params.destination && (
                <button
                  type="button"
                  onClick={() => handleSelectDestination("")}
                  className="w-full px-3.5 py-2 text-left hover:bg-muted/70 flex items-center justify-between gap-2 transition-colors cursor-pointer border-b border-border/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tx("Toda Manta")}</p>
                    <p className="text-[11px] text-muted-foreground">{publicHotels.length} {tx("alojamientos disponibles")}</p>
                  </div>
                </button>
              )}

              {matchingPois.length > 0 && (
                <div className="py-1 border-b border-border/60">
                  <p className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tx("Puntos de interés")}
                  </p>
                  {matchingPois.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectDestination(p.query)}
                      className="w-full px-3.5 py-2 text-left hover:bg-muted/70 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <IconPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{tx(p.name)}</p>
                        <p className="text-[11px] text-muted-foreground">{tx(p.desc)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchingZones.length > 0 && (
                <div className="py-1">
                  <p className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tx("Zonas de Manta")}
                  </p>
                  {matchingZones.map(z => (
                    <button
                      key={z.name}
                      type="button"
                      onClick={() => handleSelectDestination(z.query)}
                      className="w-full px-3.5 py-2 text-left hover:bg-muted/70 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <IconPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{tx(z.name)}</p>
                        <p className="text-[11px] text-muted-foreground">{tx(z.desc)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchingPois.length === 0 && matchingZones.length === 0 && (
                <p className="px-3.5 py-4 text-xs text-muted-foreground text-center">
                  {tx("Presiona Buscar para ver resultados en Manta.")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Fechas (Entrada — Salida) ─── */}
      <div className="flex items-center px-3 py-1.5 gap-2.5 md:w-[290px] shrink-0 border-t md:border-t-0 border-border/60">
        <IconCalendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
          <div className="min-w-0">
            <label className="block text-[11px] font-medium text-muted-foreground leading-none mb-1">
              {tx("Entrada")}
            </label>
            <input
              type="date"
              className="w-full bg-transparent text-xs sm:text-[13px] font-medium outline-none text-foreground cursor-pointer"
              value={params.checkIn}
              min={todayStr()}
              onChange={e =>
                onChange({
                  ...params,
                  checkIn: e.target.value,
                  checkOut: params.checkOut && e.target.value >= params.checkOut ? addDays(e.target.value, 1) : params.checkOut,
                })
              }
            />
          </div>
          <div className="min-w-0">
            <label className="block text-[11px] font-medium text-muted-foreground leading-none mb-1">
              {tx("Salida")}
            </label>
            <input
              type="date"
              className="w-full bg-transparent text-xs sm:text-[13px] font-medium outline-none text-foreground cursor-pointer"
              value={params.checkOut}
              min={params.checkIn ? addDays(params.checkIn, 1) : addDays(todayStr(), 1)}
              onChange={e => onChange({ ...params, checkOut: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ─── Huéspedes ─── */}
      <div className="flex items-center px-3 py-1.5 gap-2.5 md:w-36 shrink-0 border-t md:border-t-0 border-border/60">
        <IconUsers className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-medium text-muted-foreground leading-none mb-1">
            {tx("Huéspedes")}
          </label>
          <select
            className="w-full bg-transparent text-sm font-medium outline-none text-foreground cursor-pointer"
            value={params.adults}
            onChange={e => onChange({ ...params, adults: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>
                {n} {n > 1 ? tx("adultos") : tx("adulto")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Botón Buscar ─── */}
      <div className="md:pl-2 flex items-center">
        <button
          type="button"
          onClick={() => {
            setIsPopOpen(false);
            onSearch();
          }}
          className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer text-center bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
        >
          {tx("Buscar hoteles")}
        </button>
      </div>
    </div>
  );
}

// ─── Invoice modal ────────────────────────────────────────────────────────────

export { InvoiceModal };

// ─── My Account view (Hub & Perfil) ──────────────────────────────────────────

function AccountView({
  user,
  reservations,
  onLogout,
  onCancelReservation,
  onViewVoucher,
  onBack,
  initialTab = "hub",
}: {
  user: GuestUser;
  reservations: MyReservation[];
  onLogout: () => void;
  onCancelReservation: (id: string) => void;
  onViewVoucher: (res: MyReservation) => void;
  onBack?: () => void;
  initialTab?: "hub" | "reservations" | "personal" | "billing" | "payments" | "about";
}) {
  const tx = useI18n();
  const [activeTab, setActiveTab] = useState<"hub" | "reservations" | "personal" | "billing" | "payments" | "about">(initialTab);
  const [resFilter, setResFilter] = useState<"all" | MyReservation["status"]>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Perfil del huésped persistente
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(`alojamanta_profile_${user.email}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      fullName: user.name,
      email: user.email,
      documentType: "Cédula de Identidad (Ecuador)",
      documentNumber: "",
      phone: "",
      city: "",
      roomPref: "",
      dietPref: "",
      // Datos de contacto para comprobante
      wantsInvoice: false,
      taxId: "",
      razonSocial: user.name,
      direccionFiscal: "",
      correoComprobante: user.email,
    };
  });

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(`alojamanta_profile_${user.email}`, JSON.stringify(profile));
    } catch {}
    showToast(tx("Datos de perfil guardados para tus reservas"));
  }

  function handleSaveBilling(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(`alojamanta_profile_${user.email}`, JSON.stringify(profile));
    } catch {}
    showToast(tx("✓ Datos de contacto y comprobante actualizados"));
  }

  const allList = reservations.filter(reservation => reservation.guestEmail.toLowerCase() === user.email.toLowerCase());

  const filteredReservations = allList.filter(r => {
    if (resFilter === "all") return true;
    return getReservationStatus(r) === resFilter;
  });

  const totalNights = allList.reduce((s, r) => s + r.nights, 0);
  const _totalPaid = allList.reduce((s, r) => s + r.total, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navegación superior */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>←</span>
          <span>{tx("Volver a buscar hoteles")}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
          >
            {tx("Cerrar sesión")}
          </button>
        </div>
      </div>

      {/* Tarjeta de Encabezado del Huésped */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 mb-6 shadow-xs" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: "var(--muted)" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {profile.fullName || user.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {tx("Cuenta de prueba local")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email} · {profile.phone}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {tx("Reservas directo con el hotel, sin recargos")}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 bg-background sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{tx("Resumen de cuenta")}</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-foreground font-mono">{allList.length} reservas</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-amber-600 font-mono">{totalNights} noches</span>
            </div>
          </div>
        </div>

        {/* Barra de pestañas */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pt-4 text-xs font-semibold">
          {[
            { id: "hub", label: tx("Inicio") },
            { id: "reservations", label: `Mis Reservas (${allList.length})` },
            { id: "personal", label: tx("Datos personales") },
            { id: "billing", label: tx("Comprobantes") },
            { id: "payments", label: tx("Medios de pago") },
            { id: "about", label: tx("Información") },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === t.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: HUB PRINCIPAL (Tarjetas Categorizadas) ─── */}
      {activeTab === "hub" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Estancias y Viajes */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Estancias y viajes")}
                </h3>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {allList.length} registradas
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab("reservations")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Mis reservas y viajes en Manta")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("reservations")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Vouchers y comprobantes de reserva")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Explorar alojamientos en Manta")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Card 2: Gestión de la cuenta y Llegada */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Datos del titular")}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {tx("Llegada ágil")}
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab("personal")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Datos personales (Cédula / Pasaporte)")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Teléfono y WhatsApp de confirmación")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Preferencias de cama y habitación")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Card 3: Comprobantes y Contacto */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Comprobantes de pago")}
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {tx("Comprobante de Reserva")}
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Datos tributarios (RUC / Cédula)")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Razón Social y Domicilio fiscal")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Emisión en recepción del alojamiento")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Card 4: Medios de Pago Digitales */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Cobro y pagos")}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {tx("Registro local")}
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab("payments")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Cobros registrados en mis reservas")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Método registrado por recepción")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Historial de cobros de prueba")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Card 5: Acerca de AlojaManta */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Acerca de AlojaManta")}
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {tx("Red Manta")}
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <button
                  onClick={() => setActiveTab("about")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("116 Alojamientos y validados")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Modelo directo sin comisiones abusivas")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Comprobantes digitales y liquidación de reserva")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Card 6: Atención y Asistencia al Huésped */}
            <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base">
                  {tx("Asistencia al huésped")}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {tx("Cantón Manta")}
                </span>
              </div>
              <div className="space-y-1 divide-y divide-slate-100 text-xs">
                <a
                  href="https://wa.me/593998765432?text=Hola%2C%20requiero%20asistencia%20en%20AlojaManta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 flex items-center justify-between text-left hover:text-emerald-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-emerald-600">{tx("WhatsApp Manta: +593 99 876 5432")}</span>
                  <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">💬</span>
                </a>
                <a
                  href="tel:+59352628900"
                  className="py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Línea Cantonal: +593 5 262 8900")}</span>
                  <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform">📞</span>
                </a>
                <button
                  type="button"
                  onClick={() => openGuestSupportChat(user.name, user.email)}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Chat de Soporte AlojaManta (Novedades de la App)")}</span>
                  <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("reservations")}
                  className="w-full py-2.5 flex items-center justify-between text-left hover:text-amber-600 transition-colors cursor-pointer group"
                >
                  <span className="text-foreground font-medium group-hover:text-amber-600">{tx("Consultar reservas y comprobantes")}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MIS RESERVAS ─── */}
      {activeTab === "reservations" && (
        <div className="space-y-5">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs font-semibold">
              {[
                { id: "all", label: tx("Todas") },
                { id: "pending", label: tx("Pendientes") },
                { id: "confirmed", label: tx("Confirmadas") },
                { id: "validated", label: tx("Validadas") },
                { id: "rejected", label: tx("Rechazadas") },
                { id: "expired", label: tx("Vencidas") },
                { id: "completed", label: tx("Completadas") },
                { id: "cancelled", label: tx("Canceladas") },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setResFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    resFilter === f.id
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f.label} ({f.id === "all" ? allList.length : allList.filter(reservation => getReservationStatus(reservation) === f.id).length})
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground">
              Mostrando {filteredReservations.length} de {allList.length} reservas
            </span>
          </div>

          {/* Listado */}
          <div className="space-y-4">
            {filteredReservations.map(res => {
              const st = getReservationStyle(res);
              return (
                <div key={res.id} className="rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-col sm:flex-row">
                    <img src={res.image} alt={tx(res.room)} className="sm:w-48 w-full object-cover" style={{ height: 140 }} />
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-foreground text-base">{res.hotel}</p>
                            <p className="text-xs text-muted-foreground font-medium">{tx(res.city)} · {tx(res.room)}</p>
                          </div>
                          <span className="mono text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider" style={{ background: st.bg, color: st.color }}>
                            {tx(st.label)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                          <span>📅 {fmtDateShort(res.checkIn)} → {fmtDateShort(res.checkOut)}</span>
                          <span>·</span>
                          <span>🌙 {res.nights} noche{res.nights > 1 ? "s" : ""}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--muted)" }}>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{tx("Código de reserva")}</p>
                          <p className="font-mono text-sm font-bold text-foreground break-all">{res.id}</p>
                          <p className="text-xs text-muted-foreground">{tx(getPaymentLabel(res))}</p>
                          <RequestDeadline reservation={res} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <p className="font-black text-lg text-foreground mr-1">{fmt(res.total)}</p>
                          <button
                            type="button"
                            onClick={() => openGuestChatForReservation(res, "normal")}
                            className="text-xs px-3 py-1.5 rounded-xl font-bold transition-all border border-border bg-card hover:bg-muted text-foreground cursor-pointer flex items-center gap-1.5"
                          >
                            <IconMessenger className="w-3.5 h-3.5 text-amber-600" />
                            <span>{tx("Mensaje al hotel")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openGuestChatForReservation(res, "lodging_issue")}
                            className="text-xs px-2.5 py-1.5 rounded-xl font-semibold transition-all border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                            title={tx("Reportar un inconveniente al Administrador del Hotel")}
                          >
                            {tx("Reportar inconveniente")}
                          </button>
                          <button
                            onClick={() => onViewVoucher(res)}
                            className="text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{tx("Ver Voucher")}</span>
                          </button>
                          {canCancelReservation(res) && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Deseas cancelar la reserva ${res.id}? Recuerda que la política flexible te reintegra el valor total.`)) {
                                  onCancelReservation(res.id);
                                  showToast(`Reserva ${res.id} cancelada correctamente`);
                                }
                              }}
                              className="text-xs px-2.5 py-1.5 rounded-xl font-semibold transition-all border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              {tx("Cancelar")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReservations.length === 0 && (
              <div className="text-center py-12 rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
                <p className="text-3xl mb-2">🏖️</p>
                <p className="font-bold text-foreground text-sm">{tx("No tienes reservas con este filtro")}</p>
                <button
                  onClick={() => setResFilter("all")}
                  className="mt-3 text-xs text-amber-700 font-semibold underline cursor-pointer"
                >
                  {tx("Ver todas las reservas")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: DATOS PERSONALES ─── */}
      {activeTab === "personal" && (
        <form onSubmit={handleSaveProfile} className="rounded-2xl border bg-card p-6 shadow-xs max-w-2xl" style={{ borderColor: "var(--border)" }}>
          <div className="border-b pb-4 mb-5" style={{ borderColor: "var(--muted)" }}>
            <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
              {tx("Datos Personales del Huésped")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tx("Con esto tu llegada al hotel es más rápida.")}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">{tx("Nombre y Apellidos Completos")}</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                style={{ borderColor: "var(--border)" }}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Tipo de Documento")}</label>
                <select
                  value={profile.documentType}
                  onChange={e => setProfile({ ...profile, documentType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none bg-card"
                  style={{ borderColor: "var(--border)" }}
                >
                  <option value="Cédula de Identidad (Ecuador)">{tx("Cédula de Identidad (Ecuador)")}</option>
                  <option value="Pasaporte Internacional">{tx("Pasaporte Internacional")}</option>
                  <option value="RUC Personal">{tx("RUC Personal")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Número de Identificación")}</label>
                <input
                  type="text"
                  value={profile.documentNumber}
                  onChange={e => setProfile({ ...profile, documentNumber: e.target.value })}
                  placeholder={tx("Ej: 1314589201")}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none font-mono"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Correo Electrónico")}</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-background text-muted-foreground cursor-not-allowed"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Teléfono / WhatsApp")}</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none font-mono"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">{tx("Ciudad o País de Residencia")}</label>
              <input
                type="text"
                value={profile.city}
                onChange={e => setProfile({ ...profile, city: e.target.value })}
                placeholder={tx("Ej: Quito, Guayaquil, Cuenca, etc.")}
                className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">{tx("Preferencia Habitual de Habitación")}</label>
              <input
                type="text"
                value={profile.roomPref}
                onChange={e => setProfile({ ...profile, roomPref: e.target.value })}
                placeholder={tx("Ej: Cama King, piso alto, almohadas extras...")}
                className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("hub")}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-background cursor-pointer"
              >
                {tx("Cancelar")}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-colors"
              >
                {tx("Guardar Datos de Huésped")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 4: COMPROBANTES Y CONTACTO ─── */}
      {activeTab === "billing" && (
        <form onSubmit={handleSaveBilling} className="rounded-2xl border bg-card p-6 shadow-xs max-w-2xl" style={{ borderColor: "var(--border)" }}>
          <div className="border-b pb-4 mb-5" style={{ borderColor: "var(--muted)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2" style={{ fontFamily: "DM Serif Display, serif" }}>
                <span>🏛️</span>
                <span>{tx("Datos del Huésped y Comprobante de Reserva")}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                {tx("15% IVA")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>{tx("El establecimiento recibe tus datos verificados para agilizar la validación de tu reserva.")}</strong> Guarda aquí tus datos para que el hotel emita tus comprobantes de estancia a tu nombre o empresa.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base">ℹ️</span>
              <p>
                {tx("La plataforma de reserva procesa el cobro del anticipo y transfiere el importe neto al alojamiento. El hotel entrega tu comprobante de estancia y registro al momento de tu llegada.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Cédula o Pasaporte del Huésped")}</label>
                <input
                  type="text"
                  value={profile.taxId}
                  onChange={e => setProfile({ ...profile, taxId: e.target.value })}
                  placeholder={tx("Ej: 1314589201001")}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none font-mono"
                  style={{ borderColor: "var(--border)" }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">{tx("Razón Social o Nombre Fiscal")}</label>
                <input
                  type="text"
                  value={profile.razonSocial}
                  onChange={e => setProfile({ ...profile, razonSocial: e.target.value })}
                  placeholder={tx("Nombre de empresa o persona natural")}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                  style={{ borderColor: "var(--border)" }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">{tx("Dirección Fiscal en Ecuador")}</label>
              <input
                type="text"
                value={profile.direccionFiscal}
                onChange={e => setProfile({ ...profile, direccionFiscal: e.target.value })}
                placeholder={tx("Calle, número y ciudad")}
                className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                style={{ borderColor: "var(--border)" }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">{tx("Correo para Envío de Comprobante")}</label>
              <input
                type="email"
                value={profile.correoComprobante}
                onChange={e => setProfile({ ...profile, correoComprobante: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl outline-none font-mono"
                style={{ borderColor: "var(--border)" }}
                required
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("hub")}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-background cursor-pointer"
              >
                {tx("Volver")}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-colors"
              >
                {tx("Guardar Datos de Reserva")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 5: MEDIOS DE PAGO ─── */}
      {activeTab === "payments" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-xl text-foreground">{tx("Pagos de mis reservas")}</h3>
          <p className="text-sm text-muted-foreground">{tx("La pasarela no está conectada. Solo se muestran los cobros de prueba registrados por el hotel.")}</p>
          {allList.filter(item => item.payment).length === 0 && <p>{tx("No hay cobros registrados.")}</p>}
          {allList.filter(item => item.payment).map(item => <div key={item.id} className="border-t border-border pt-3">
            <p className="break-all">{item.hotel} · {item.id}</p>
            <p>{fmt(item.payment!.amount)} · {item.payment!.method} · {item.payment!.recordedAt.slice(0, 10)}</p>
          </div>)}
        </div>
      )}

      {/* ─── TAB 6: ACERCA DE ALOJAMANTA ─── */}
      {activeTab === "about" && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xs max-w-3xl space-y-6" style={{ borderColor: "var(--border)" }}>
          <div className="border-b pb-5" style={{ borderColor: "var(--muted)" }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-foreground text-xl sm:text-2xl" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("Acerca de AlojaManta")}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {tx("Hoteles de Manta, reservados directo.")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-foreground">
              <h4 className="font-bold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
                <span>🏛️</span>
                <span>{tx("Iniciativa Turística Cantonal de Hospedaje Formal")}</span>
              </h4>
              <p>
                <strong>AlojaManta</strong> {tx("es la plataforma tecnológica desarrollada para articular de forma transparente la oferta de alojamiento formal en la ciudad y cantón de Manta, Manabí, conectando a huéspedes nacionales y extranjeros directamente con los establecimientos de hospedaje.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-border bg-background/80">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                  <span className="text-base">🏨</span>
                  <span>{tx("116 Alojamientos")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx("Integra hoteles, hostales, hosterías y residencias turísticas legalmente registradas e inspeccionadas en Barbasquillo, El Murciélago, Tarqui, Los Esteros, San Mateo y Santa Marianita.")}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/80">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                  <span className="text-base">💰</span>
                  <span>{tx("0% Sobreprecio de Intermediarios")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx("Elimina el sobreprecio del 18% al 20% habitual de las agencias de viajes online (OTAs) internacionales. La tarifa que pagas va íntegramente a dinamizar el sector hotelero local.")}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/80">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                  <span className="text-base">🏛️</span>
                  <span>{tx("Comprobante de Reserva y Liquidación")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx("La solicitud requiere aceptación del hotel. El resumen de reserva no acredita el pago ni sustituye una factura.")}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/80">
                <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                  <span className="text-base">📱</span>
                  <span>{tx("Confirmación Digital Inmediata")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx("Al reservar te llega un código. Lo muestras en recepción y listo.")}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 border-border">
              <h4 className="font-bold text-foreground text-xs sm:text-sm mb-1.5">{tx("Compromiso con el Huésped y la Ciudad")}</h4>
              <p className="text-xs text-muted-foreground">
                {tx("Al reservar mediante AlojaManta, aseguras un trato directo con los anfitriones y hoteleros de Manta, políticas de cancelación claras, seguridad en tus pagos digitales y el respaldo de establecimientos que cumplen con los estándares de hospitalidad del puerto manabita.")}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("hub")}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-background cursor-pointer"
              >
                ← {tx("Volver al Panel")}
              </button>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-colors"
                >
                  {tx("Explorar Alojamientos Disponibles →")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal Acerca de AlojaManta ───────────────────────────────────────────────

function AboutModal({
  onClose,
  onExplore,
}: {
  onClose: () => void;
  onExplore?: () => void;
}) {
  const tx = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150" style={{ borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Acerca de AlojaManta")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tx("Hoteles de Manta, reservados directo")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-muted-foreground leading-relaxed">
          {/* Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-foreground">
            <h4 className="font-bold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{tx("Iniciativa Turística y Comercial Cantonal")}</span>
            </h4>
            <p>
              <strong>AlojaManta</strong> {tx("nace como el ecosistema digital directo para que los visitantes puedan reservar con total seguridad en la planta hotelera formal del cantón Manta (Manabí, Ecuador), sin pagar sobreprecios a intermediarios internacionales.")}
            </p>
          </div>

          {/* 4 Pilares clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-border bg-background/70">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                <span className="text-base">🏨</span>
                <span>{tx("116 Establecimientos Registrados")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {tx("Catastro completo de hoteles, hostales, hosterías y departamentos en Barbasquillo, El Murciélago, Tarqui, Los Esteros, San Mateo y Santa Marianita.")}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/70">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                <span className="text-base">💰</span>
                <span>{tx("0% Comisión de Intermediación (OTA)")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {tx("A diferencia de portales foráneos que cobran entre el 18% y 20% al hotelero, aquí se garantiza la tarifa más competitiva y el dinero dinamiza directamente la economía local.")}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/70">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                <span className="text-base">🏛️</span>
                <span>{tx("Voucher de reserva")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {tx("Tu voucher muestra lo que pagaste, con el IVA incluido.")}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-background/70">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                <span className="text-base">📲</span>
                <span>{tx("Vouchers con Código de Confirmación")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {tx("Puedes descargarlo en PDF o verlo en tu cuenta cuando quieras.")}
              </p>
            </div>
          </div>

          {/* Contacto Directo */}
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-foreground text-xs">{tx("Mesa de Asistencia Turística Manta")}</p>
              <p className="text-[11px] text-muted-foreground">{tx("Atención directa para consultas de reserva y orientación en el cantón.")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://wa.me/593998765432?text=Hola%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20AlojaManta"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <span>💬</span>
                <span>{tx("WhatsApp")}</span>
              </a>
              <a
                href="tel:+59352628900"
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-background text-foreground font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <span>📞</span>
                <span>{tx("Llamar")}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-background flex items-center justify-between text-xs" style={{ borderColor: "var(--border)" }}>
          <span className="text-muted-foreground">{tx("Cantón Manta · Manabí · Ecuador")}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-card border border-slate-300 rounded-lg text-foreground font-medium hover:bg-muted cursor-pointer"
            >
              {tx("Cerrar")}
            </button>
            {onExplore && (
              <button
                onClick={onExplore}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                {tx("Explorar Hoteles")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Términos y Privacidad LOPDP ────────────────────────────────────────────

function LegalModal({ onClose }: { onClose: () => void }) {
  const tx = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150" style={{ borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Términos y privacidad")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tx("Normativa tributaria y condiciones de reserva en AlojaManta")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-foreground">
            <h4 className="font-bold text-blue-950 text-sm mb-1 flex items-center gap-1.5">
              <span>🧾</span>
              <span>{tx("Comprobante Digital de Reserva y Pagos")}</span>
            </h4>
            <p>
              {tx("La plataforma emite el comprobante de reserva y certificación de pago digital con el desglose del 15% de IVA. El establecimiento hotelero entrega el recibo y comprobante de estancia directamente presentando tu código de reserva a la llegada.")}
            </p>
          </div>

          <div className="space-y-3">
            <div className="border border-border rounded-xl p-3.5 bg-background/50">
              <h5 className="font-bold text-foreground mb-1">{tx("1. Datos Tributarios Requeridos")}</h5>
              <p className="text-[11px] text-muted-foreground">
                {tx("Puedes registrar previamente tu documento de identidad, nombres completos y correo electrónico desde la pestaña \"Comprobantes y Contacto\" de tu cuenta para agilizar tu registro en recepción.")}
              </p>
            </div>

            <div className="border border-border rounded-xl p-3.5 bg-background/50">
              <h5 className="font-bold text-foreground mb-1">{tx("2. Cancelación y Modificaciones")}</h5>
              <p className="text-[11px] text-muted-foreground">
                {tx("Las políticas de cancelación son transparentes y fijadas por cada establecimiento. Puedes anular o reprogramar tu estancia directamente desde \"Mis Reservas\" o comunicándote con el hotel a través de los canales de asistencia autorizados.")}
              </p>
            </div>

            <div className="border border-border rounded-xl p-3.5 bg-background/50">
              <h5 className="font-bold text-foreground mb-1">{tx("3. Protección y Privacidad de Datos")}</h5>
              <p className="text-[11px] text-muted-foreground">
                {tx("Tus datos personales y de pago se procesan bajo protocolos cifrados y no son compartidos con terceros comerciales ajenos a la estancia hotelera contratada.")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-background flex items-center justify-end text-xs" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            {tx("Entendido")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Consult Reservations Modal ──────────────────────────────────────────────

function ConsultReservationModal({
  reservations,
  onClose,
  onViewVoucher,
  onCancelReservation,
}: {
  reservations: MyReservation[];
  onClose: () => void;
  onViewVoucher: (res: MyReservation) => void;
  onCancelReservation: (resId: string) => void;
}) {
  const tx = useI18n();
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const results = trimmed
    ? reservations.filter(r =>
        r.id.toLowerCase().includes(trimmed) ||
        r.guestEmail.toLowerCase().includes(trimmed) ||
        r.guestName.toLowerCase().includes(trimmed) ||
        r.hotel.toLowerCase().includes(trimmed) ||
        (r.guestPhone && r.guestPhone.includes(trimmed))
      )
    : reservations;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-card overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Consultar Reservas de Hotel")}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                Manta 2026
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tx("Busca por código de confirmación (ej: RES-4821), correo o nombre del titular")}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground cursor-pointer">×</button>
        </div>

        {/* Search input */}
        <div className="p-5 border-b bg-background" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tx("Escribe RES-4821, tu correo (cmendez@gmail.com) o nombre...")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ borderColor: "var(--border)" }}
              autoFocus
            />
            <span className="absolute left-3.5 top-3 text-muted-foreground text-sm">🔍</span>
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-muted-foreground cursor-pointer">
                {tx("Limpiar")}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs">
            <span className="text-muted-foreground">{tx("Códigos rápidos para probar:")}</span>
            {["RES-4821", "RES-5103", "RES-3970", "RES-7720", "RES-8941"].map(c => (
              <button
                key={c}
                onClick={() => setQuery(c)}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-card border border-border text-amber-800 hover:bg-amber-50 cursor-pointer font-semibold"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {results.length > 0 ? (
            results.map(res => {
              const st = getReservationStyle(res);

              return (
                <div key={res.id} className="rounded-xl border p-4 hover:shadow-md transition-all bg-card" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b" style={{ borderColor: "var(--muted)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground break-all">{res.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: st.bg, color: st.color }}>
                          {tx(st.label)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{res.hotel} · {tx(res.city)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">{tx("Importe de la reserva")}</p>
                      <p className="font-bold text-base text-amber-600">{fmt(res.total)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 text-xs text-muted-foreground">
                    <div>
                      <p className="text-muted-foreground text-[10px]">{tx("Huésped Titular")}</p>
                      <p className="font-medium truncate">{res.guestName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">{tx("Tipo de Habitación")}</p>
                      <p className="font-medium truncate">{tx(res.room)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">{tx("Fechas")}</p>
                      <p className="font-medium">{fmtDateShort(res.checkIn)} → {fmtDateShort(res.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">{tx("Duración")}</p>
                      <p className="font-medium">{res.nights} noche{res.nights > 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  <RequestDeadline reservation={res} />
                  <div className="flex items-center justify-between pt-2.5 border-t gap-2" style={{ borderColor: "var(--muted)" }}>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span aria-hidden="true">💳</span> <span>{tx(getPaymentLabel(res))}</span>
                    </span>
                    <div className="flex gap-2">
                      {canCancelReservation(res) && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de cancelar la reserva ${res.id}?`)) {
                              onCancelReservation(res.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer font-medium"
                        >
                          {tx("Cancelar")}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onViewVoucher(res);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>🧾</span>
                        <span>{tx("Ver Voucher & Comprobante")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="font-bold text-foreground">{tx("No encontramos reservas con ese término")}</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {tx("Verifica haber escrito correctamente tu código de confirmación (ej: RES-4821) o el correo con el que hiciste la reserva.")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-background flex items-center justify-between text-xs text-muted-foreground" style={{ borderColor: "var(--border)" }}>
          <span>{tx("¿Inquietudes sobre tu estancia? Central Manta: +593 5 262 8900")}</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-card border rounded-lg text-foreground font-medium hover:bg-muted cursor-pointer">
            {tx("Cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login & Session Modal ────────────────────────────────────────────────────

function LoginModal({
  onClose,
  onGuestLogin,
  onAdminAccess,
  onOpenConsult,
}: {
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
  onAdminAccess?: () => void;
  onOpenConsult?: () => void;
}) {
  const tx = useI18n();
  const [tab, setTab] = useState<"guest" | "admin">("guest");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError(tx("Completa correo y contraseña."));
      return;
    }
    onGuestLogin({ name: name || email.split("@")[0], email });
    onClose();
  }

  function handleDemoLogin(u: GuestUser) {
    onGuestLogin(u);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border bg-card overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <span className="font-bold text-amber-600 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
              AlojaManta
            </span>
            <p className="text-xs text-muted-foreground">{tx("Acceso al sistema y consulta de reservas")}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground cursor-pointer">×</button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
          <button
            onClick={() => setTab("guest")}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              tab === "guest" ? "border-amber-500 text-foreground bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            👤 Huésped / Turista
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              tab === "admin" ? "border-amber-500 text-foreground bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tx("🏨 Personal de Hotel / PMS")}
          </button>
        </div>

        <div className="p-6">
          {tab === "guest" ? (
            <div className="space-y-4">
              <form onSubmit={handleGuestSubmit} className="space-y-3">
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">{tx("Nombre y Apellido")}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={tx("Ej. Carlos Méndez")}
                      className="w-full px-3 py-2 text-sm border rounded-xl"
                      style={{ borderColor: "var(--border)" }}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{tx("Correo Electrónico")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-3 py-2 text-sm border rounded-xl"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{tx("Contraseña")}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border rounded-xl"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
                >
                  {mode === "login" ? tx("Ingresar a mi cuenta") : tx("Crear cuenta")}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-amber-600 hover:underline font-medium cursor-pointer"
                >
                  {mode === "login" ? tx("¿No tienes cuenta? Regístrate gratis") : tx("¿Ya tienes cuenta? Inicia sesión")}
                </button>
              </div>

              {onOpenConsult && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenConsult();
                    }}
                    className="text-xs text-muted-foreground hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    ¿Buscas una reserva con tu código? <span className="font-semibold underline text-amber-600">{tx("Consultar aquí")}</span>
                  </button>
                </div>
              )}

              {/* Acceso Rápido Demo */}
              <div className="pt-3 border-t" style={{ borderColor: "var(--muted)" }}>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                  {tx("Acceso Rápido de Prueba:")}
                </p>
                <button
                  onClick={() => handleDemoLogin({ name: "Carlos Méndez", email: "cmendez@gmail.com" })}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{tx("Ingresar como Carlos Méndez")}</span>
                </button>
                <button
                  onClick={() => handleDemoLogin({ name: "Laura Fernández", email: "lfernandez@hotmail.com" })}
                  className="w-full mt-2 py-2 px-3 text-xs rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-secondary cursor-pointer"
                >
                  {tx("Ingresar como Laura Fernández")}
                </button>
                <p className="text-xs text-muted-foreground mt-2">{tx("Cuentas de prueba sin reservas precargadas.")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-bold">{tx("Panel Multi-Hotel Cantón Manta (116 Alojamientos)")}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {tx("Entrada para el personal de los hoteles.")}
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { role: tx("Superadmin Cantonal"), name: "Carlos Admin", email: "admin@alojamanta.ec", desc: tx("Supervisión de los 116 hoteles de Manta") },
                  { role: tx("Administrador de Hotel"), name: "Ana Administradora", email: "direccion@mantahost.ec", desc: tx("MantaHost Hotel (Gestión integral)") },
                  { role: "Revenue Manager", name: "María Revenue", email: "revenue@mantahost.ec", desc: tx("Tarifas, temporadas y tipos de habitación") },
                  { role: tx("Recepcionista Mostrador"), name: "Juan Recepción", email: "recepcion@mantahost.ec", desc: tx("Operación de reservas y comprobantes digitales") },
                ].map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      onClose();
                      onAdminAccess?.();
                    }}
                    className="w-full p-3 rounded-xl border text-left hover:border-amber-400 hover:bg-background transition-all flex items-center justify-between cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{acc.name} <span className="text-[10px] text-amber-600 font-mono">({acc.role})</span></p>
                      <p className="text-[11px] text-muted-foreground">{acc.desc}</p>
                    </div>
                    <span className="text-xs text-amber-600 font-bold">{tx("Entrar →")}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onClose();
                  onAdminAccess?.();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                {tx("Abrir pantalla completa de acceso hotelero")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Booking modal (Intermediario Oficial de Reservas & Pagos Web) ─────────────

type BookingStep = "details" | "payment" | "invoice";

function BookingModal({
  hotel,
  room,
  params,
  user,
  initialRatePlan = "flexible",
  onClose,
  onGuestLogin,
}: {
  hotel: Hotel;
  room: RoomOffer;
  params: SearchParams;
  user: GuestUser | null;
  initialRatePlan?: "flexible" | "non_refundable" | "breakfast_plus";
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
}) {
  const tx = useI18n();
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);

  // RF-04: Planes de Tarifa
  const [ratePlan, setRatePlan] = useState<"flexible" | "non_refundable" | "breakfast_plus">(initialRatePlan);
  // RF-06: Extras y Servicios Adicionales de Alojamiento
  const [selectedExtras, setSelectedExtras] = useState<{
    airport: boolean;
    extrabed: boolean;
    crib: boolean;
    lateout: boolean;
  }>({ airport: false, extrabed: false, crib: false, lateout: false });

  const effectiveNightlyRate =
    ratePlan === "non_refundable"
      ? Math.round(room.pricePerNight * 0.90 * 100) / 100
      : ratePlan === "breakfast_plus" && !room.breakfastIncluded
      ? room.pricePerNight + 8
      : room.pricePerNight;

  const extrasTotal =
    (selectedExtras.airport ? 15 : 0) +
    (selectedExtras.extrabed ? 20 : 0) +
    (selectedExtras.lateout ? 15 : 0);

  const roomBase = parseFloat((effectiveNightlyRate * nights).toFixed(2));
  const base = parseFloat((roomBase + extrasTotal).toFixed(2));
  const ivaPct = getActiveIvaPercent(hotel.id);
  const iva = parseFloat((base * (ivaPct / 100)).toFixed(2));
  const hasService = hotel.gravaServicio10 ?? false;
  const servicio = hasService ? parseFloat((base * 0.10).toFixed(2)) : 0;
  // Tasa de Pernoctación Turística Municipal (GAD Manta): US$ 2.50 por noche
  const tasaPernoctacion = parseFloat((TASA_PERNOCTACION_MANTA * nights).toFixed(2));
  const total = parseFloat((base + iva + servicio + tasaPernoctacion).toFixed(2));

  // 2 Pasos directos sin cuellos de botella: 1. Datos y Tarifa -> 2. Pago Seguro -> Voucher
  const [step, setStep] = useState<BookingStep>("details");
  const [processing, setProcessing] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [submittedReservation, setSubmittedReservation] = useState<MyReservation | null>(null);

  // Guest details
  const [docType, setDocType] = useState<"CEDULA" | "RUC" | "PASAPORTE">("CEDULA");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    dni: "",
    razonSocial: "",
    country: "Ecuador",
    province: "Pichincha",
    city: "Manta",
    address: "",
    travelPurpose: "Vacacional / Playa",
    travelPurposeOther: "",
    lopdpConsent: true,
    notes: "",
  });

  // Métodos de Pago Directos del Hotel (configurados por cada establecimiento)
  const hotelPayConfig = hotel.paymentConfig ?? buildDefaultHotelPaymentConfig(hotel.stars);
  type PayMethodKey = "card" | "payphone" | "deuna" | "transfer" | "reception";
  const enabledPayMethods: { k: PayMethodKey; icon: string; name: string; desc: string }[] = [
    ...(hotelPayConfig.cardEnabled ? [{ k: "card" as const, icon: "💳", name: tx("Tarjeta"), desc: hotelPayConfig.cardProvider || "Datafast" }] : []),
    ...(hotelPayConfig.payphoneEnabled ? [{ k: "payphone" as const, icon: "📱", name: "PayPhone", desc: tx("Del hotel") }] : []),
    ...(hotelPayConfig.deunaEnabled ? [{ k: "deuna" as const, icon: "📲", name: "DeUna", desc: "Pichincha" }] : []),
    ...(hotelPayConfig.transferEnabled ? [{ k: "transfer" as const, icon: "🏦", name: tx("Transfer."), desc: tx("Cuenta hotel") }] : []),
    ...(hotelPayConfig.receptionEnabled ? [{ k: "reception" as const, icon: "🏨", name: tx("Recepción"), desc: tx("Al llegar") }] : []),
  ];
  const fallbackMethods = enabledPayMethods.length > 0
    ? enabledPayMethods
    : [{ k: "reception" as const, icon: "🏨", name: tx("Recepción"), desc: tx("Al llegar") }];

  const [payMethod, setPayMethod] = useState<PayMethodKey>(fallbackMethods[0].k);
  const [cardHolder, setCardHolder] = useState(user?.name ?? "");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [payphonePhone, setPayphonePhone] = useState("");

  const hotelMeta = HOTEL_COMMERCIAL_INFO[hotel.id] || HOTEL_COMMERCIAL_INFO["costa-sol"];
  const [resId] = useState(() => `RES-${Math.floor(Math.random() * 90000) + 10000}`);
  const [invoiceId] = useState(() => `REC-${hotelMeta.estab || "001"}-${String(Math.floor(Math.random() * 900000) + 100000)}`);
  const [issueDate] = useState(() => new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  const [verifyCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase());
  const last4 = cardNum.replace(/\s/g, "").slice(-4) || "8890";

  const STEPS: { k: BookingStep; l: string }[] = [
    { k: "details", l: tx("1. Datos y Tarifa") },
    { k: "payment", l: tx("2. Pago Seguro") },
    { k: "invoice", l: tx("3. Voucher") },
  ];

  const stepIndex = STEPS.findIndex(s => s.k === step);

  function handleProceedToPayment() {
    if (!form.name.trim()) {
      setRequestError(tx("Por favor ingresa el nombre del huésped titular."));
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setRequestError(tx("Por favor ingresa un email válido para recibir el voucher."));
      return;
    }
    if (!form.dni.trim()) {
      setRequestError(tx("Por favor ingresa tu número de documento (Cédula, RUC o Pasaporte)."));
      return;
    }
    if (docType === "CEDULA" && form.dni.replace(/\D/g, "").length !== 10) {
      setRequestError(tx("La cédula ecuatoriana debe tener 10 dígitos numéricos."));
      return;
    }
    if (docType === "RUC" && form.dni.replace(/\D/g, "").length !== 13) {
      setRequestError(tx("El RUC ecuatoriano debe tener 13 dígitos numéricos."));
      return;
    }
    if (form.travelPurpose === "Otro" && !form.travelPurposeOther.trim()) {
      setRequestError(tx("Por favor escribe el motivo de tu viaje."));
      return;
    }
    if (!form.lopdpConsent) {
      setRequestError(tx("Necesitamos que aceptes la política de privacidad para seguir."));
      return;
    }
    setRequestError("");
    if (!cardHolder) setCardHolder(form.name.trim().toUpperCase());
    setStep("payment");
  }

  function handleFillDemoCard() {
    setCardHolder(form.name ? form.name.toUpperCase() : "CARLOS MENDEZ");
    setCardNum("4242 4242 4242 8890");
    setCardExp("12/28");
    setCardCvv("889");
  }

  function handleExecutePayment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (processing) return;
    if (payMethod === "card") {
      if (!cardHolder.trim() || !cardNum.trim() || !cardExp.trim() || !cardCvv.trim()) {
        setRequestError(tx("Completa todos los datos de la tarjeta para procesar el pago."));
        return;
      }
    }
    setProcessing(true);
    setRequestError("");

    setTimeout(() => {
      try {
        const guestFullName = form.name.trim() || cardHolder || "Huésped Titular";
        const payMethodLabel =
          payMethod === "payphone"
            ? `PayPhone Comercio · ${hotel.name}`
            : payMethod === "deuna"
            ? `DeUna Banco Pichincha · ${hotel.name}`
            : payMethod === "transfer"
            ? `Transferencia Bancaria Directa a ${hotel.name}`
            : payMethod === "reception"
            ? `Pago Directo en Recepción (${hotel.name})`
            : `Tarjeta de Crédito / Débito (${hotelPayConfig.cardProvider || "Datafast"} · ${hotel.name})`;

        const settlement = calculatePlatformSettlement(hotel.id, total, params.checkIn);
        const cleanDigits = cardNum.replace(/\D/g, "");
        const cardLast4 = payMethod === "card" ? (cleanDigits.slice(-4) || "8890") : undefined;
        const cardBrand =
          payMethod === "card"
            ? cleanDigits.startsWith("5")
              ? "MASTERCARD"
              : cleanDigits.startsWith("3")
              ? "DINERS"
              : "VISA"
            : undefined;
        const isPaidNow = payMethod !== "reception";

        const newRes: MyReservation = {
          id: resId,
          hotel: hotel.name,
          hotelId: hotel.id,
          city: hotel.city,
          room: room.type,
          roomId: room.id,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          nights,
          total,
          status: "upcoming",
          paymentStatus: isPaidNow ? "paid" : "pending",
          inventoryMode: "nightly",
          createdAt: new Date().toISOString(),
          arrivalAt: `${params.checkIn}T14:00:00-05:00`,
          adults: params.adults,
          children: params.children,
          notes: form.notes,
          image: room.image || hotel.image,
          guestName: guestFullName,
          guestEmail: form.email.trim() || user?.email || "invitado@alojamanta.ec",
          guestPhone: form.phone || "+593 98 421 8890",
          payMethod: payMethodLabel,
          guestDocumentType: docType,
          guestDocument: form.dni,
          guestRazonSocial: form.razonSocial || guestFullName,
          guestProvince: form.country === "Ecuador" ? form.province : "Exterior",
          guestCity: form.city,
          guestCountry: form.country,
          guestAddress: form.address,
          travelPurpose: form.travelPurpose === "Otro" ? (form.travelPurposeOther.trim() || "Otro") : form.travelPurpose,
          lopdpConsent: form.lopdpConsent,
          cardLast4,
          cardBrand,
          breakdown: {
            roomSubtotal: roomBase,
            extrasSubtotal: extrasTotal,
            ivaAmount: iva,
            ivaPercent: ivaPct,
            service10Amount: servicio,
            tasaPernoctacionAmount: tasaPernoctacion,
            commissionPercent: settlement.commissionPercent,
            retentionCommissionAmount: settlement.retentionCommissionAmount,
            netHotelAmount: settlement.netHotelAmount,
            inAgreement: settlement.inAgreement,
          },
          ...(isPaidNow
            ? {
                payment: {
                  amount: total,
                  method: payMethod === "transfer" ? ("Transferencia externa" as const) : ("Tarjeta externa" as const),
                  reference: `DIR-${Math.floor(Math.random() * 900000) + 100000}`,
                  recordedAt: new Date().toISOString(),
                  recordedBy: `Cobro directo · ${hotel.name}`,
                },
              }
            : {}),
        };

        const existing = guestReservationRepository.read() || [];
        const saved = guestReservationRepository.save([newRes, ...existing]);
        if (!saved) {
          throw new Error("No se pudo guardar la reserva en el almacenamiento local.");
        }
        consumeRoomAvailability(hotel.id, room);
        setSubmittedReservation(newRes);
        setStep("invoice");

        window.dispatchEvent(new Event(RESERVATIONS_CHANGED_EVENT));
        window.dispatchEvent(new CustomEvent("alojamanta-new-booking", { detail: newRes }));

        addAuditLog({
          usuario: guestFullName,
          rol: user ? "Huésped Registrado" : "Checkout Invitado",
          modulo: "Motor de Reservas Web",
          accion: isPaidNow ? "RESERVA_PAGO_DIRECTO_HOTEL" : "RESERVA_PAGO_RECEPCION",
          hotelId: hotel.id,
          hotelName: hotel.name,
          detalle: `Reserva ${resId} en ${hotel.name} (${room.type}, ${nights} noches) · Total directo al hotel: USD $${total.toFixed(2)} (${payMethodLabel})`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al procesar el pago";
        setRequestError(msg);
        addErrorLog({
          usuario: form.email || "Huésped",
          hotelId: hotel.id,
          modulo: "PASARELA",
          codigo: "CHECKOUT_SAVE_ERROR",
          mensaje: msg,
        });
      } finally {
        setProcessing(false);
      }
    }, 1200);
  }

  function handlePrintVoucher() {
    const prevTitle = document.title;
    const safeHotel = (hotelMeta.nombreComercial || hotel.name)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    document.title = `Voucher-${resId}-${safeHotel || "AlojaManta"}`;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    window.setTimeout(restore, 1000);
  }

  // ── Shared backdrop (portaled to document.body for clean single-page PDF/print)
  return createPortal(
    <div
      className="booking-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="booking-modal-dialog w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 border border-border bg-card"
        style={{ maxHeight: "94vh" }}
      >
        {/* Step indicator bar */}
        <div data-print-ui className="flex flex-shrink-0 border-b border-border bg-background/50">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = s.k === step;
            return (
              <div
                key={s.k}
                className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all"
                style={{
                  background: active ? "rgba(245, 158, 11, 0.15)" : "transparent",
                  color: active ? "#b45309" : done ? "#059669" : "var(--muted-foreground)",
                  borderBottom: active ? "2.5px solid #f59e0b" : "2.5px solid transparent",
                }}
              >
                {done ? "✓ " : ""}
                {s.l}
              </div>
            );
          })}
        </div>

        {/* Room Header Strip (Compacto y siempre visible) */}
        {step !== "invoice" && (
          <div data-print-ui className="flex items-center gap-3 px-4 py-2.5 bg-background/80 border-b border-border shrink-0">
            <img src={room.image} alt={tx(room.type)} className="w-12 h-9 rounded-lg object-cover flex-shrink-0 shadow-xs" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-xs sm:text-sm truncate">{hotel.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {tx(room.type)} · {nights} {nights > 1 ? tx("noches") : tx("noche")} ({fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)})
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono font-black text-xs sm:text-sm text-amber-500">{fmt(total)}</p>
              <p className="text-[9px] text-muted-foreground">{tx("Tasas e IVA incl.")}</p>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs bg-muted hover:bg-slate-200 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="booking-modal-body flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* ── STEP 1: DETAILS & TARIFA (Sin fricción ni cuellos de botella) ── */}
          {step === "details" && (
            <div className="space-y-3.5">
              {/* Bloque 1: Datos del Huésped */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>👤</span>
                    <span>{tx("1. Datos del Huésped Titular")}</span>
                  </h3>
                  {!user && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      ⚡ {tx("Checkout Rápido")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      {tx("Nombre y Apellido *")}
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-background text-foreground focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                      style={{ borderColor: "var(--border)" }}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej: Carlos Mendoza"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      {tx("Email para Voucher *")}
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-background text-foreground focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                      style={{ borderColor: "var(--border)" }}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="correo@ejemplo.ec"
                      required
                    />
                  </div>
                </div>

                {/* Documento Ecuatoriano */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{tx("Documento *")}</label>
                    <select
                      value={docType}
                      onChange={e => {
                        const t = e.target.value as "CEDULA" | "RUC" | "PASAPORTE";
                        setDocType(t);
                        setForm(f => ({ ...f, dni: "" }));
                      }}
                      className="w-full px-2.5 py-2 rounded-xl border text-xs font-semibold outline-none bg-background text-foreground cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <option value="CEDULA">{tx("Cédula (10 dig.)")}</option>
                      <option value="RUC">{tx("RUC (13 dig.)")}</option>
                      <option value="PASAPORTE">{tx("Pasaporte")}</option>
                    </select>
                  </div>
                  <div className={docType === "RUC" ? "sm:col-span-1" : "sm:col-span-2"}>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      {docType === "CEDULA" && tx("Número de Cédula *")}
                      {docType === "RUC" && tx("Número de RUC *")}
                      {docType === "PASAPORTE" && tx("N° Pasaporte *")}
                    </label>
                    <input
                      type="text"
                      maxLength={docType === "CEDULA" ? 10 : docType === "RUC" ? 13 : 20}
                      value={form.dni}
                      onChange={e => {
                        let val = e.target.value;
                        if (docType === "CEDULA" || docType === "RUC") val = val.replace(/\D/g, "");
                        else val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        setForm({ ...form, dni: val });
                      }}
                      placeholder={docType === "CEDULA" ? "1314589201" : docType === "RUC" ? "1391789456001" : "A14892015"}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      required
                    />
                  </div>
                  {docType === "RUC" && (
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{tx("Razón Social *")}</label>
                      <input
                        type="text"
                        value={form.razonSocial}
                        onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                        placeholder="Empresa S.A."
                        className="w-full px-2.5 py-2 rounded-xl border text-xs outline-none bg-background text-foreground"
                        style={{ borderColor: "var(--border)" }}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Teléfono WhatsApp */}
                <div className="mt-2">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{tx("Teléfono / WhatsApp *")}</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none font-mono bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+593 98 421 8890"
                    required
                  />
                </div>

                {/* Demografía y Motivo de Viaje (Para Analítica Turística) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{tx("Provincia de procedencia")}</label>
                    <select
                      value={form.province}
                      onChange={e => setForm({ ...form, province: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border text-xs outline-none bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {["Pichincha", "Guayas", "Manabí", "Azuay", "Tungurahua", "Santo Domingo", "El Oro", "Loja", "Imbabura", "Otra / Exterior"].map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{tx("Motivo de viaje")}</label>
                    <select
                      value={form.travelPurpose}
                      onChange={e => setForm({ ...form, travelPurpose: e.target.value, travelPurposeOther: e.target.value === "Otro" ? form.travelPurposeOther : "" })}
                      className="w-full px-2.5 py-2 rounded-xl border text-xs outline-none bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <option value="Vacacional / Playa">{tx("Vacacional / Playa")}</option>
                      <option value="Corporativo / Negocios">{tx("Corporativo / Negocios")}</option>
                      <option value="Evento Deportivo / Kitesurf">{tx("Evento Deportivo / Kitesurf")}</option>
                      <option value="Gastronomía">{tx("Gastronomía")}</option>
                      <option value="Tránsito Aeropuerto / Terminal">{tx("Tránsito Aeropuerto / Terminal")}</option>
                      <option value="Otro">{tx("Otro")}</option>
                    </select>
                  </div>
                  {form.travelPurpose === "Otro" && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        {tx("Especifica el motivo de viaje")} *
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        placeholder={tx("Ej: Visita familiar, graduación, cita médica...")}
                        value={form.travelPurposeOther}
                        onChange={e => setForm({ ...form, travelPurposeOther: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl border text-xs outline-none bg-background text-foreground focus:border-amber-500"
                        style={{ borderColor: "var(--border)" }}
                      />
                    </div>
                  )}
                </div>

                <label className="mt-2.5 flex items-start gap-2 text-[11px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.lopdpConsent}
                    onChange={e => setForm({ ...form, lopdpConsent: e.target.checked })}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span>{tx("Autorizo el tratamiento de mis datos según la política LOPDP para gestionar mi reserva y registro en el hotel.")}</span>
                </label>
              </div>

              {/* Bloque 2: Plan de Tarifa (Compacto) */}
              <div className="rounded-xl border p-3 bg-background/60 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{tx("2. Plan de Tarifa")}</span>
                  <span className="font-mono text-amber-600 font-bold">{fmt(effectiveNightlyRate)} / noche</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${ratePlan === "flexible" ? "bg-amber-500/10 border-amber-500 font-semibold" : "bg-card border-border text-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "flexible"} onChange={() => setRatePlan("flexible")} className="accent-amber-500" />
                      <div>
                        <p className="font-bold text-foreground text-xs">{tx("Tarifa Flexible")}</p>
                        <p className="text-[10px] text-muted-foreground">{tx("Cancelación gratuita hasta 48h")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground">{fmt(room.pricePerNight)}</span>
                  </label>

                  <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${ratePlan === "non_refundable" ? "bg-emerald-500/10 border-emerald-500 font-semibold" : "bg-card border-border text-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "non_refundable"} onChange={() => setRatePlan("non_refundable")} className="accent-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">{tx("No Reembolsable (-10%)")}</p>
                        <p className="text-[10px] text-muted-foreground">{tx("Ahorro inmediato")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{fmt(Math.round(room.pricePerNight * 0.90 * 100) / 100)}</span>
                  </label>
                </div>
              </div>

              {/* Bloque 3: Servicios Adicionales (Píldoras de 1 clic) */}
              <div className="rounded-xl border p-3 bg-background/60 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{tx("3. Servicios Adicionales")}</span>
                  {extrasTotal > 0 && <span className="font-mono font-bold text-emerald-600 text-xs">+{fmt(extrasTotal)}</span>}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { k: "airport" as const, label: tx("Traslado Aeropuerto MEC"), price: "+$15" },
                    { k: "extrabed" as const, label: tx("Cama adicional"), price: "+$20" },
                    { k: "crib" as const, label: tx("Cuna para bebé"), price: "$0" },
                    { k: "lateout" as const, label: tx("Late check-out (16h)"), price: "+$15" },
                  ].map(ext => (
                    <label key={ext.k} className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${selectedExtras[ext.k] ? "bg-amber-500/10 border-amber-500 font-semibold text-foreground" : "bg-card border-border text-muted-foreground"}`}>
                      <span className="flex items-center gap-1.5 truncate text-[11px]">
                        <input
                          type="checkbox"
                          checked={selectedExtras[ext.k]}
                          onChange={e => setSelectedExtras(s => ({ ...s, [ext.k]: e.target.checked }))}
                          className="accent-amber-500 rounded"
                        />
                        <span className="truncate">{ext.label}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold shrink-0">{ext.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Desglose de Precios (Compacto por defecto para evitar scrolls infinitos) */}
              <PriceBreakdownBox
                basePrice={base / nights}
                nights={nights}
                hasService10={hasService}
                hotelName={hotel.name}
                defaultExpanded={false}
                showToggle={true}
              />

              {requestError && (
                <p className="text-xs px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200">{requestError}</p>
              )}
            </div>
          )}

          {/* ── STEP 2: PAYMENT (Métodos de Pago Propios del Hotel · Sin retención) ── */}
          {step === "payment" && (
            <form onSubmit={handleExecutePayment} className="space-y-3.5">
              <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 p-2.5 text-xs text-foreground flex items-center gap-2">
                <span className="text-base shrink-0">🛡️</span>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  <strong className="text-foreground">{tx("Pago directo al alojamiento:")}</strong>{" "}
                  {tx("AlojaManta no retiene tu dinero; el 100 % se acredita directamente a {name} usando sus métodos de pago habilitados.", { name: hotel.name })}
                </p>
              </div>

              {/* Selector dinámico de Métodos de Pago habilitados por ESTE hotel */}
              <div className={`grid gap-2 ${fallbackMethods.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : fallbackMethods.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {fallbackMethods.map(pm => (
                  <button
                    key={pm.k}
                    type="button"
                    onClick={() => setPayMethod(pm.k)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      payMethod === pm.k
                        ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm font-bold ring-2 ring-amber-500/25"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-base">{pm.icon}</span>
                    <span className="text-xs font-bold leading-tight">{pm.name}</span>
                    <span className="text-[9px] text-muted-foreground">{pm.desc}</span>
                  </button>
                ))}
              </div>

              {/* Formulario de Tarjeta (Pasarela propia del hotel) */}
              {payMethod === "card" && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {tx("Pasarela propia de {name}", { name: hotel.name })} ({hotelPayConfig.cardProvider || "Datafast"})
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡</span>
                      <span>{tx("Llenar tarjeta demo")}</span>
                    </button>
                  </div>

                  <div>
                    <input
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none uppercase bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder={tx("TITULAR DE LA TARJETA")}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="w-full px-3 py-2 rounded-xl border text-xs outline-none font-mono bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      maxLength={19}
                      value={cardNum}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                        setCardNum(formatted);
                      }}
                      placeholder="4242 4242 4242 8890"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="w-full px-2 py-2 rounded-xl border text-xs outline-none font-mono bg-background text-foreground text-center"
                        style={{ borderColor: "var(--border)" }}
                        maxLength={5}
                        value={cardExp}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                          setCardExp(v);
                        }}
                        placeholder="MM/AA"
                        required
                      />
                      <input
                        type="password"
                        className="w-full px-2 py-2 rounded-xl border text-xs outline-none font-mono bg-background text-foreground text-center"
                        style={{ borderColor: "var(--border)" }}
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="CVV"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "payphone" && (
                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5 text-center">
                  <p className="font-bold text-xs text-foreground">PayPhone · {hotel.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tx("Ingresa tu número celular registrado en PayPhone (acreditación directa al hotel):")}</p>
                  <input
                    type="tel"
                    value={payphonePhone}
                    onChange={e => setPayphonePhone(e.target.value)}
                    placeholder="0984218890"
                    className="w-full max-w-xs mx-auto px-3 py-2 rounded-xl border text-xs font-mono bg-card text-foreground text-center"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              )}

              {payMethod === "deuna" && (
                <div className="p-3 rounded-xl border border-border bg-background text-center space-y-1">
                  <p className="font-bold text-xs text-foreground">DeUna / Banco Pichincha · {hotel.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {hotelPayConfig.deunaAccount
                      ? `${tx("Cuenta DeUna del hotel:")} ${hotelPayConfig.deunaAccount}`
                      : tx("Pago directo sin comisión hacia la cuenta DeUna registrada por este alojamiento.")}
                  </p>
                </div>
              )}

              {payMethod === "transfer" && (
                <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
                  <p className="font-bold text-foreground">{tx("Cuenta bancaria directa de {name}:", { name: hotel.name })}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {hotel.bancoAcreditacion || "Banco configurado por el hotel"} ·{" "}
                    {hotel.tipoCuentaBancaria === "AHORROS" ? "Cta. Ahorros" : "Cta. Corriente"}{" "}
                    {hotel.numeroCuentaBancaria || tx("(solicitar en chat del hotel)")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {tx("Titular:")} <strong className="text-foreground">{hotel.titularCuentaBancaria || hotel.razonSocial || hotel.name}</strong>
                    {hotel.taxId ? ` · RUC: ${hotel.taxId}` : ""}
                  </p>
                </div>
              )}

              {payMethod === "reception" && (
                <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
                  <p className="font-bold text-foreground">{tx("Pago directo en recepción al llegar")}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {tx("Confirmarás tu cupo y recibirás tu Voucher Oficial ahora; el monto total se abona directamente en la recepción de {name} al momento del check-in.", { name: hotel.name })}
                  </p>
                </div>
              )}

              {/* Resumen Final de Cobro */}
              <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({nights}n):</span>
                  <span className="font-mono">US${base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos y tasas ({ivaPct}% IVA + Tasa GAD):</span>
                  <span className="font-mono">US${(iva + servicio + tasaPernoctacion).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border font-bold text-sm text-foreground">
                  <span>{tx("Total a Pagar")}:</span>
                  <span className="font-mono text-amber-500">US${total.toFixed(2)}</span>
                </div>
              </div>

              {requestError && (
                <p className="text-xs px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200">{requestError}</p>
              )}
            </form>
          )}

          {/* ── STEP 3: VOUCHER OFICIAL (Liquidación Inmediata) ── */}
          {step === "invoice" && (
            <div className="booking-voucher-shell space-y-3.5">
              <div className="booking-voucher-intro text-center py-2">
                <div className="booking-voucher-check w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-1.5 shadow-xs">
                  ✓
                </div>
                <h3 className="font-bold text-foreground text-sm sm:text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("¡Pago Aprobado y Reserva Confirmada!")}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {tx("Voucher Oficial emitido por AlojaManta · Cupo garantizado")}
                </p>
              </div>

              {/* Voucher Card */}
              <div className="booking-voucher-card rounded-2xl border border-border overflow-hidden shadow-md bg-card">
                <div className="booking-voucher-header px-4 py-3 bg-slate-950 text-white flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-xs sm:text-sm text-amber-400" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {hotelMeta.nombreComercial || hotel.name}
                      </p>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {tx("PAGADO")}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">{hotelMeta.razonSocial}</p>
                    <p className="text-[9px] text-slate-400 font-mono">RUC: {hotelMeta.ruc} · Manta, Ecuador</p>
                    {hotel.address && (
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{hotel.address}{hotel.phone ? ` · ${hotel.phone}` : ""}</p>
                    )}
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tx("VOUCHER")}
                    </span>
                    <p className="font-bold mt-1 text-slate-200 text-[11px]">{invoiceId}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{tx("Emitido")}: {issueDate}</p>
                  </div>
                </div>

                {/* Banner Informativo de Facturación Directa del Hotel */}
                <div className="booking-voucher-notice px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200/80 text-[10px] text-amber-950 dark:text-amber-200 leading-tight">
                  <p className="font-bold">
                    {tx("Emisión de Factura / Comprobante Directo por el Hotel:")}
                  </p>
                  <p className="booking-voucher-notice-sub text-muted-foreground mt-0.5">
                    {tx("Tu reserva está pagada y garantizada por AlojaManta. El comprobante comercial te lo entregará directamente el hotel a tu llegada con tus datos registrados")} ({docType}: {form.dni}).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border text-xs">
                  <div className="p-3 bg-card">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">{tx("Huésped titular")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate">{form.name || user?.name || "Huésped Titular"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{docType}: {form.dni}</p>
                    {(form.email || user?.email) && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{form.email || user?.email}</p>
                    )}
                  </div>
                  <div className="p-3 bg-card">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">{tx("Estancia")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate">{tx(room.type)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)} ({nights}n)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {params.adults} {params.adults === 1 ? tx("adulto") : tx("adultos")}
                      {params.children > 0 ? ` · ${params.children} ${params.children === 1 ? tx("niño") : tx("niños")}` : ""} · 15:00 / 12:00
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-background border-t border-border space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tx("Subtotal")} ({nights}n):</span>
                    <span>US${base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{servicio > 0 ? `${ivaPct}% IVA + 10% Serv.:` : `${ivaPct}% IVA:`}</span>
                    <span>US${(iva + servicio).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tx("Tasa Pernoctación (GAD Manta):")}</span>
                    <span>US${tasaPernoctacion.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border font-bold text-foreground">
                    <span>{tx("TOTAL PAGADO:")}</span>
                    <span className="text-amber-600">US${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="booking-voucher-footer px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-muted-foreground block">{tx("Código de Reserva")}</span>
                    <span className="font-mono font-bold text-xs text-foreground">{resId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold text-muted-foreground block">{tx("PIN de Seguridad")}</span>
                    <span className="booking-voucher-pin font-mono font-bold text-xs text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded inline-block mt-0.5">
                      PIN: {verifyCode}
                    </span>
                  </div>
                </div>
              </div>

              <p className="hidden print:block text-center text-[10px] text-slate-500 pt-1">
                {tx("Presenta este voucher y tu documento de identidad en la recepción del hotel.")} · AlojaManta · Manta, Ecuador
              </p>

              {/* Botón de Mensajería Interna en el Portal (Huésped <-> Hotel) */}
              {submittedReservation && (
                <button
                  type="button"
                  data-print-ui
                  onClick={() => {
                    ensureReservationThread(submittedReservation);
                    onClose();
                    openGuestChatForReservation(submittedReservation, "normal");
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-amber-500/40 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <IconMessenger className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{tx("Abrir chat en el portal con el hotel (Recepción / Admin)")}</span>
                </button>
              )}

              {/* Botón WhatsApp Directo */}
              <a
                data-print-ui
                href={buildWhatsAppUrl(hotel.phone, hotel.name, resId, form.name, params.checkIn, params.checkOut, room.type)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>{tx("Enviar Voucher y Coordinar Llegada por WhatsApp")}</span>
              </a>

              <div data-print-ui className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  {tx("Cerrar")}
                </button>
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>⬇</span>
                  <span>{tx("Descargar Voucher PDF")}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── STICKY BOTTOM ACTION BAR (Siempre visible, cero cuello de botella) ─── */}
        {step !== "invoice" && (
          <div data-print-ui className="p-3 sm:p-4 bg-background border-t border-border flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <div>
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                {tx("Total a pagar")}:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-black text-lg sm:text-xl text-amber-500">
                  US${total.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground">({nights}n)</span>
              </div>
            </div>

            {step === "details" ? (
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{tx("Continuar al Pago")}</span>
                <span>→</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  {tx("← Volver")}
                </button>
                <button
                  type="button"
                  onClick={() => handleExecutePayment()}
                  disabled={processing}
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{tx("Procesando...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{payMethod === "reception" ? "✓" : "🔒"}</span>
                      <span>
                        {payMethod === "reception"
                          ? tx("Confirmar reserva")
                          : `${tx("Pagar")} US$${total.toFixed(2)}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}


// ─── Hotel card ───────────────────────────────────────────────────────────────

function HotelCard({ hotel, nights, onSelect }: { hotel: Hotel; nights: number; onSelect: () => void }) {
  const tx = useI18n();
  const n = Math.max(nights, 1);
  return (
    <div className="rounded-2xl overflow-hidden border bg-card transition-all hover:shadow-lg cursor-pointer group" style={{ borderColor: "var(--border)" }} onClick={onSelect}>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64 flex-shrink-0 relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={hotel.image}
            alt={hotel.name}
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {hotel.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#ffffff" }}>{tx(t)}</span>)}
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-2 mb-0.5"><StarsRow n={hotel.stars} /><span className="text-xs text-muted-foreground">{tx(hotel.city)}</span></div>
                <h3 className="font-bold text-foreground text-base group-hover:text-amber-600 transition-colors">{hotel.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{hotel.address}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#1e3a5f" }}>
                  <span className="font-bold text-white text-sm">{hotel.rating}</span><span className="text-white/60 text-xs">/ 5</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{hotel.reviews} {tx("opiniones")}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{txDesc(hotel.description)}</p>
            {(() => {
              const d = getHotelDetailedDistances(hotel.lat, hotel.lng);
              return (
                <p className="text-[11px] text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <span>{tx("Playa")}: <strong className="font-medium text-foreground">{d.playa.label}</strong></span>
                  <span>·</span>
                  <span>{tx("Centro")}: <strong className="font-medium text-foreground">{d.centro.label}</strong></span>
                  <span>·</span>
                  <span>{tx("Aeropuerto")}: <strong className="font-medium text-foreground">{d.aeropuerto.label}</strong></span>
                </p>
              );
            })()}
            <div className="flex flex-wrap gap-1 mt-2">
              {hotel.amenities.slice(0, 5).map(a => <span key={a} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "#475569" }}>{tx(a)}</span>)}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--muted)" }}>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{tx("Precio desde")}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground leading-none">US${hotel.priceFrom}</span>
                <span className="text-xs text-muted-foreground font-medium">{tx("/ noche")}</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground mt-1">
                + US${(((hotel.priceFrom * n) * (getActiveIvaPercent(hotel.id) / 100)) + (hotel.gravaServicio10 ? ((hotel.priceFrom * n) * 0.10) : 0)).toFixed(2)} {tx("de impuestos")} ({n}n)
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground font-medium border border-border">
                  {hotel.gravaServicio10
                    ? `${getActiveIvaPercent(hotel.id)}% IVA + ${tx("10% Servicio Turístico")}`
                    : `${getActiveIvaPercent(hotel.id)}% IVA (${tx("Hostal Exento 10% Serv.")})`}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ {tx("Sujeta a aceptación del hotel")}
                </span>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all self-end sm:self-auto shadow-sm" style={{ background: "#f59e0b", color: "#0c1220" }}>
              {tx("Ver habitaciones →")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hotel detail ─────────────────────────────────────────────────────────────

type HotelReviewSegment = "all" | "pareja" | "familia" | "negocios";

interface HotelGuestReview {
  id: string;
  author: string;
  origin: string;
  segment: Exclude<HotelReviewSegment, "all">;
  segmentLabel: string;
  score: number;
  dateLabel: string;
  roomName: string;
  title: string;
  comment: string;
}

function buildHotelGuestReviews(hotel: Hotel, score10: number): HotelGuestReview[] {
  let hash = 0;
  for (let i = 0; i < hotel.id.length; i++) {
    hash = (hash * 31 + hotel.id.charCodeAt(i)) >>> 0;
  }
  const roomA = hotel.rooms[0]?.type ?? "Habitación Estándar";
  const roomB = hotel.rooms[1]?.type ?? roomA;
  const roomC = hotel.rooms[2]?.type ?? roomB;
  const hasPool = hotel.amenities.some(a => a.toLowerCase().includes("piscina"));
  const hasBreakfast = hotel.rooms.some(r => r.breakfastIncluded) || hotel.amenities.some(a => a.toLowerCase().includes("desayuno"));
  const sectorLabel = hotel.sector || hotel.city || "Manta";

  const names = [
    { author: "Andrea Cevallos", origin: "Quito, Ecuador" },
    { author: "Diego Zambrano", origin: "Guayaquil, Ecuador" },
    { author: "Sofía Palacios", origin: "Cuenca, Ecuador" },
    { author: "Mateo Restrepo", origin: "Bogotá, Colombia" },
    { author: "Valeria Morales", origin: "Ambato, Ecuador" },
    { author: "Esteban Benítez", origin: "Loja, Ecuador" },
  ];
  const pick = (offset: number) => names[(hash + offset) % names.length];

  const s1 = Math.min(10, Number((score10 + 0.3).toFixed(1)));
  const s2 = Math.min(9.9, Number(score10.toFixed(1)));
  const s3 = Math.max(8.0, Number((score10 - 0.2).toFixed(1)));
  const s4 = Math.min(10, Number((score10 + 0.1).toFixed(1)));

  const r1 = pick(0);
  const r2 = pick(1);
  const r3 = pick(2);
  const r4 = pick(3);

  return [
    {
      id: `${hotel.id}-rev-1`,
      author: r1.author,
      origin: r1.origin,
      segment: "pareja",
      segmentLabel: "En pareja",
      score: s1,
      dateLabel: "Octubre 2026",
      roomName: roomA,
      title: "Excelente ubicación y atención cálida",
      comment: `Muy buena experiencia en ${sectorLabel}. El proceso con el voucher de AlojaManta en recepción fue rápido, la habitación estaba impecable${hasPool ? " y disfrutamos muchísimo la piscina al atardecer" : ""}.`,
    },
    {
      id: `${hotel.id}-rev-2`,
      author: r2.author,
      origin: r2.origin,
      segment: "negocios",
      segmentLabel: "Viaje de negocios",
      score: s2,
      dateLabel: "Septiembre 2026",
      roomName: roomB,
      title: "Práctico, silencioso y con buen WiFi",
      comment: `Viajé por trabajo a Manta y el alojamiento cumplió al 100%. Buena señal WiFi para videollamadas, fácil salida hacia la zona comercial y el hotel me entregó mi factura directo en recepción sin demoras.`,
    },
    {
      id: `${hotel.id}-rev-3`,
      author: r3.author,
      origin: r3.origin,
      segment: "familia",
      segmentLabel: "En familia",
      score: s3,
      dateLabel: "Agosto 2026",
      roomName: roomC,
      title: "Cómodo para descansar cerca de la playa",
      comment: `Viajamos en familia por el feriado. Habitaciones limpias, aire acondicionado funcionando perfecto${hasBreakfast ? " y buen desayuno para empezar el día" : ""}. Todo el desglose de impuestos fue claro desde el inicio.`,
    },
    {
      id: `${hotel.id}-rev-4`,
      author: r4.author,
      origin: r4.origin,
      segment: "pareja",
      segmentLabel: "En pareja",
      score: s4,
      dateLabel: "Julio 2026",
      roomName: roomA,
      title: "Gran relación calidad-precio en Manta",
      comment: `Personal muy atento con recomendaciones locales de gastronomía manabita y playas cercanas. Sin duda volveríamos a reservar aquí en nuestra próxima visita a Manta.`,
    },
  ];
}

function HotelGalleryLightbox({
  items,
  activeIndex,
  hotelName,
  onClose,
  onChangeIndex,
}: {
  items: { url: string; caption: string }[];
  activeIndex: number;
  hotelName: string;
  onClose: () => void;
  onChangeIndex: (next: number) => void;
}) {
  const tx = useI18n();
  const total = items.length;
  const current = items[activeIndex] ?? items[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChangeIndex((activeIndex + 1) % total);
      if (e.key === "ArrowLeft") onChangeIndex((activeIndex - 1 + total) % total);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, total, onClose, onChangeIndex]);

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={tx("Galería de fotos de {name}", { name: hotelName })}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 text-white">
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{hotelName}</p>
          <p className="text-xs text-slate-300 truncate">
            {current.caption} · {activeIndex + 1} / {total}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer transition-colors"
        >
          {tx("Cerrar")} ✕
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-4 sm:px-14 py-4 min-h-0">
        {total > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex - 1 + total) % total)}
            aria-label={tx("Foto anterior")}
            className="absolute left-3 sm:left-5 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center text-lg cursor-pointer transition-colors"
          >
            ‹
          </button>
        )}

        <img
          src={current.url}
          alt={current.caption}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl select-none"
        />

        {total > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex + 1) % total)}
            aria-label={tx("Foto siguiente")}
            className="absolute right-3 sm:right-5 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center text-lg cursor-pointer transition-colors"
          >
            ›
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto">
          {items.map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              type="button"
              onClick={() => onChangeIndex(idx)}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                idx === activeIndex ? "border-amber-400 scale-105 opacity-100" : "border-transparent opacity-55 hover:opacity-90"
              }`}
            >
              <img
                src={item.url}
                alt={item.caption}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

function HotelDetail({
  hotel,
  params,
  onChangeParams,
  onSelectHotel,
  onBack,
  onBook,
}: {
  hotel: Hotel;
  params: SearchParams;
  onChangeParams: (p: SearchParams) => void;
  onSelectHotel: (h: Hotel) => void;
  onBack: () => void;
  onBook: (r: RoomOffer, ratePlan?: "flexible" | "non_refundable") => void;
}) {
  const tx = useI18n();
  const arrivalPolicy = useArrivalPolicy(hotel.id, params.checkIn);
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);
  const ivaPct = getActiveIvaPercent(hotel.id);

  const [activeTab, setActiveTab] = useState("hotel-resumen");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showHotelMap, setShowHotelMap] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<HotelReviewSegment>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [expandedBreakdownRoom, setExpandedBreakdownRoom] = useState<string | null>(null);

  // Galería unificada: primero las fotos gestionadas desde el Portal Admin (hotel.gallery), luego portada y fotos de habitaciones
  const galleryItems: { url: string; caption: string }[] = [];
  const seenUrls = new Set<string>();
  const pushPhoto = (url: string | undefined, caption: string) => {
    const clean = (url ?? "").trim();
    if (!clean || seenUrls.has(clean)) return;
    seenUrls.add(clean);
    galleryItems.push({ url: clean, caption });
  };
  (hotel.gallery ?? []).forEach((url, idx) =>
    pushPhoto(url, idx === 0 ? tx("Vista principal de {name}", { name: hotel.name }) : tx("{name}, vista {n}", { name: hotel.name, n: idx + 1 }))
  );
  pushPhoto(hotel.image, tx("Vista principal de {name}", { name: hotel.name }));
  hotel.rooms.forEach(room => pushPhoto(room.image, tx(room.type)));
  if (galleryItems.length === 0) {
    pushPhoto(FALLBACK_HOTEL_IMAGE, hotel.name);
  }

  const heroPhotos = galleryItems.slice(0, 5);
  const score10 = Math.min(9.9, Math.max(8.2, Number((hotel.rating * 1.98).toFixed(1))));
  const scoreLabel = score10 >= 9.0 ? tx("Fantástico") : score10 >= 8.5 ? tx("Muy bien") : tx("Bien");
  const subcriteria = [
    { label: tx("Limpieza e Higiene"), val: Math.min(10, Number((score10 + 0.2).toFixed(1))) },
    { label: tx("Ubicación en Manta"), val: Math.min(10, Number((score10 + 0.1).toFixed(1))) },
    { label: tx("Atención del Personal"), val: score10 },
    { label: tx("Relación Calidad-Precio"), val: Math.max(8.0, Number((score10 - 0.2).toFixed(1))) },
    { label: tx("Conectividad WiFi"), val: Math.max(8.1, Number((score10 - 0.1).toFixed(1))) },
  ];

  // Distancias reales por coordenadas lat/lng del alojamiento
  const detailedDist = getHotelDetailedDistances(hotel.lat, hotel.lng);
  const safeLat = hotel.lat ?? -0.9520;
  const safeLng = hotel.lng ?? -80.7250;
  const landmarkDist = (id: string) => {
    const lm = MANTA_LANDMARKS.find(item => item.id === id);
    if (!lm) return null;
    const km = calculateDistanceKm(safeLat, safeLng, lm.lat, lm.lng);
    return { name: lm.name, label: formatDistanceString(km), km };
  };

  const beachSpots = [
    { name: `${detailedDist.playa.name} (${tx("más cercana")})`, label: detailedDist.playa.label },
    ...[
      landmarkDist("playa-el-murcielago"),
      landmarkDist("playa-santa-marianita"),
      landmarkDist("puerto-san-mateo"),
    ]
      .filter((item): item is { name: string; label: string; km: number } => Boolean(item))
      .filter(item => !item.name.toLowerCase().includes(detailedDist.playa.name.toLowerCase().replace("playa ", ""))),
  ].slice(0, 4);

  const citySpots = [
    { name: tx("Mall del Pacífico & Zona Bancaria"), label: detailedDist.mall.label },
    { name: tx("Centro Histórico & Plaza Cívica"), label: detailedDist.centro.label },
  ];

  const transportSpots = [
    { name: tx("Aeropuerto Internacional Eloy Alfaro (MEC)"), label: detailedDist.aeropuerto.label },
    { name: tx("Terminal Terrestre Luis Valdivieso Morán"), label: detailedDist.terminal.label },
  ];

  const guestReviews = buildHotelGuestReviews(hotel, score10);
  const visibleReviews = reviewFilter === "all" ? guestReviews : guestReviews.filter(r => r.segment === reviewFilter);
  const topQuote = guestReviews[0];

  const checkInHour = hotel.horaCheckIn || arrivalPolicy.arrivalTime || "15:00";
  const checkOutHour = hotel.horaCheckOut || "12:00";
  const freeCancelDays = hotel.diasCancelacionGratuita ?? 2;
  const hasAnyBreakfast = hotel.rooms.some(r => r.breakfastIncluded);
  const hasService10 = hotel.gravaServicio10 ?? false;

  const matchingRooms = hotel.rooms.filter(r => r.capacity >= params.adults);
  const showingAllRoomsFallback = matchingRooms.length === 0 && hotel.rooms.length > 0;
  const roomsToDisplay = showingAllRoomsFallback ? hotel.rooms : matchingRooms;

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const computeRoomTotals = (nightlyPrice: number) => {
    const subtotal = Number((nightlyPrice * nights).toFixed(2));
    const iva = Number((subtotal * (ivaPct / 100)).toFixed(2));
    const service = hasService10 ? Number((subtotal * 0.10).toFixed(2)) : 0;
    const municipalFee = Number((TASA_PERNOCTACION_MANTA * nights).toFixed(2));
    const taxes = Number((iva + service + municipalFee).toFixed(2));
    return { subtotal, taxes, total: Number((subtotal + taxes).toFixed(2)) };
  };

  const anchorTabs = [
    { id: "hotel-resumen", label: tx("Resumen") },
    { id: "hotel-habitaciones", label: tx("Habitaciones y precios") },
    { id: "hotel-comentarios", label: `${tx("Comentarios")} (${hotel.reviews})` },
    { id: "hotel-alrededores", label: tx("Alrededores") },
    { id: "hotel-servicios", label: tx("Servicios") },
    { id: "hotel-normas", label: tx("Normas de la casa") },
  ];

  const faqs = [
    {
      q: tx("¿Cuál es el horario de check-in y check-out en {name}?", { name: hotel.name }),
      a: tx("El check-in está habilitado desde las {in}h y el check-out hasta las {out}h (hora de Ecuador). Si necesitas salir más tarde, puedes solicitar late check-out hasta las 16:00h como servicio adicional al reservar.", { in: checkInHour, out: checkOutHour }),
    },
    {
      q: tx("¿A qué distancia queda de la playa y del Aeropuerto de Manta (MEC)?"),
      a: tx("El alojamiento se encuentra a {playaDist} de {playa}, a {mallDist} del Mall del Pacífico y a {aeroDist} del Aeropuerto Internacional Eloy Alfaro (MEC).", {
        playaDist: detailedDist.playa.label,
        playa: detailedDist.playa.name,
        mallDist: detailedDist.mall.label,
        aeroDist: detailedDist.aeropuerto.label,
      }),
    },
    {
      q: tx("¿El precio incluye desayuno y cancelación gratuita?"),
      a: hasAnyBreakfast
        ? tx("Algunas habitaciones incluyen desayuno (se indica con etiqueta verde en cada opción). Además, todas las habitaciones ofrecen Tarifa Flexible con cancelación gratuita hasta {days} días antes o Tarifa No Reembolsable con 10% de ahorro.", { days: freeCancelDays })
        : tx("Puedes elegir entre Tarifa Flexible (cancelación gratuita hasta {days} días antes) o Tarifa No Reembolsable (-10%). También puedes añadir servicios adicionales durante el paso de reserva.", { days: freeCancelDays }),
    },
    {
      q: tx("¿Cómo recibo mi comprobante de reserva y la factura del hotel?"),
      a: tx("Al confirmar tu pago en AlojaManta recibes inmediatamente tu Voucher Oficial (código RES y PIN de seguridad). La factura o comprobante comercial te lo entrega directamente {name} al momento de tu llegada con los datos que registraste.", { name: hotel.name }),
    },
  ];

  return (
    <div style={{ background: "var(--background)" }}>
      {/* Barra fija de navegación por anclas (estilo Booking) */}
      <div className="sticky top-[57px] z-20 border-b backdrop-blur-md" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto">
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0" aria-label={tx("Secciones del alojamiento")}>
            {anchorTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={`px-3 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "border-amber-500 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => scrollToSection("hotel-habitaciones")}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 cursor-pointer transition-colors"
          >
            {tx("Reservar ahora")}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-8">
        {/* ── 1. RESUMEN: CABECERA + GALERÍA + COLUMNA LATERAL ── */}
        <section id="hotel-resumen" className="scroll-mt-32 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {tx("← Volver a resultados")}
            </button>
            <span className="text-[11px] text-muted-foreground">
              {hotel.parish && hotel.parish.toLowerCase() !== "manta"
                ? `Manta · ${hotel.parish}`
                : hotel.sector
                ? `Manta · ${hotel.sector}`
                : "Manta"}
              {hotel.classification ? ` · ${hotel.classification}` : ""}
            </span>
          </div>

          {/* Título, dirección, mapa y CTA superior */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {hotel.classification && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {hotel.classification}
                  </span>
                )}
                <StarsRow n={hotel.stars} />
                <span className="text-xs text-muted-foreground">{tx(hotel.city)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-muted-foreground">
                <span>📍 {hotel.address}</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowHotelMap(true)}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <IconMap className="w-3.5 h-3.5" />
                  <span>{tx("Excelente ubicación · Ver en el mapa")}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{tx("Desde")}</p>
                <p className="text-xl font-black text-foreground font-mono leading-none">US${hotel.priceFrom}</p>
                <p className="text-[10px] text-muted-foreground">{tx("/ noche base")}</p>
              </div>
              <button
                type="button"
                onClick={() => scrollToSection("hotel-habitaciones")}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-sm cursor-pointer transition-all"
              >
                {tx("Ver habitaciones")} ↓
              </button>
            </div>
          </div>

          {/* Collage de fotos (8 cols) + Tarjeta lateral de Nota y Mapa (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl overflow-hidden border bg-muted h-full" style={{ borderColor: "var(--border)" }}>
                {heroPhotos.map((item, idx) => {
                  const isMain = idx === 0;
                  const isLastTile = idx === heroPhotos.length - 1;
                  const extraCount = galleryItems.length - heroPhotos.length;
                  const tileSpanClass = isMain
                    ? heroPhotos.length === 1
                      ? "col-span-2 sm:col-span-4 row-span-2 min-h-[260px] sm:min-h-[340px]"
                      : "col-span-2 row-span-2 min-h-[240px] sm:min-h-[340px]"
                    : heroPhotos.length === 2
                    ? "col-span-2 sm:row-span-2 min-h-[180px] sm:min-h-[340px]"
                    : heroPhotos.length === 3
                    ? "sm:col-span-2 min-h-[115px] sm:min-h-[167px]"
                    : heroPhotos.length === 4 && idx === 3
                    ? "col-span-2 sm:col-span-2 min-h-[125px] sm:min-h-[167px]"
                    : "min-h-[115px] sm:min-h-[167px]";
                  return (
                    <button
                      key={`${item.url}-${idx}`}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative overflow-hidden group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 ${tileSpanClass}`}
                    >
                      <img
                        src={item.url}
                        alt={item.caption}
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isMain && (
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/65 text-white text-[11px] font-semibold backdrop-blur-xs">
                          📷 {galleryItems.length} {galleryItems.length === 1 ? tx("foto") : tx("fotos")}
                        </span>
                      )}
                      {isLastTile && galleryItems.length > 1 && (
                        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors flex items-center justify-center p-2">
                          <span className="text-white font-bold text-xs sm:text-sm underline underline-offset-2 text-center">
                            {extraCount > 0 ? `+${extraCount} ${tx("fotos más")}` : tx("Ver galería completa")}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna lateral derecha: Calificación rápida + Cita + Mini Mapa */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => scrollToSection("hotel-comentarios")}
                className="w-full text-left rounded-2xl border bg-card p-4 hover:border-amber-400 transition-colors cursor-pointer space-y-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground text-base leading-tight">{scoreLabel}</p>
                    <p className="text-xs text-muted-foreground">{hotel.reviews} {tx("reseñas verificadas")}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0" style={{ background: "#1e3a5f" }}>
                    {score10}
                  </div>
                </div>
                {topQuote && (
                  <div className="pt-2.5 border-t text-xs text-muted-foreground space-y-1" style={{ borderColor: "var(--border)" }}>
                    <p className="italic line-clamp-2 text-foreground/90">“{topQuote.comment}”</p>
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      — {topQuote.author} ({topQuote.origin}) · {tx("Ver comentarios ↓")}
                    </p>
                  </div>
                )}
              </button>

              {/* Mini tarjeta de ubicación y mapa */}
              <div className="flex-1 rounded-2xl border bg-card p-4 flex flex-col justify-between gap-3" style={{ borderColor: "var(--border)" }}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tx("Ubicación en Manta")}</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      {subcriteria[1].val} / 10
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium">
                    🏖️ {detailedDist.playa.name}: <span className="font-mono text-muted-foreground">{detailedDist.playa.label}</span>
                  </p>
                  <p className="text-xs text-foreground font-medium">
                    🛍️ Mall del Pacífico: <span className="font-mono text-muted-foreground">{detailedDist.mall.label}</span>
                  </p>
                  <p className="text-xs text-foreground font-medium">
                    ✈️ Aeropuerto MEC: <span className="font-mono text-muted-foreground">{detailedDist.aeropuerto.label}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHotelMap(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <IconMap className="w-4 h-4" />
                  <span>{tx("Mostrar en el mapa interactivo")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Descripción + Servicios más populares (izq) + Puntos fuertes del alojamiento (der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border bg-card p-5 space-y-4" style={{ borderColor: "var(--border)" }}>
                <div>
                  <h2 className="text-base font-bold text-foreground mb-2">{tx("Sobre este alojamiento")}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{txDesc(hotel.description)}</p>
                </div>

                <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tx("Servicios más populares")}</p>
                    <button
                      type="button"
                      onClick={() => scrollToSection("hotel-servicios")}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {tx("Ver todos")} ({hotel.amenities.length}) ↓
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 8).map(a => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border bg-background text-foreground"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{tx(a)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Puntos fuertes del alojamiento (estilo Booking) */}
            <aside className="lg:col-span-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-foreground">{tx("Puntos fuertes del alojamiento")}</h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">📍</span>
                      <span>
                        <strong className="text-foreground">{tx("Ubicación destacada")}:</strong> {detailedDist.playa.name} · {detailedDist.playa.label}
                      </span>
                    </li>
                    {hasAnyBreakfast && (
                      <li className="flex items-start gap-2">
                        <span className="shrink-0">🍳</span>
                        <span><strong className="text-foreground">{tx("Desayuno disponible")}:</strong> {tx("Habitaciones con desayuno incluido.")}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">✓</span>
                      <span>
                        <strong className="text-foreground">{tx("Cancelación flexible")}:</strong> {tx("Gratis hasta {days} días antes en tarifa flexible.", { days: freeCancelDays })}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">🕒</span>
                      <span>
                        <strong className="text-foreground">Check-in / Check-out:</strong> {checkInHour}h / {checkOutHour}h
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">🛡️</span>
                      <span>
                        <strong className="text-foreground">{tx("Voucher inmediato")}:</strong> {tx("Pago seguro en línea · Factura directa del hotel.")}
                      </span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection("hotel-habitaciones")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-colors"
                >
                  {tx("Elegir habitación")} ↓
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* ── 2. DISPONIBILIDAD Y TIPOS DE HABITACIÓN (PROTAGONISTA) ── */}
        <section id="hotel-habitaciones" className="scroll-mt-32 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Disponibilidad y Tipos de Habitación")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx("Compara planes tarifarios (Flexible vs. No Reembolsable -10%) y cupos web en tiempo real.")}
              </p>
            </div>
            {ivaPct === 8 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                {tx("Feriado turístico activo: IVA 8%")}
              </span>
            )}
          </div>

          {/* Selector editable de fechas y huéspedes en línea (estilo Booking) */}
          <div className="rounded-2xl border-2 border-amber-400/70 bg-card p-3.5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {tx("Entrada")}
                </label>
                <input
                  type="date"
                  min={todayStr()}
                  value={params.checkIn}
                  onChange={e => {
                    const nextIn = e.target.value;
                    if (!nextIn) return;
                    const nextOut = nightsBetween(nextIn, params.checkOut) < 1 ? addDays(nextIn, 1) : params.checkOut;
                    onChangeParams({ ...params, checkIn: nextIn, checkOut: nextOut });
                  }}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs font-semibold outline-none focus:border-amber-500"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {tx("Salida")}
                </label>
                <input
                  type="date"
                  min={addDays(params.checkIn, 1)}
                  value={params.checkOut}
                  onChange={e => {
                    const nextOut = e.target.value;
                    if (!nextOut) return;
                    onChangeParams({ ...params, checkOut: nextOut });
                  }}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs font-semibold outline-none focus:border-amber-500"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {tx("Adultos")}
                </label>
                <select
                  value={params.adults}
                  onChange={e => onChangeParams({ ...params, adults: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs font-semibold outline-none focus:border-amber-500 cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? tx("adulto") : tx("adultos")}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {tx("Niños")}
                </label>
                <select
                  value={params.children}
                  onChange={e => onChangeParams({ ...params, children: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-foreground text-xs font-semibold outline-none focus:border-amber-500 cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? tx("niño") : tx("niños")}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex flex-col justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-center">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                  {nights} {nights === 1 ? tx("noche") : tx("noches")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)}
                </span>
              </div>
            </div>
          </div>

          {showingAllRoomsFallback && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
              {tx("No hay una habitación individual para {n} adultos. Mostramos todas las habitaciones disponibles para que puedas dividir la estancia o ajustar los adultos arriba.", { n: params.adults })}
            </div>
          )}

          {/* Cabecera comparativa de tabla (desktop) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
            <div className="col-span-5">{tx("Tipo de habitación")}</div>
            <div className="col-span-4">{tx("Plan tarifario y condiciones")}</div>
            <div className="col-span-3 text-right">{tx("Precio")} ({nights} {nights === 1 ? tx("noche") : tx("noches")})</div>
          </div>

          {/* Lista comparativa de habitaciones */}
          <div className="space-y-4">
            {roomsToDisplay.map(room => {
              const availableCount = getRoomAvailability(hotel.id, room, params);
              const isUnavailable = Boolean(room.stopSell) || availableCount <= 0;
              const nonRefNightly = Number((room.pricePerNight * 0.90).toFixed(2));
              const flexTotals = computeRoomTotals(room.pricePerNight);
              const nonRefTotals = computeRoomTotals(nonRefNightly);
              const roomGalleryIdx = galleryItems.findIndex(g => g.url === room.image);
              const showBreakdown = expandedBreakdownRoom === room.id;

              return (
                <div
                  key={room.id}
                  className="rounded-2xl overflow-hidden border bg-card hover:shadow-md transition-all"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Columna 1: Identidad de la habitación (5 cols) */}
                    <div className="lg:col-span-5 p-4 sm:p-5 lg:border-r flex flex-col justify-between gap-3" style={{ borderColor: "var(--border)" }}>
                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3.5">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(roomGalleryIdx >= 0 ? roomGalleryIdx : 0)}
                          className="sm:w-36 lg:w-full xl:w-36 h-32 sm:h-28 rounded-xl overflow-hidden shrink-0 relative group cursor-pointer bg-muted"
                        >
                          <img
                            src={room.image}
                            alt={tx(room.type)}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-semibold">
                            🔍 {tx("Ampliar")}
                          </span>
                        </button>

                        <div className="min-w-0 space-y-1.5">
                          <h3 className="font-bold text-foreground text-base leading-snug">{tx(room.type)}</h3>
                          <p className="text-xs text-muted-foreground">
                            🛏️ {tx(room.beds)} · 📐 {room.size} m² · 👤 {tx("Hasta")} {room.capacity} {tx("pers.")}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {room.breakfastIncluded && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                ✓ {tx("Desayuno incluido")}
                              </span>
                            )}
                            {room.amenities.map(a => (
                              <span
                                key={a}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tx(a)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            room.stopSell
                              ? "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30"
                              : availableCount <= 2
                              ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {room.stopSell
                            ? tx("Venta cerrada por el hotel (Stop Sell)")
                            : availableCount <= 2
                            ? tx("Últimas {n} habitaciones disponibles", { n: availableCount })
                            : tx("{n} habitaciones disponibles", { n: availableCount })}
                        </span>

                        <button
                          type="button"
                          onClick={() => setExpandedBreakdownRoom(showBreakdown ? null : room.id)}
                          className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          {showBreakdown ? tx("Ocultar desglose ▲") : tx("Ver desglose fiscal ▼")}
                        </button>
                      </div>
                    </div>

                    {/* Columna 2 y 3: Sub-filas comparativas de Tarifas (7 cols) */}
                    <div className="lg:col-span-7 divide-y divide-border flex flex-col justify-center">
                      {/* Opción 1: Tarifa Flexible */}
                      <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{tx("Tarifa Flexible")}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              {tx("Más elegida")}
                            </span>
                          </div>
                          <ul className="text-[11px] text-muted-foreground space-y-0.5">
                            <li className="text-emerald-700 dark:text-emerald-400 font-medium">
                              ✓ {tx("Cancelación gratuita hasta {days} días antes", { days: freeCancelDays })}
                            </li>
                            <li>
                              ✓ {room.breakfastIncluded ? tx("Desayuno incluido") : tx("Solo alojamiento · Extras opcionales al reservar")}
                            </li>
                            <li>✓ {tx("Voucher inmediato · Check-in")} {checkInHour}h</li>
                          </ul>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <div className="text-left sm:text-right">
                            {room.originalPrice && (
                              <p className="text-[11px] line-through text-muted-foreground font-mono">
                                US${(room.originalPrice * nights).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xl font-black text-foreground font-mono leading-tight">
                              US${flexTotals.subtotal.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              US${room.pricePerNight.toFixed(2)}/n · +US${flexTotals.taxes.toFixed(2)} {tx("impuestos")}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={tx("Reservar habitación: {room}", { room: room.type })}
                            disabled={isUnavailable}
                            onClick={() => onBook(room, "flexible")}
                            className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            {room.stopSell ? tx("No disponible") : availableCount <= 0 ? tx("Agotado") : tx("Reservar Flexible →")}
                          </button>
                        </div>
                      </div>

                      {/* Opción 2: Tarifa No Reembolsable (-10%) */}
                      <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/25">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{tx("No Reembolsable (-10%)")}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300">
                              ⚡ {tx("Ahorro inmediato")}
                            </span>
                          </div>
                          <ul className="text-[11px] text-muted-foreground space-y-0.5">
                            <li>• {tx("10% de descuento directo sobre la tarifa base")}</li>
                            <li>• {tx("Sin devolución en caso de cancelación")}</li>
                          </ul>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] line-through text-muted-foreground font-mono">
                              US${flexTotals.subtotal.toFixed(2)}
                            </p>
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono leading-tight">
                              US${nonRefTotals.subtotal.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              US${nonRefNightly.toFixed(2)}/n · +US${nonRefTotals.taxes.toFixed(2)} {tx("impuestos")}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isUnavailable}
                            onClick={() => onBook(room, "non_refundable")}
                            className="px-4 py-2 rounded-xl font-bold text-xs border border-emerald-600/40 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            {isUnavailable ? tx("No disponible") : tx("Reservar (-10%) →")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desglose legal expandible bajo demanda */}
                  {showBreakdown && (
                    <div className="p-4 border-t bg-background/60" style={{ borderColor: "var(--border)" }}>
                      <PriceBreakdownBox
                        basePrice={room.pricePerNight}
                        nights={nights}
                        hasService10={hasService10}
                        hotelName={hotel.name}
                        defaultExpanded={true}
                        showToggle={false}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. AL FINAL: CALIFICACIONES Y COMENTARIOS DE HUÉSPEDES ── */}
        <section id="hotel-comentarios" className="scroll-mt-32 rounded-2xl border bg-card p-5 sm:p-6 space-y-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Comentarios de los huéspedes")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx("Valoraciones recopiladas de estancias reales gestionadas en AlojaManta.")}
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl self-start sm:self-auto" style={{ background: "#1e3a5f" }}>
              <span className="text-white font-black text-2xl leading-none">{score10}</span>
              <div>
                <p className="text-amber-300 font-bold text-xs">{scoreLabel} (/10)</p>
                <p className="text-white/75 text-[11px]">{hotel.reviews} {tx("reseñas verificadas")}</p>
              </div>
            </div>
          </div>

          {/* Barras por categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 pt-1">
            {subcriteria.map(sc => (
              <div key={sc.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">{sc.label}</span>
                  <span className="font-mono font-bold text-foreground">{sc.val}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${sc.val * 10}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Filtros de reseñas */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold text-muted-foreground mr-1">{tx("Filtrar por viajero:")}</span>
            {([
              { id: "all", label: tx("Todos") },
              { id: "pareja", label: tx("Parejas") },
              { id: "familia", label: tx("Familias") },
              { id: "negocios", label: tx("Negocios") },
            ] as const).map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setReviewFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  reviewFilter === f.id
                    ? "bg-amber-500 text-slate-950 border-amber-500"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tarjetas de comentarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleReviews.map(rev => (
              <article
                key={rev.id}
                className="rounded-xl border bg-background/60 p-4 space-y-2.5 flex flex-col justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {rev.author.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{rev.author}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{rev.origin}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold text-white shrink-0" style={{ background: "#1e3a5f" }}>
                      {rev.score}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-foreground">{rev.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">“{rev.comment}”</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t text-[10px] text-muted-foreground flex-wrap" style={{ borderColor: "var(--border)" }}>
                  <span>🛏️ {tx(rev.roomName)} · {tx(rev.segmentLabel)}</span>
                  <span>{rev.dateLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. AL FINAL: ALREDEDORES DEL ALOJAMIENTO (DISTANCIAS REALES) ── */}
        <section id="hotel-alrededores" className="scroll-mt-32 rounded-2xl border bg-card p-5 sm:p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Alrededores del alojamiento")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx("Distancias aproximadas calculadas desde las coordenadas de {name} en Manta.", { name: hotel.name })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHotelMap(true)}
              className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <IconMap className="w-3.5 h-3.5 text-amber-600" />
              <span>{tx("Ver en el mapa")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border bg-background/60 p-4 space-y-2.5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">🏖️ {tx("Playas y Costa")}</p>
              <div className="divide-y divide-border text-xs">
                {beachSpots.map(spot => (
                  <div key={spot.name} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-foreground font-medium">{spot.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{spot.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-background/60 p-4 space-y-2.5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">🛍️ {tx("Comercio y Ciudad")}</p>
              <div className="divide-y divide-border text-xs">
                {citySpots.map(spot => (
                  <div key={spot.name} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-foreground font-medium">{spot.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{spot.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-background/60 p-4 space-y-2.5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">✈️ {tx("Transporte")}</p>
              <div className="divide-y divide-border text-xs">
                {transportSpots.map(spot => (
                  <div key={spot.name} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-foreground font-medium">{spot.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{spot.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. AL FINAL: TODOS LOS SERVICIOS DEL ALOJAMIENTO ── */}
        <section id="hotel-servicios" className="scroll-mt-32 rounded-2xl border bg-card p-5 sm:p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
              {tx("Servicios de {name}", { name: hotel.name })}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tx("Instalaciones y comodidades incluidas en el alojamiento.")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {hotel.amenities.map(a => (
              <div
                key={a}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border bg-background text-foreground"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  ✓
                </span>
                <span>{tx(a)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-background/60 p-3.5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
            <span>
              <strong className="text-foreground">{tx("Servicios opcionales al reservar:")}</strong>{" "}
              {tx("Traslado Aeropuerto MEC (+$15) · Cama adicional (+$20) · Cuna para bebé ($0) · Late check-out 16h (+$15).")}
            </span>
          </div>
        </section>

        {/* ── 6. AL FINAL: NORMAS DE LA CASA ── */}
        <section id="hotel-normas" className="scroll-mt-32 rounded-2xl border bg-card p-5 sm:p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
              {tx("Normas de la casa")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tx("Condiciones de estancia, horarios y facturación de {name}.", { name: hotel.name })}
            </p>
          </div>

          <div className="rounded-xl border divide-y divide-border overflow-hidden bg-background/50" style={{ borderColor: "var(--border)" }}>
            {[
              {
                icon: "🕒",
                label: tx("Entrada (Check-in)"),
                detail: tx("Desde las {hour}h (hora de Ecuador, UTC-5). Presenta tu Voucher AlojaManta y documento de identidad en recepción.", { hour: checkInHour }),
              },
              {
                icon: "🚪",
                label: tx("Salida (Check-out)"),
                detail: tx("Hasta las {hour}h. Opción de Late check-out (16:00h) disponible como extra al reservar.", { hour: checkOutHour }),
              },
              {
                icon: "🔄",
                label: tx("Cancelación y prepago"),
                detail: tx("Cancelación gratuita hasta {days} días antes de la llegada en Tarifa Flexible. La Tarifa No Reembolsable (-10%) no admite devolución.", { days: freeCancelDays }),
              },
              {
                icon: "👨‍👩‍👧",
                label: tx("Niños y camas adicionales"),
                detail: tx("Se admiten niños de todas las edades. Cuna para bebé sin costo y cama adicional opcional durante la reserva."),
              },
              {
                icon: "💳",
                label: tx("Métodos de pago aceptados"),
                detail: (() => {
                  const cfg = hotel.paymentConfig ?? buildDefaultHotelPaymentConfig(hotel.stars);
                  const list = [
                    cfg.cardEnabled ? `${tx("Tarjeta")} (${cfg.cardProvider || "Datafast"})` : null,
                    cfg.payphoneEnabled ? "PayPhone" : null,
                    cfg.deunaEnabled ? "DeUna" : null,
                    cfg.transferEnabled ? tx("Transferencia Bancaria directa") : null,
                    cfg.receptionEnabled ? tx("Pago en recepción") : null,
                  ].filter(Boolean);
                  return `${list.join(", ")}. ${tx("El 100 % del pago se acredita directamente a {name} (AlojaManta no retiene fondos).", { name: hotel.name })}`;
                })(),
              },
              {
                icon: "🧾",
                label: tx("Comprobante y facturación"),
                detail: tx("AlojaManta emite el Voucher Oficial de Reserva (RES + PIN). La factura o comprobante comercial la emite y entrega directamente {name} a tu llegada.", { name: hotel.name }),
              },
              {
                icon: "🏛️",
                label: tx("Impuestos y tasas locales"),
                detail: hasService10
                  ? tx("Aplica {iva}% IVA vigente, 10% de servicio turístico y Tasa de Pernoctación Municipal GAD Manta (US$ 2.50 / noche).", { iva: ivaPct })
                  : tx("Aplica {iva}% IVA vigente y Tasa de Pernoctación Municipal GAD Manta (US$ 2.50 / noche). Exento de 10% de servicio turístico.", { iva: ivaPct }),
              },
            ].map(rule => (
              <div key={rule.label} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 p-3.5 text-xs">
                <div className="sm:col-span-4 font-bold text-foreground flex items-center gap-2">
                  <span aria-hidden="true">{rule.icon}</span>
                  <span>{rule.label}</span>
                </div>
                <div className="sm:col-span-8 text-muted-foreground leading-relaxed">{rule.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. AL FINAL: PREGUNTAS FRECUENTES ── */}
        <section id="hotel-faq" className="scroll-mt-32 rounded-2xl border bg-card p-5 sm:p-6 space-y-3" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
            {tx("Preguntas frecuentes sobre {name}", { name: hotel.name })}
          </h2>

          <div className="divide-y divide-border rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.q} className="bg-background/40">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground">{faq.q}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Visor de galería en pantalla completa */}
      {lightboxIndex !== null && (
        <HotelGalleryLightbox
          items={galleryItems}
          activeIndex={lightboxIndex}
          hotelName={hotel.name}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}

      {/* Mapa interactivo de Manta centrado en este hotel */}
      <MantaMapModal
        isOpen={showHotelMap}
        onClose={() => setShowHotelMap(false)}
        onSelectDestination={() => setShowHotelMap(false)}
        hotels={getPublicHotels()}
        initialHotelId={hotel.id}
        onSelectHotel={h => {
          setShowHotelMap(false);
          onSelectHotel(h);
        }}
      />
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsView({ params, onChange, onSearch, onSelect }: { params: SearchParams; onChange: (p: SearchParams) => void; onSearch: () => void; onSelect: (h: Hotel) => void }) {
  const tx = useI18n();
  const [stars, setStars] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [classification, setClassification] = useState<string>("all");
  const [parish, setParish] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "rating">("rating");
  const [showResultsMap, setShowResultsMap] = useState(false);
  const nights = nightsBetween(params.checkIn, params.checkOut);
  let results = getPublicHotels().filter(h => {
    const d = !params.destination || matchSmartDestination(h, params.destination);
    const s = stars.length === 0 || stars.includes(h.stars);
    const p = h.priceFrom <= maxPrice;
    const c = h.rooms.some(r => r.capacity >= params.adults);
    const cl = classification === "all" || (h.classification && h.classification.toLowerCase() === classification.toLowerCase());
    const pa = parish === "all" || (h.parish && h.parish.toLowerCase() === parish.toLowerCase());
    return d && s && p && c && cl && pa;
  });
  if (sortBy === "price") results = [...results].sort((a, b) => a.priceFrom - b.priceFrom);
  if (sortBy === "rating") results = [...results].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <div className="sticky top-[57px] z-20 border-b shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <SearchBar params={params} onChange={onChange} onSearch={onSearch} variant="sticky" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-5">
        <aside className="w-56 flex-shrink-0 hidden lg:block space-y-4 sticky top-36 self-start">
          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground text-sm">{tx("Categoría")}</h4>
              {stars.length > 0 && (
                <button onClick={() => setStars([])} className="text-[11px] text-amber-600 hover:underline">{tx("Limpiar")}</button>
              )}
            </div>
            {[5, 4, 3, 2, 1].map(s => (
              <label key={s} className="flex items-center justify-between gap-1 mb-2 cursor-pointer hover:bg-background p-1 rounded transition-colors">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="accent-amber-400"
                    checked={stars.includes(s)}
                    onChange={() => setStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: s }).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 11 }}>★</span>)}
                    {Array.from({ length: 5 - s }).map((_, i) => <span key={i} style={{ color: "#d1d5db", fontSize: 11 }}>★</span>)}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {s === 5 ? tx("5★ Lujo") : s === 4 ? tx("4★ Primera") : s === 3 ? tx("3★ Superior") : s === 2 ? tx("2★ Turista") : tx("1★ Económico")}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">({getPublicHotels().filter(h => h.stars === s).length})</span>
              </label>
            ))}
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-bold text-foreground text-sm mb-2">{tx("Clasificación")}</h4>
            <div className="space-y-1">
              {[
                { id: "all", label: tx("Todos los tipos"), count: getPublicHotels().length },
                { id: "Hotel", label: "Hotel", count: getPublicHotels().filter(h => h.classification === "Hotel").length },
                { id: "Hostal", label: "Hostal", count: getPublicHotels().filter(h => h.classification === "Hostal").length },
                { id: "Hostería", label: "Hostería", count: getPublicHotels().filter(h => h.classification === "Hostería").length },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setClassification(item.id)}
                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg text-left transition-all ${
                    classification === item.id ? "bg-amber-100 text-amber-900 font-bold" : "text-muted-foreground hover:bg-background"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">({item.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-bold text-foreground text-sm mb-2">{tx("Parroquia")}</h4>
            <select
              value={parish}
              onChange={e => setParish(e.target.value)}
              className="w-full text-xs rounded-lg border p-2 bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">{tx("Todas las parroquias")} ({getPublicHotels().length})</option>
              {Array.from(new Set(getPublicHotels().map(h => h.parish).filter(Boolean))).sort().map(p => (
                <option key={p} value={p}>{p} ({getPublicHotels().filter(h => h.parish === p).length})</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-foreground text-sm">{tx("Precio máx./noche")}</h4>
              <span className="font-bold text-amber-600 text-sm font-mono">${maxPrice}</span>
            </div>
            <input
              type="range"
              min={25}
              max={300}
              step={5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>$25</span>
              <span>$150</span>
              <span>$300+</span>
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-foreground">{results.length} {results.length !== 1 ? tx("alojamientos") : tx("alojamiento")}{params.destination ? ` ${tx("en")} ${params.destination}` : ""}</h2>
              {nights > 0 && <p className="text-xs text-muted-foreground">{nights} {nights > 1 ? tx("noches") : tx("noche")} · {params.adults} {params.adults > 1 ? tx("adultos") : tx("adulto")}</p>}
            </div>
            <div className="flex gap-1.5 text-xs items-center">
              <button onClick={() => setShowResultsMap(true)} className="px-3 py-1.5 rounded-lg font-medium border bg-card hover:bg-muted text-foreground transition-colors flex items-center gap-1.5 cursor-pointer" style={{ borderColor: "var(--border)" }}>
                <IconMap className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{tx("Ver en el mapa")}</span>
              </button>
              <span className="text-muted-foreground self-center">{tx("Ordenar:")}</span>
              {[{ k: "rating" as const, l: tx("Valoración") }, { k: "price" as const, l: tx("Precio") }].map(s => (
                <button key={s.k} onClick={() => setSortBy(s.k)} className="px-3 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer" style={{ background: sortBy === s.k ? "#f59e0b" : "var(--card)", color: sortBy === s.k ? "#0c1220" : "var(--muted-foreground)", borderColor: sortBy === s.k ? "#f59e0b" : "var(--border)" }}>{s.l}</button>
              ))}
            </div>
          </div>
          <MantaMapModal
            isOpen={showResultsMap}
            onClose={() => setShowResultsMap(false)}
            onSelectDestination={dest => {
              setShowResultsMap(false);
              onChange({ ...params, destination: dest });
            }}
            hotels={results}
          />
          <div className="space-y-4">
            {results.map(h => <HotelCard key={h.id} hotel={h} nights={nights} onSelect={() => onSelect(h)} />)}
            {results.length === 0 && (
              <div className="text-center py-16 rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold text-foreground">{tx("No encontramos alojamientos con estos filtros.")}</p>
                <p className="text-xs text-muted-foreground mt-1">{tx("Prueba limpiando la zona o subiendo el precio máximo.")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomePage({
  params,
  onChange,
  onSearch,
  onSelectHotel,
  theme: _theme,
  onToggleTheme: _onToggleTheme,
  onOpenConsult,
  onOpenAbout,
  onOpenLegal,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  onSelectHotel: (h: Hotel) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenConsult?: () => void;
  onOpenAbout?: () => void;
  onOpenLegal?: () => void;
}) {
  const tx = useI18n();
  const [isHomeMapOpen, setIsHomeMapOpen] = useState(false);
  const publicHotels = getPublicHotels();
  const isBusinessFilter = params.destination.toLowerCase() === "aeropuerto";

  return (
    <div style={{ background: "var(--background)" }}>
      {/* Hero limpio y sobrio centrado en Manta */}
      <div className="relative overflow-visible" style={{ minHeight: 400 }}>
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=800&fit=crop"
            alt="Costa de Manta, Ecuador"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/55 to-slate-950/80" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-12 sm:pt-16 pb-10 sm:pb-14">
          <div className="max-w-2xl mb-6 sm:mb-8">
            <p className="text-xs font-medium tracking-wide text-white/80 mb-2">
              {tx("Manta, Manabí · Reserva directa sin intermediarios")}
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-[1.1] tracking-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              {tx("Alojamientos en Manta")}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {tx("Hoteles, hostales y hosterías en toda la ciudad. Reserva directo con el hotel, al mismo precio de recepción.")}
            </p>
          </div>

          <SearchBar params={params} onChange={onChange} onSearch={onSearch} />

          {/* Fila sobria debajo del buscador: Viajo por trabajo + accesos rápidos */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/90">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBusinessFilter}
                onChange={e => onChange({ ...params, destination: e.target.checked ? "Aeropuerto" : "" })}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <span>{tx("Viajo por trabajo")}</span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Frente al mar", query: "Playa" },
                { label: "Aeropuerto", query: "Aeropuerto" },
                { label: "Terminal", query: "Terminal" },
                { label: "Económicos", query: "Tarqui" },
                { label: "Con piscina", query: "Piscina" },
              ].map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => { onChange({ ...params, destination: chip.query }); onSearch(); }}
                  className="px-3 py-1 rounded-full bg-white/12 hover:bg-white/22 text-white border border-white/20 font-medium transition-colors cursor-pointer"
                >
                  {tx(chip.label)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zonas de Manta + único botón de mapa */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
              {tx("Explora por zona")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {tx("Elige el sector que mejor se acomode a tu viaje")} · {publicHotels.length} {tx("alojamientos")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsHomeMapOpen(true)}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <IconMap className="w-4 h-4 text-muted-foreground" />
            <span>{tx("Ver en el mapa")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              title: "Barbasquillo y El Murciélago",
              meta: "Desde $35/noche",
              desc: "Frente al mar, malecón y restaurantes a pocos pasos.",
              img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
              query: "Playa",
            },
            {
              title: "Zona del Aeropuerto",
              meta: "Desde $18/noche",
              desc: "A menos de 5 minutos de la terminal aérea. Ideal para viajes de trabajo.",
              img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop",
              query: "Aeropuerto",
            },
            {
              title: "Tarqui y Terminal",
              meta: "Desde $16/noche",
              desc: "Opciones prácticas y accesibles para estadías cortas o de paso.",
              img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
              query: "Terminal",
            },
            {
              title: "Santa Marianita y San Mateo",
              meta: "Desde $28/noche",
              desc: "Playas abiertas, ambiente tranquilo, surf y kitesurf.",
              img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop",
              query: "Santa Marianita",
            },
          ].map(c => (
            <button
              key={c.title}
              type="button"
              onClick={() => { onChange({ ...params, destination: c.query }); onSearch(); }}
              className="rounded-xl overflow-hidden text-left bg-card border border-border group hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="h-40 w-full overflow-hidden bg-muted">
                <img src={c.img} alt={tx(c.title)} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-foreground leading-snug">{tx(c.title)}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tx(c.desc)}</p>
                </div>
                <p className="text-xs font-medium text-foreground">{tx(c.meta)}</p>
              </div>
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-5" style={{ fontFamily: "DM Serif Display, serif" }}>
          {tx("Alojamientos recomendados")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {publicHotels.filter(h => h.rating >= 4.4).slice(0, 6).map(h => (
            <button key={h.id} onClick={() => onSelectHotel(h)} className="rounded-xl overflow-hidden border bg-card text-left hover:shadow-md group transition-all cursor-pointer" style={{ borderColor: "var(--border)" }}>
              <div style={{ height: 168 }} className="overflow-hidden bg-muted">
                <img
                  src={h.image}
                  alt={h.name}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOTEL_IMAGE; }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <StarsRow n={h.stars} />
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-white">{h.rating}</span>
                </div>
                <p className="font-semibold text-foreground text-sm">{h.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{h.city}</p>
                <div className="flex items-baseline gap-1 mt-2.5">
                  <span className="font-semibold text-foreground text-sm">{tx("desde")} {fmt(h.priceFrom)}</span>
                  <span className="text-xs text-muted-foreground">{tx("/ noche")}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            [tx("Tarifa directa"), tx("Reservas directo con el establecimiento, sin recargos de intermediarios.")],
            [tx("Hoteles registrados en Manta"), tx("Opciones verificadas en las 7 parroquias del cantón.")],
            [tx("Seguimiento claro"), tx("Consulta el estado de tu solicitud con tu código de reserva en cualquier momento.")]
          ].map(([title, desc]) => (
            <div key={title} className="py-4 pr-3">
              <h4 className="font-semibold text-foreground mb-1 text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="portal-footer border-t mt-8">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap gap-8 justify-between">
          <div className="max-w-xs space-y-2">
            <p className="font-bold footer-title text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>AlojaManta</p>
            <p className="text-xs footer-muted leading-relaxed">{tx("Reservas directas en hoteles, hostales y hosterías de Manta, Manabí.")}</p>
          </div>
          <div className="flex flex-wrap gap-10 text-xs footer-muted">
            <div className="space-y-2">
              <p className="font-semibold footer-title mb-2 uppercase tracking-wider text-[11px]">{tx("Sectores y Playas")}</p>
              <button type="button" onClick={() => { onChange({ ...params, destination: "Manta - Barbasquillo" }); onSearch(); }} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                Barbasquillo & El Murciélago
              </button>
              <button type="button" onClick={() => { onChange({ ...params, destination: "Manta - Tarqui" }); onSearch(); }} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                Tarqui & Los Esteros
              </button>
              <button type="button" onClick={() => { onChange({ ...params, destination: "Manta - Santa Marianita" }); onSearch(); }} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                Santa Marianita & San Mateo
              </button>
              <button type="button" onClick={() => { onChange({ ...params, destination: "Manta - San Lorenzo" }); onSearch(); }} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                San Lorenzo & Reserva Pacoche
              </button>
            </div>
            <div className="space-y-2">
              <p className="font-semibold footer-title mb-2 uppercase tracking-wider text-[11px]">{tx("Ayuda & Información")}</p>
              {onOpenAbout && (
                <button type="button" onClick={onOpenAbout} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                  {tx("Acerca de AlojaManta")}
                </button>
              )}
              {onOpenConsult && (
                <button type="button" onClick={onOpenConsult} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                  {tx("Consultar mi reserva")}
                </button>
              )}
              {onOpenLegal && (
                <button type="button" onClick={onOpenLegal} className="hover:text-amber-400 footer-muted transition-colors text-left block cursor-pointer">
                  {tx("Términos y privacidad")}
                </button>
              )}
              <a href="https://wa.me/593998765432?text=Hola%2C%20requiero%20asistencia%20en%20AlojaManta" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 footer-muted transition-colors text-left flex items-center gap-1 cursor-pointer">
                <span>WhatsApp: +593 99 876 5432</span>
              </a>
              <a href="tel:+59352628900" className="hover:text-amber-400 footer-muted transition-colors text-left flex items-center gap-1 cursor-pointer">
                <span>Tel: +593 5 262 8900</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t py-4 px-4 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] footer-muted" style={{ borderColor: "var(--footer-border)" }}>
          <span>© 2026 AlojaManta · Manta, Manabí</span>
          <div className="flex items-center gap-4">
            {onOpenAbout && (
              <button type="button" onClick={onOpenAbout} className="footer-muted hover:text-amber-400 transition-colors cursor-pointer">
                {tx("Acerca de AlojaManta")}
              </button>
            )}
            {onOpenLegal && (
              <button type="button" onClick={onOpenLegal} className="footer-muted hover:text-amber-400 transition-colors cursor-pointer">
                {tx("Términos y privacidad")}
              </button>
            )}
          </div>
        </div>
      </footer>

      <MantaMapModal
        isOpen={isHomeMapOpen}
        onClose={() => setIsHomeMapOpen(false)}
        onSelectDestination={dest => {
          onChange({ ...params, destination: dest });
          onSearch();
        }}
        hotels={publicHotels}
      />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function GuestPage({
  user,
  onGuestLogin,
  onLogout,
  onAdminAccess,
  adminSessionActive = false,
  theme = "light",
  onToggleTheme,
}: {
  user: GuestUser | null;
  onGuestLogin: (u: GuestUser) => void;
  onLogout: () => void;
  onAdminAccess?: () => void;
  adminSessionActive?: boolean;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}) {
  const tx = useI18n();
  const lang = useLang();
  useRoomCatalogRevision();
  const [view, setView] = useState<GuestView>("home");
  const [params, setParams] = useState<SearchParams>({
    destination: "",
    checkIn: addDays(todayStr(), 1),
    checkOut: addDays(todayStr(), 3),
    adults: 2,
    children: 0,
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomOffer | null>(null);
  const [bookingRatePlan, setBookingRatePlan] = useState<"flexible" | "non_refundable">("flexible");

  // Modales
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [voucherRes, setVoucherRes] = useState<MyReservation | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState<"hub" | "reservations" | "personal" | "billing" | "payments" | "about">("hub");

  // Reservas persistentes y configuración de IVA feriado
  const { reservations, syncError } = useReservationSnapshot();
  const [reservationError, setReservationError] = useState("");
  const [ivaHolidayActive, setIvaHolidayActive] = useState(() => getIvaDecretoConfig().enabledGlobal);

  useEffect(() => {
    const sync = () => setIvaHolidayActive(getIvaDecretoConfig().enabledGlobal);
    window.addEventListener("alojamanta-iva-change", sync);
    return () => window.removeEventListener("alojamanta-iva-change", sync);
  }, []);

  function handleCancelReservation(resId: string) {
    setReservationError("");
    try {
      reservationWorkflow.cancel(resId);
    } catch (error) {
      setReservationError(error instanceof Error ? error.message : "No se pudo cancelar la solicitud.");
    }
  }

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  function handleSearch() {
    setView("results");
    setSelectedHotel(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function handleSelectHotel(h: Hotel) {
    setSelectedHotel(h);
    setView("hotel");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleLogoClick() {
    setView("home");
    setSelectedHotel(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      onAdminAccess?.();
      return;
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 2000);
  }

  return (
    <div className="min-h-screen overflow-x-clip w-full max-w-full" style={{ background: "var(--background)" }}>
      {syncError && <p role="alert" className="bg-card text-destructive p-3 text-sm">{tx(syncError)}</p>}
      {reservationError && <p role="alert" className="fixed bottom-4 left-4 right-4 z-[60] rounded-xl bg-red-100 p-4 text-sm text-red-800">{tx(reservationError)}</p>}
      {/* Nav limpio estilo editorial */}
      <header className="sticky top-0 z-30 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="font-bold text-lg sm:text-xl tracking-tight" style={{ fontFamily: "DM Serif Display, serif", color: "var(--foreground)" }}>
              AlojaManta
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {ivaHolidayActive && (
              <span className="hidden md:inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {tx("Feriado: IVA 8%")}
              </span>
            )}
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={tx("Cambiar idioma")}
              aria-label={tx("Cambiar idioma")}
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title={theme === "dark" ? tx("Modo claro") : tx("Modo oscuro")}
                aria-label={tx("Cambiar tema")}
              >
                {theme === "dark" ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              </button>
            )}
            <GuestMessengerBarAndDock user={user} reservations={reservations} />
            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-border hover:border-foreground/30 bg-card hover:bg-muted/60 transition-colors cursor-pointer"
                  title={tx("Menú de perfil y cuenta")}
                >
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[110px]">
                      {user.name.split(" ")[0]}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">▾</span>
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-xl border bg-card shadow-xl z-50 overflow-hidden divide-y divide-border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="px-4 py-3 bg-muted/40">
                        <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1 text-xs text-foreground">
                        <button
                          onClick={() => { setAccountInitialTab("hub"); setView("account"); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-foreground">{tx("Mi cuenta")}</p>
                        </button>

                        <button
                          onClick={() => { setAccountInitialTab("reservations"); setView("account"); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-foreground">{tx("Mis Reservas y Viajes")}</p>
                        </button>

                        <button
                          onClick={() => { setAccountInitialTab("personal"); setView("account"); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-foreground">{tx("Datos personales")}</p>
                        </button>

                        <button
                          onClick={() => { setAccountInitialTab("billing"); setView("account"); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-foreground">{tx("Datos para comprobantes")}</p>
                        </button>

                        <button
                          onClick={() => { setAccountInitialTab("payments"); setView("account"); setShowProfileMenu(false); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/60 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-foreground">{tx("Pagos de mis reservas")}</p>
                        </button>
                      </div>

                      {onAdminAccess && adminSessionActive && (
                        <button
                          type="button"
                          onClick={() => { setShowProfileMenu(false); onAdminAccess(); }}
                          className="w-full px-4 py-2.5 text-left text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-muted/60 cursor-pointer block"
                        >
                          {tx("Volver al panel hotelero")}
                        </button>
                      )}
                      <div className="p-1.5">
                        <button
                          onClick={() => { setShowProfileMenu(false); setView("home"); onLogout(); }}
                          className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          {tx("Cerrar sesión")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                {onAdminAccess && adminSessionActive && (
                  <button
                    type="button"
                    onClick={onAdminAccess}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0"
                  >
                    {tx("Volver al panel hotelero")}
                  </button>
                )}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-1.5 rounded-lg transition-colors cursor-pointer text-slate-950 bg-amber-500 hover:bg-amber-600 shrink-0"
                >
                  {tx("Iniciar sesión")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {view === "home" && (
        <HomePage
          params={params}
          onChange={setParams}
          onSearch={handleSearch}
          onSelectHotel={handleSelectHotel}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenConsult={() => setShowConsultModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenLegal={() => setShowLegalModal(true)}
        />
      )}
      {view === "results" && <ResultsView params={params} onChange={setParams} onSearch={handleSearch} onSelect={handleSelectHotel} />}
      {view === "hotel" && selectedHotel && (
        <HotelDetail
          hotel={getPublicHotels().find(hotel => hotel.id === selectedHotel.id) ?? selectedHotel}
          params={params}
          onChangeParams={setParams}
          onSelectHotel={handleSelectHotel}
          onBack={() => setView("results")}
          onBook={(r, plan) => {
            setBookingRatePlan(plan ?? "flexible");
            setBookingRoom(r);
          }}
        />
      )}
      {view === "account" && user && (
        <AccountView
          key={user.email}
          user={user}
          reservations={reservations}
          onLogout={() => { setView("home"); onLogout(); }}
          onCancelReservation={handleCancelReservation}
          onViewVoucher={setVoucherRes}
          onBack={() => setView("home")}
          initialTab={accountInitialTab}
        />
      )}

      {/* Modal de Reserva y Pago */}
      {bookingRoom && selectedHotel && (
        <BookingModal
          hotel={getPublicHotels().find(hotel => hotel.id === selectedHotel.id) ?? selectedHotel}
          room={bookingRoom}
          params={params}
          user={user}
          initialRatePlan={bookingRatePlan}
          onClose={() => setBookingRoom(null)}
          onGuestLogin={onGuestLogin}
        />
      )}

      {/* Modal de Inicio de Sesión */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onGuestLogin={u => {
            onGuestLogin(u);
            setShowLoginModal(false);
          }}
          onAdminAccess={() => {
            setShowLoginModal(false);
            onAdminAccess?.();
          }}
          onOpenConsult={() => setShowConsultModal(true)}
        />
      )}

      {/* Modal de Consulta de Reservas */}
      {showConsultModal && (
        <ConsultReservationModal
          reservations={reservations}
          onClose={() => setShowConsultModal(false)}
          onViewVoucher={res => {
            setVoucherRes(res);
          }}
          onCancelReservation={handleCancelReservation}
        />
      )}

      {/* Modal de Voucher / Comprobante de Cobro */}
      {voucherRes && (
        <InvoiceModal res={reservations.find(reservation => reservation.id === voucherRes.id) ?? voucherRes} onClose={() => setVoucherRes(null)} />
      )}

      {/* Modal Acerca de AlojaManta */}
      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
          onExplore={() => {
            setShowAboutModal(false);
            handleSearch();
          }}
        />
      )}

      {/* Modal Legal & Comprobantes y Contacto */}
      {showLegalModal && (
        <LegalModal onClose={() => setShowLegalModal(false)} />
      )}
    </div>
  );
}
