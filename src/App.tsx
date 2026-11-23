import { Dashboard, ReservationsView, RoomsView, RevenueView, GuestsView, BillingView, PaymentsView } from "./features/reservations/OperationsViews";
import { PanelMessagesView } from "./features/messaging/MessagingComponents";
import {
  useMessagingThreads,
  countUnreadForHotel,
  countUnreadForSuperadmin,
  OPEN_PANEL_CHAT_EVENT,
} from "./features/messaging/messagingStore";
import { buildDefaultHotelPaymentConfig, getRoomOffers, HOTELS_STORAGE_KEY, notifyCatalogChanged, useRoomCatalogRevision } from "./app/roomCatalog";
import { hotelMetrics } from "./features/reservations/operations";
import { tx, useLang, setLang } from "./i18n";
import { useState, useMemo, useEffect } from "react";
import GuestPage from "./GuestPage";
import AuthPage, { type AdminRole, type AdminUser, type GuestUser } from "./AuthPage";
import { useGuestReservations } from "./app/useGuestReservations";
import {
  MANTA_HOTELS,
  type HotelPaymentConfig,
} from "./mantaHotels";
import {
  DEFAULT_HOTEL_RATES,
  fmtUsd,
  getIvaDecretoConfig,
  setIvaDecretoConfig,
  getAuditLogs,
  addAuditLog,
  getErrorLogs,
  resolveErrorLog,
  type HotelRatesConfig,
  type RoomRateInfo,
  type AuditLogEntry,
  type ErrorLogEntry,
} from "./hotelData";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "hotels" | "users" | "dashboard" | "reservations" | "rooms" | "revenue" | "guests" | "messages" | "billing" | "payments" | "rates";

// ─── Helpers ──────────────────────────────────────────────────────────────────


// Conmutador Rápido de Tarifa de IVA 15% / 8% (Feriados)
function IvaEmergencySwitchBanner({ userName = "Administrador" }: { userName?: string }) {
  const [ivaCfg, setIvaCfgState] = useState(() => getIvaDecretoConfig());

  useEffect(() => {
    const sync = () => setIvaCfgState(getIvaDecretoConfig());
    window.addEventListener("alojamanta-iva-change", sync);
    return () => window.removeEventListener("alojamanta-iva-change", sync);
  }, []);

  function toggleIva(enable8: boolean) {
    const updated = {
      ...ivaCfg,
      enabledGlobal: enable8,
      updatedBy: `${userName} (${new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })})`,
    };
    setIvaDecretoConfig(updated);
    setIvaCfgState(updated);
    addAuditLog({
      usuario: userName,
      rol: "Administración",
      modulo: "Motor Tributario",
      accion: enable8 ? "ACTIVAR_IVA_8_FERIADO" : "RESTAURAR_IVA_15_ORDINARIO",
      detalle: enable8
        ? `Activada tarifa reducida de IVA 8% (${updated.decretoNombre})`
        : "Restaurada tarifa ordinaria de IVA 15%",
    });
  }

  return (
    <div
      className="rounded-xl border p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
      style={{
        background: ivaCfg.enabledGlobal ? "rgba(16, 185, 129, 0.08)" : "var(--card)",
        borderColor: ivaCfg.enabledGlobal ? "rgba(16, 185, 129, 0.4)" : "var(--border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
              {tx("IVA")}
            </span>
            <span
              className={`mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                ivaCfg.enabledGlobal
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {ivaCfg.enabledGlobal ? tx("8% por feriado") : tx("15% normal")}
            </span>
          </div>
          <p className="mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {ivaCfg.enabledGlobal
              ? tx("Ahora se cobra 8% ({decreto}). Vuelve a 15% cuando termine el feriado.", { decreto: ivaCfg.decretoNombre })
              : tx("Se cobra 15%, más el 10% de servicio en los hoteles que lo aplican.")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => toggleIva(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            !ivaCfg.enabledGlobal
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
              : "bg-transparent text-slate-400 border-slate-700 hover:text-white"
          }`}
        >
          {tx("15% normal")}
        </button>
        <button
          type="button"
          onClick={() => toggleIva(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            ivaCfg.enabledGlobal
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
              : "bg-transparent text-slate-400 border-slate-700 hover:text-white"
          }`}
        >
          {tx("8% feriado")}
        </button>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-md p-4 border"
      style={{
        background: "var(--card)",
        borderColor: accent ? "var(--primary)" : "var(--border)",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-1"
        style={{ color: "var(--muted-foreground)" }}
      >
        {tx(label)}
      </p>
      <p
        className="mono text-2xl font-semibold leading-none"
        style={{ color: accent ? "var(--primary)" : "var(--foreground)" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          {tx(sub)}
        </p>
      )}
    </div>
  );
}

// ─── Revenue mini bar chart ───────────────────────────────────────────────────

function RatesView({ hotelId, hotel }: { hotelId: string; hotel: PlatformHotel }) {
  const [ratesConfig, setRatesConfig] = usePersistentState<HotelRatesConfig>(
    `hoteldirekt.${hotelId}.rates`,
    DEFAULT_HOTEL_RATES[hotelId] || DEFAULT_HOTEL_RATES["costa-sol"]
  );

  const [editingRoom, setEditingRoom] = useState<RoomRateInfo | null>(null);
  const [showNewTariffModal, setShowNewTariffModal] = useState(false);
  const [newRoomType, setNewRoomType] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState(100);
  const [newRoomIcon, setNewRoomIcon] = useState("🛏️");

  const { seasons, roomTypes, channels } = ratesConfig;

  function handleSaveRoomPrice(newPrice: number) {
    if (!editingRoom) return;
    setRatesConfig(current => ({
      ...current,
      roomTypes: current.roomTypes.map(r => r.type === editingRoom.type ? { ...r, basePrice: newPrice } : r),
    }));
    setEditingRoom(null);
  }

  function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoomType) return;
    setRatesConfig(current => ({
      ...current,
      roomTypes: [
        ...current.roomTypes,
        { type: newRoomType, basePrice: newRoomPrice, icon: newRoomIcon || "🛏️" },
      ],
    }));
    setNewRoomType("");
    setShowNewTariffModal(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl" style={{ color: "var(--foreground)" }}>{tx("Tarifas & Precios")}</h1>
            <span className="mono text-xs px-2.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {hotel.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{hotel.city} · {hotel.rooms} camas disponibles · Precios en USD ($)</p>
        </div>
        <button
          onClick={() => setShowNewTariffModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity bg-amber-500 text-slate-950 shadow self-start sm:self-auto cursor-pointer"
        >
          {tx("+ Nueva tarifa especial")}
        </button>
      </div>

      {/* Cambio de IVA 15% / 8% en feriados */}
      <IvaEmergencySwitchBanner userName="Revenue Manager" />

      {/* Season multipliers */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{tx("Temporadas")}</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {seasons.map(s => (
            <div key={s.name} className="rounded-md border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{s.name}</p>
                <span className="mono text-xs px-2 py-0.5 rounded font-bold" style={{ background: s.color, color: "#e8edf5" }}>×{s.multiplier}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.months}</p>
              <div className="mt-3 space-y-1">
                {roomTypes.slice(0, 3).map(r => (
                  <div key={r.type} className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>{r.type}</span>
                    <span className="mono font-medium" style={{ color: "var(--foreground)" }}>{fmtUsd(r.basePrice * s.multiplier)}/noche</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate matrix */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{tx("Matriz de tarifas por temporada")}</p>
        <div className="rounded-md border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{tx("Tipo de habitación")}</th>
                <th className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{tx("Precio base")}</th>
                {seasons.map(s => <th key={s.name} className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{s.name}</th>)}
                <th className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{tx("Acciones")}</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((r, i) => (
                <tr key={r.type} className="hover:bg-[#1a2540] transition-colors" style={{ borderBottom: i < roomTypes.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "var(--foreground)" }}>{r.icon} {r.type}</p>
                  </td>
                  <td className="px-4 py-3 mono font-semibold" style={{ color: "var(--primary)" }}>{fmtUsd(r.basePrice)}</td>
                  {seasons.map(s => (
                    <td key={s.name} className="px-4 py-3">
                      <div className="mono text-sm font-medium" style={{ color: s.multiplier > 1 ? "#fcd34d" : s.multiplier < 1 ? "#93c5fd" : "#6ee7b7" }}>
                        {fmtUsd(r.basePrice * s.multiplier)}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingRoom(r)}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      {tx("Editar")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channel commissions */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{tx("Comisiones por canal")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {channels.map(ch => (
            <div key={ch.name} className="rounded-md border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{ch.name}</p>
              <div className="flex items-end gap-1">
                <p className="mono text-2xl font-bold leading-none" style={{ color: ch.commission === 0 ? ch.color : "#e8edf5" }}>{ch.commission}%</p>
                <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{tx("comisión")}</p>
              </div>
              {ch.commission === 0 ? (
                <p className="text-xs mt-1.5 font-semibold" style={{ color: ch.color }}>{tx("✓ Sin comisión")}</p>
              ) : (
                <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  {tx("Sobre precio neto. Por $100 → cobras ${n}", { n: 100 - ch.commission })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Room Base Price Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
              Editar Precio Base · {editingRoom.type}
            </h3>
            <p className="text-xs text-amber-500 font-medium">{hotel.name}</p>
            <div>
              <label className="block text-xs mb-1 text-slate-400">{tx("Nuevo Precio Base (USD / noche)")}</label>
              <input
                type="number"
                min="10"
                step="1"
                defaultValue={editingRoom.basePrice}
                id="editPriceInput"
                className="w-full rounded border px-3 py-2 text-sm font-mono font-bold outline-none"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingRoom(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">{tx("Cancelar")}</button>
              <button
                onClick={() => {
                  const input = document.getElementById("editPriceInput") as HTMLInputElement;
                  if (input) handleSaveRoomPrice(Number(input.value));
                }}
                className="px-4 py-1.5 rounded font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {tx("Guardar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Tariff Modal */}
      {showNewTariffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(4px)" }}>
          <form onSubmit={handleAddRoom} className="w-full max-w-sm rounded-xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{tx("Nueva Tarifa por Tipo de Habitación")}</h3>
            <p className="text-xs text-amber-500 font-medium">{hotel.name}</p>
            <div>
              <label className="block text-xs mb-1 text-slate-400">{tx("Nombre de la Habitación / Tarifa *")}</label>
              <input
                type="text"
                required
                value={newRoomType}
                onChange={e => setNewRoomType(e.target.value)}
                placeholder={tx("Ej: Habitación Matrimonial Frente al Mar")}
                className="w-full rounded border px-3 py-2 text-xs outline-none"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1 text-slate-400">{tx("Icono")}</label>
                <select
                  value={newRoomIcon}
                  onChange={e => setNewRoomIcon(e.target.value)}
                  className="w-full rounded border px-2 py-2 text-xs outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  <option value="🛏️">{tx("🛏️ Estándar")}</option>
                  <option value="⭐🛏️">⭐ Superior</option>
                  <option value="👑🛏️">👑 Suite</option>
                  <option value="🏖️👑">🏖️ Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-400">{tx("Precio Base (USD) *")}</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={newRoomPrice}
                  onChange={e => setNewRoomPrice(Number(e.target.value))}
                  className="w-full rounded border px-3 py-2 text-xs font-mono font-bold outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewTariffModal(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">{tx("Cancelar")}</button>
              <button type="submit" className="px-4 py-1.5 rounded font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950">{tx("Agregar Tarifa")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const ALL_ROLES: AdminRole[] = ["superadmin", "admin", "manager", "receptionist"];

function NavIcon({ view }: { view: View }) {
  const common = "w-4 h-4 stroke-current";
  switch (view) {
    case "hotels":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
        </svg>
      );
    case "users":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "dashboard":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "rooms":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
        </svg>
      );
    case "reservations":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
        </svg>
      );
    case "guests":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "messages":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
      );
    case "billing":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case "payments":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case "rates":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "revenue":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

const NAV_ITEMS: { view: View; label: string; divider?: boolean; roles: AdminRole[] }[] = [
  { view: "hotels", label: "Hoteles", roles: ["superadmin"] },
  { view: "users", label: "Usuarios y accesos", roles: ["superadmin", "admin", "auditor"], divider: true },
  { view: "dashboard", label: "Panel general", roles: ["superadmin", "admin", "manager", "auditor"], divider: true },
  { view: "rooms", label: "Tipos de habitación", roles: ALL_ROLES },
  { view: "reservations", label: "Bandeja de reservas", roles: ALL_ROLES },
  { view: "guests", label: "Directorio de huéspedes", roles: ["superadmin", "admin", "receptionist"] },
  { view: "messages", label: "Mensajes y soporte", roles: ["superadmin", "admin", "manager", "receptionist", "auditor"] },
  { view: "billing", label: "Comprobantes y vouchers", roles: ["superadmin", "admin", "receptionist", "auditor"], divider: true },
  { view: "payments", label: "Pasarela y cobros", roles: ["superadmin", "admin", "receptionist", "auditor"] },
  { view: "rates", label: "Tarifas por temporada", roles: ["superadmin", "admin", "manager"] },
  { view: "revenue", label: "Métricas e ingresos", roles: ["superadmin", "admin", "manager", "auditor"] },
];

// ─── Platform hotels data ─────────────────────────────────────────────────────

interface PlatformHotel {
  id: string;
  name: string;
  city: string;
  parroquia?: string;
  parish?: string;
  sector?: string;
  lat?: number;
  lng?: number;
  stars: 1 | 2 | 3 | 4 | 5;
  classification?: string;
  category?: string;
  rooms: number; // Capacidad de camas / plazas
  occupancy: number;
  monthRevenue: number;
  rating: number;
  status: "active" | "paused" | "pending";
  gravaServicio10?: boolean;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  razonSocial?: string;
  direccionFiscalEmpresa?: string;
  emailFacturacionEmpresa?: string;
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
  creadoPor?: string;
  actualizadoPor?: string;
  description?: string;
  amenities?: string[];
  gallery?: string[];
}

interface StaffUser {
  id: string;
  name: string;
  identificacion?: string;
  email: string;
  phone: string;
  role: AdminRole;
  hotelIds: string[];
  status: "active" | "invited" | "blocked";
  lastAccess: string;
}

const DEFAULT_HOTELS: PlatformHotel[] = MANTA_HOTELS.map((h, idx) => ({
  id: h.id,
  name: h.name,
  city: h.city,
  parroquia: h.parroquia ?? "MANTA",
  parish: h.parish ?? "Manta",
  sector: h.sector ?? (h.city.split(" - ")[1] || "Manta"),
  lat: h.lat,
  lng: h.lng,
  stars: h.stars,
  classification: h.classification,
  category: h.category,
  rooms: h.rooms.reduce((sum, room) => sum + room.available, 0),
  occupancy: 0,
  monthRevenue: 0,
  rating: h.rating,
  status: idx === 13 ? "paused" : "active",
  gravaServicio10: h.gravaServicio10,
  address: h.address,
  phone: h.phone,
  email: h.email,
  taxId: h.taxId,
  razonSocial: h.razonSocial ?? h.owner,
  direccionFiscalEmpresa: h.address,
  emailFacturacionEmpresa: h.email,
  codigoSucursal: h.codigoSucursal ?? (h.regNumber?.split(".")[1] || "001"),
  owner: h.owner,
  regNumber: h.regNumber,
  licenciaLuaf: h.licenciaLuaf ?? `LUAF-MNT-2026-${String(idx + 1).padStart(3, "0")}`,
  claveCatastral: h.claveCatastral,
  horaCheckIn: h.horaCheckIn ?? "15:00",
  horaCheckOut: h.horaCheckOut ?? "12:00",
  diasCancelacionGratuita: h.diasCancelacionGratuita ?? 2,
  modeloCobroPlataforma: h.modeloCobroPlataforma ?? "CONVENIO_SIN_COBRO",
  codigoConvenio: h.codigoConvenio ?? "CONV-MANTA-2026",
  fechaInicioConvenio: h.fechaInicioConvenio ?? "2026-01-01",
  fechaFinConvenio: h.fechaFinConvenio ?? "2026-12-31",
  porcentajeComisionConvenio: h.porcentajeComisionConvenio ?? 0,
  porcentajeComisionPostConvenio: h.porcentajeComisionPostConvenio ?? 8,
  tarifaMensualPorHabitacion: h.tarifaMensualPorHabitacion ?? 2.5,
  modeloCobroHuesped: h.modeloCobroHuesped ?? "PAGO_DIRECTO_HOTEL",
  paymentConfig: h.paymentConfig ?? buildDefaultHotelPaymentConfig(h.stars),
  bancoAcreditacion: h.bancoAcreditacion ?? "Banco Pichincha",
  tipoCuentaBancaria: h.tipoCuentaBancaria ?? "CORRIENTE",
  numeroCuentaBancaria: h.numeroCuentaBancaria ?? "",
  titularCuentaBancaria: h.titularCuentaBancaria ?? (h.razonSocial || h.owner || h.name),
  creadoPor: "Listado inicial",
  description: h.description,
  amenities: h.amenities,
  gallery: [h.image],
}));

const DEFAULT_STAFF: StaffUser[] = [
  { id: "usr-001", name: "Carlos Admin", identificacion: "1309876543", email: "admin@alojamanta.ec", phone: "+593 99 100 1001", role: "superadmin", hotelIds: [], status: "active", lastAccess: "Hoy, 09:42" },
  { id: "usr-002", name: "Ana Administradora", identificacion: "1310445566", email: "direccion@voyagermanta.ec", phone: "+593 98 203 1212", role: "admin", hotelIds: ["hotel-voyager-manta", "hostal-el-naufrago", "hostal-el-naufrago-2"], status: "active", lastAccess: "Hoy, 08:15" },
  { id: "usr-003", name: "María Revenue", identificacion: "1308112233", email: "revenue@voyagermanta.ec", phone: "+593 99 322 4403", role: "manager", hotelIds: ["hotel-voyager-manta", "hostal-el-naufrago"], status: "active", lastAccess: "Ayer, 19:20" },
  { id: "usr-004", name: "Juan Recepción", identificacion: "1311998877", email: "recepcion@voyagermanta.ec", phone: "+593 98 100 2004", role: "receptionist", hotelIds: ["hotel-voyager-manta", "hostal-el-naufrago"], status: "active", lastAccess: "Hoy, 07:03" },
  { id: "usr-005", name: "Lucía Gómez", identificacion: "1314223344", email: "recepcion@elnaufrago.ec", phone: "+593 99 211 5005", role: "receptionist", hotelIds: ["hostal-el-naufrago", "hostal-el-naufrago-2"], status: "invited", lastAccess: "Pendiente" },
  { id: "usr-006", name: "Laura Auditora", identificacion: "1312456789", email: "auditoria@voyagermanta.ec", phone: "+593 99 455 7890", role: "auditor", hotelIds: ["hotel-voyager-manta", "hostal-el-naufrago", "hostal-el-naufrago-2"], status: "active", lastAccess: "Hoy, 10:05" },
];

const ROLE_INFO: Record<AdminRole, { label: string; color: string; bg: string }> = {
  superadmin: { label: "Superadministrador (Cantonal)", color: "#d97706", bg: "rgba(245, 158, 11, 0.15)" },
  admin: { label: "Administrador de Hotel", color: "#7c3aed", bg: "rgba(124, 58, 237, 0.15)" },
  manager: { label: "Revenue Manager", color: "#2563eb", bg: "rgba(37, 99, 235, 0.15)" },
  receptionist: { label: "Operador Reservas / Recepción", color: "#059669", bg: "rgba(16, 185, 129, 0.15)" },
  auditor: { label: "Auditor / Contador", color: "#0284c7", bg: "rgba(2, 132, 199, 0.15)" },
};

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      // Limpieza proactiva de datos obsoletos del prototipo inicial (ciudades de España / menos de 50 hoteles)
      if (key.includes("hotels")) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && (parsed.length < 50 || parsed.some((h: any) => h.city === "Benidorm" || h.city === "Madrid" || h.city === "Granada" || h.city === "Málaga"))) {
            localStorage.removeItem(key);
            localStorage.removeItem("hoteldirekt.hotels");
            return initialValue;
          }
          return parsed as T;
        }
        localStorage.removeItem("hoteldirekt.hotels");
        return initialValue;
      }
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

// ─── Hotels overview view ─────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx(label)}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded border px-3 py-2.5 text-sm outline-none"
        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
      />
    </div>
  );
}

function HotelsView({ hotels, onSelect, onSave, onDelete, canDelete, onResetCatalog }: {
  hotels: PlatformHotel[];
  onSelect: (id: string) => void;
  onSave: (hotel: PlatformHotel) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  onResetCatalog?: () => void;
}) {
  const [editing, setEditing] = useState<PlatformHotel | null>(null);
  const [hotelTab, setHotelTab] = useState<"empresa" | "ubicacion" | "politicas" | "financiero">("empresa");
  const [hotelFormError, setHotelFormError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);

  const totalRevenue = hotels.reduce((s, h) => s + h.monthRevenue, 0);
  const activeHotels = hotels.filter(h => h.status === "active");
  const avgOccupancy = activeHotels.length ? Math.round(activeHotels.reduce((s, h) => s + h.occupancy, 0) / activeHotels.length) : 0;
  const activeCount = activeHotels.length;

  const starLabel = (s: number) => `${s} Estrella${s > 1 ? "s" : ""}`;
  const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "rgba(16, 185, 129, 0.15)", color: "#059669", label: "Activo" },
    paused: { bg: "rgba(245, 158, 11, 0.15)", color: "#d97706", label: "Pausado" },
    pending: { bg: "rgba(59, 130, 246, 0.15)", color: "#2563eb", label: "Pendiente" },
  };

  const filteredHotels = useMemo(() => {
    return hotels.filter(h => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        h.name.toLowerCase().includes(q) ||
        (h.city && h.city.toLowerCase().includes(q)) ||
        (h.parish && h.parish.toLowerCase().includes(q)) ||
        (h.address && h.address.toLowerCase().includes(q)) ||
        (h.taxId && h.taxId.includes(q)) ||
        (h.razonSocial && h.razonSocial.toLowerCase().includes(q)) ||
        (h.codigoSucursal && h.codigoSucursal.toLowerCase().includes(q)) ||
        (h.regNumber && h.regNumber.toLowerCase().includes(q)) ||
        (h.owner && h.owner.toLowerCase().includes(q));

      const matchCat = categoryFilter === "all" ||
        (h.category && h.category.toLowerCase().includes(categoryFilter.toLowerCase())) ||
        String(h.stars) === categoryFilter;

      const matchClass = classificationFilter === "all" ||
        (h.classification && h.classification.toLowerCase() === classificationFilter.toLowerCase());

      const matchSector = sectorFilter === "all" ||
        (h.city && h.city.toLowerCase().includes(sectorFilter.toLowerCase())) ||
        (h.parish && h.parish.toLowerCase().includes(sectorFilter.toLowerCase())) ||
        (h.sector && h.sector.toLowerCase().includes(sectorFilter.toLowerCase()));

      return matchSearch && matchCat && matchClass && matchSector;
    });
  }, [hotels, search, categoryFilter, classificationFilter, sectorFilter]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredHotels.length / pageSize);
  const paginatedHotels = pageSize === 0
    ? filteredHotels
    : filteredHotels.slice((page - 1) * pageSize, page * pageSize);

  const sectors = ["Barbasquillo", "El Murciélago", "Tarqui", "Los Esteros", "San Mateo", "Eloy Alfaro", "Santa Marianita", "San Lorenzo", "Manta"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{tx("Hoteles de Manta")}</h1>
            <span className="mono text-xs px-2.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {hotels.length} {tx("hoteles")}
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {activeCount} {tx("publicados en la web · el resto está pausado o por revisar")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onResetCatalog && (
            <button
              onClick={() => {
                if (confirm(tx("¿Volver a cargar los 116 hoteles del listado original? Se perderán los cambios hechos aquí."))) {
                  onResetCatalog();
                }
              }}
              title={tx("Vuelve a cargar el listado original de 116 hoteles")}
              className="px-3 py-2 rounded text-xs font-semibold border flex items-center gap-1.5 transition-colors hover:bg-amber-500/10 cursor-pointer"
              style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "#f59e0b" }}
            >
              {tx("Restaurar listado original")}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setHotelTab("empresa");
                setHotelFormError("");
                setEditing({
                  id: "",
                  name: "",
                  city: "Manta - Barbasquillo",
                  parroquia: "MANTA",
                  parish: "Manta",
                  sector: "Barbasquillo",
                  lat: -0.9537,
                  lng: -80.7286,
                  classification: "HOTEL",
                  stars: 3,
                  category: "3 Estrellas",
                  rooms: 0,
                  occupancy: 0,
                  monthRevenue: 0,
                  rating: 4.5,
                  status: "active",
                  gravaServicio10: true,
                  address: "",
                  phone: "",
                  email: "",
                  taxId: "",
                  razonSocial: "",
                  codigoSucursal: "001",
                  owner: "",
                  regNumber: "",
                  licenciaLuaf: "",
                  claveCatastral: "",
                  horaCheckIn: "15:00",
                  horaCheckOut: "12:00",
                  diasCancelacionGratuita: 2,
                  modeloCobroPlataforma: "CONVENIO_SIN_COBRO",
                  codigoConvenio: "CONV-MANTA-2026",
                  fechaInicioConvenio: "2026-01-01",
                  fechaFinConvenio: "2026-12-31",
                  porcentajeComisionConvenio: 0,
                  porcentajeComisionPostConvenio: 8,
                  tarifaMensualPorHabitacion: 2.5,
                  modeloCobroHuesped: "PAGO_DIRECTO_HOTEL",
                  paymentConfig: buildDefaultHotelPaymentConfig(3),
                  bancoAcreditacion: "Banco Pichincha",
                  tipoCuentaBancaria: "CORRIENTE",
                  numeroCuentaBancaria: "",
                  titularCuentaBancaria: "",
                  description: "",
                  amenities: ["WiFi gratis", "Aire acondicionado"],
                  gallery: [],
                });
              }}
              className="px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <span>+</span> {tx("Añadir Hotel")}
            </button>
          )}
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Alojamientos registrados" value={String(activeCount)} sub={`${hotels.length} ${tx("en total")}`} />
        <KpiCard label="Cobros registrados del mes" value={fmtUsd(totalRevenue)} sub="registrados en este equipo" accent />
        <KpiCard label={tx("Promedio de cupos apartados hoy")} value={`${avgOccupancy}%`} sub="reservas y solicitudes activas" />
        <KpiCard label={tx("Cupos configurados")} value={String(hotels.reduce((s, h) => s + h.rooms, 0))} sub="se ajusta en cada hotel" />
      </div>

      {/* Cambio de IVA 15% / 8% en feriados */}
      <IvaEmergencySwitchBanner userName="Superadministrador Cantonal" />

      {/* Filter bar */}
      <div className="p-4 rounded-xl border space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={tx("Buscar por nombre de hotel, sector, dirección, propietario o RUC...")}
              className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Classification */}
            <select
              value={classificationFilter}
              onChange={e => { setClassificationFilter(e.target.value); setPage(1); }}
              className="rounded-lg border px-2.5 py-2 text-xs outline-none cursor-pointer"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">{tx("Todas las Modalidades")}</option>
              <option value="Hotel">Hoteles</option>
              <option value="Hostal">{tx("Hostales")}</option>
              <option value="Hostería">{tx("Hosterías")}</option>
            </select>

            {/* Stars / Category */}
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-lg border px-2.5 py-2 text-xs outline-none cursor-pointer"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">{tx("Todas las Categorías")}</option>
              <option value="5">{tx("5 Estrellas (Lujo)")}</option>
              <option value="4">{tx("4 Estrellas (Primera)")}</option>
              <option value="3">{tx("3 Estrellas (Superior)")}</option>
              <option value="2">{tx("2 Estrellas (Turista)")}</option>
              <option value="1">{tx("1 Estrella (Económico)")}</option>
            </select>

            {/* Sector */}
            <select
              value={sectorFilter}
              onChange={e => { setSectorFilter(e.target.value); setPage(1); }}
              className="rounded-lg border px-2.5 py-2 text-xs outline-none cursor-pointer"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="all">{tx("Todos los Sectores")}</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border px-2.5 py-2 text-xs outline-none cursor-pointer"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value={25}>{tx("25 por pág.")}</option>
              <option value={50}>{tx("50 por pág.")}</option>
              <option value={0}>{tx("Ver todos (116)")}</option>
            </select>
          </div>
        </div>

        {/* Filters summary & clear */}
        <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <span style={{ color: "var(--muted-foreground)" }}>
            {tx("Mostrando")} <strong>{paginatedHotels.length}</strong> {tx("de")} <strong>{filteredHotels.length}</strong> {tx("establecimientos encontrados")} ({tx("Total cantón")}: {hotels.length})
          </span>
          {(search || categoryFilter !== "all" || classificationFilter !== "all" || sectorFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setCategoryFilter("all"); setClassificationFilter("all"); setSectorFilter("all"); setPage(1); }}
              className="text-amber-400 hover:underline font-medium cursor-pointer"
            >
              {tx("Limpiar filtros")}
            </button>
          )}
        </div>
      </div>

      {/* Hotels table */}
      <div className="rounded-md border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Alojamiento", "Sector / Parroquia", "Modalidad / Cat.", "10% Servicio", "Cupos", "Apartados hoy", "Cobros del mes", "Rating", "Estado", ""].map(h => (
                  <th key={h} className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--muted-foreground)" }}>{tx(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedHotels.map((h, i) => {
                const ss = statusStyle[h.status];
                const hasServ10 = h.gravaServicio10 ?? true;
                return (
                  <tr key={h.id} className="transition-colors hover:bg-[var(--secondary)]" style={{ borderBottom: i < paginatedHotels.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {h.gallery?.[0] ? (
                          <img src={h.gallery[0]} alt="" className="w-12 h-10 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate" style={{ color: "var(--foreground)" }}>{h.name}</p>
                          </div>
                          <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>
                            {h.taxId ? `RUC: ${h.taxId}` : ""} {h.razonSocial ? `· ${h.razonSocial}` : h.address ? `· ${h.address}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <p className="font-medium text-slate-200">{h.city}</p>
                      <span className="text-[10px] text-amber-400">
                        {h.modeloCobroPlataforma === "MENSUAL_POR_HABITACION"
                          ? `${tx("Mensual")} $${(h.tarifaMensualPorHabitacion ?? 2.5).toFixed(2)}/${tx("hab")}`
                          : h.modeloCobroPlataforma === "COMISION_POR_RESERVA"
                            ? `${tx("Comisión")} ${h.porcentajeComisionPostConvenio ?? 8}%`
                            : h.modeloCobroPlataforma === "HIBRIDO"
                              ? `${tx("Híbrido")} (${h.porcentajeComisionPostConvenio ?? 5}% + $${(h.tarifaMensualPorHabitacion ?? 2.5).toFixed(2)})`
                              : `${tx("Convenio")} ${h.porcentajeComisionConvenio ?? 0}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: h.stars }).map((_, idx) => <span key={idx} style={{ color: "#f59e0b", fontSize: 10 }}>★</span>)}
                      </div>
                      <span className="text-[10px] block" style={{ color: "var(--muted-foreground)" }}>
                        {h.classification || "Hotel"} · {starLabel(h.stars)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = { ...h, gravaServicio10: !hasServ10 };
                          onSave(updated);
                        }}
                        title={tx("Clic para activar/desactivar 10% servicio (Art. 41 Ley de Turismo Ecuador)")}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                          hasServ10
                            ? "bg-emerald-950/70 text-emerald-300 border-emerald-700 hover:bg-emerald-900"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${hasServ10 ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {tx(hasServ10 ? "+10% Activo" : "Sin Servicio")}
                      </button>
                    </td>
                    <td className="px-4 py-3 mono text-center" style={{ color: "var(--muted-foreground)" }}>{h.rooms}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                          <div className="h-full rounded-full" style={{ width: `${h.occupancy}%`, background: h.occupancy >= 75 ? "#6ee7b7" : h.occupancy >= 50 ? "#f59e0b" : "#f87171" }} />
                        </div>
                        <span className="mono text-xs" style={{ color: "var(--foreground)" }}>{h.occupancy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 mono font-semibold" style={{ color: "var(--primary)" }}>
                      {fmtUsd(h.monthRevenue)}
                    </td>
                    <td className="px-4 py-3 mono text-sm font-semibold" style={{ color: "#f59e0b" }}>{h.rating}</td>
                    <td className="px-4 py-3">
                      <span className="mono text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide" style={{ background: ss.bg, color: ss.color }}>{tx(ss.label)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onSelect(h.id)} className="text-xs px-2 py-1.5 rounded font-medium transition-colors cursor-pointer" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{tx("Gestionar")}</button>
                        <button onClick={() => { setHotelTab("empresa"); setHotelFormError(""); setEditing({ ...h }); }} className="text-xs px-2 py-1.5 rounded border cursor-pointer hover:border-amber-400" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{tx("Editar")}</button>
                        {canDelete && <button onClick={() => { if (confirm(tx("¿Eliminar {name}?", { name: h.name }))) onDelete(h.id); }} className="text-xs px-2 py-1.5 rounded border cursor-pointer" style={{ borderColor: "#7f1d1d", color: "#fca5a5" }}>{tx("Eliminar")}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pageSize > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>
              {tx("Página")} <strong>{page}</strong> {tx("de")} <strong>{totalPages}</strong>
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border disabled:opacity-30 cursor-pointer font-medium"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 rounded border text-xs font-semibold cursor-pointer"
                    style={{
                      background: page === pageNum ? "var(--primary)" : "transparent",
                      color: page === pageNum ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      borderColor: page === pageNum ? "transparent" : "var(--border)",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="self-center px-1 text-slate-500">...</span>}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border disabled:opacity-30 cursor-pointer font-medium"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {tx("Siguiente →")}
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(3, 7, 18, .78)" }}>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!editing.name.trim()) {
                setHotelFormError(tx("Falta el nombre del hotel."));
                setHotelTab("empresa");
                return;
              }
              const slug = editing.id || `${editing.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString().slice(-4)}`;
              onSave({
                ...editing,
                id: slug,
                parroquia: (editing.parish || "Manta").toUpperCase(),
                sector: editing.sector || editing.city.split(" - ")[1] || editing.parish || "Manta",
              });
              setEditing(null);
            }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--primary)" }}>{tx("Ficha del hotel")}</p>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{editing.id ? tx("Editar propiedad") : tx("Nueva propiedad")}</h2>
                {editing.creadoPor && (
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {tx("Registrado por")}: <strong>{editing.creadoPor}</strong>{editing.actualizadoPor ? ` · Última edición: ${editing.actualizadoPor}` : ""}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setEditing(null)} className="text-xl cursor-pointer" style={{ color: "var(--muted-foreground)" }}>×</button>
            </div>

            {/* 4 Tabs del formulario de hotel */}
            <div className="flex flex-wrap gap-1.5 pb-3 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
              {([
                ["empresa", "Datos del hotel"],
                ["ubicacion", "Ubicación"],
                ["politicas", "Horarios y políticas"],
                ["financiero", "Convenio y pagos"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setHotelTab(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
                  style={{
                    background: hotelTab === key ? "var(--primary)" : "var(--muted)",
                    color: hotelTab === key ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    borderColor: hotelTab === key ? "transparent" : "var(--border)",
                  }}
                >
                  {tx(label)}
                </button>
              ))}
            </div>

            {hotelFormError && (
              <div className="mb-4 px-3 py-2 rounded-lg border text-xs bg-red-500/10 border-red-500/30 text-red-400">
                {hotelFormError}
              </div>
            )}

            {hotelTab === "empresa" && (() => {
              const cleanRuc = (editing.taxId ?? "").trim();
              const matchingByRuc = cleanRuc.length >= 10
                ? hotels.filter(h => (h.taxId ?? "").trim() === cleanRuc)
                : [];
              const existingCompany = matchingByRuc[0];
              const uniqueCompanies = Array.from(
                new Map(
                  hotels
                    .filter(h => (h.taxId ?? "").trim())
                    .map(h => [(h.taxId ?? "").trim(), h])
                ).values()
              );

              return (
                <div className="space-y-4">
                  {/* Bloque 1: Empresa Propietaria y Datos Fiscales para Facturación (Tabla empresa_propietaria) */}
                  <div className="rounded-xl border p-3.5 space-y-3" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                          {tx("Datos de la Empresa Propietaria (Facturación por RUC)")}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                          {tx("Un mismo RUC y Razón Social puede tener varios hoteles. Si el RUC ya existe se autocompletan sus datos fiscales; si no existe, se crea la empresa al guardar.")}
                        </p>
                      </div>
                      {cleanRuc && (
                        <span
                          className={`mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            existingCompany
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {existingCompany
                            ? `${tx("RUC existente")} · ${matchingByRuc.length} ${matchingByRuc.length === 1 ? tx("hotel") : tx("hoteles")}`
                            : tx("Nuevo RUC · Se creará la empresa")}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("RUC (13 dígitos)")}</label>
                        <input
                          list="existing-rucs-list"
                          value={editing.taxId ?? ""}
                          placeholder="Ej: 0200508570001"
                          onChange={e => {
                            const nextRuc = e.target.value;
                            const match = hotels.find(h => (h.taxId ?? "").trim() === nextRuc.trim());
                            if (match) {
                              setEditing({
                                ...editing,
                                taxId: nextRuc,
                                razonSocial: match.razonSocial ?? match.owner ?? editing.razonSocial,
                                owner: match.owner ?? match.razonSocial ?? editing.owner,
                                direccionFiscalEmpresa: match.direccionFiscalEmpresa ?? match.address ?? editing.direccionFiscalEmpresa,
                                emailFacturacionEmpresa: match.emailFacturacionEmpresa ?? match.email ?? editing.emailFacturacionEmpresa,
                                titularCuentaBancaria: match.razonSocial ?? match.owner ?? editing.titularCuentaBancaria,
                              });
                            } else {
                              setEditing({ ...editing, taxId: nextRuc });
                            }
                          }}
                          className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-amber-400"
                          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        />
                        <datalist id="existing-rucs-list">
                          {uniqueCompanies.map(c => (
                            <option key={c.taxId} value={c.taxId}>
                              {c.razonSocial || c.owner} ({c.name})
                            </option>
                          ))}
                        </datalist>
                      </div>

                      <Field
                        label="Razón social (Facturación)"
                        value={editing.razonSocial ?? editing.owner ?? ""}
                        onChange={razonSocial => setEditing({ ...editing, razonSocial, owner: razonSocial })}
                      />
                      <Field
                        label="Representante legal"
                        value={editing.owner ?? ""}
                        onChange={owner => setEditing({ ...editing, owner })}
                      />
                      <Field
                        label="Correo para envío de facturas"
                        type="email"
                        value={editing.emailFacturacionEmpresa ?? editing.email ?? ""}
                        onChange={emailFacturacionEmpresa => setEditing({ ...editing, emailFacturacionEmpresa })}
                      />
                      <div className="sm:col-span-2">
                        <Field
                          label="Dirección fiscal / matriz (Facturación)"
                          value={editing.direccionFiscalEmpresa ?? editing.address ?? ""}
                          onChange={direccionFiscalEmpresa => setEditing({ ...editing, direccionFiscalEmpresa })}
                        />
                      </div>
                    </div>

                    {existingCompany && (
                      <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        {tx("Establecimientos vinculados a este RUC:")}{" "}
                        <span className="font-bold">{matchingByRuc.map(h => h.name).join(" · ")}</span>
                      </p>
                    )}
                  </div>

                  {/* Bloque 2: Datos propios del Establecimiento (Tabla hotel) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nombre comercial" value={editing.name} onChange={name => { setHotelFormError(""); setEditing({ ...editing, name }); }} required />
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Tipo de alojamiento")}</label>
                      <select value={editing.classification ?? "HOTEL"} onChange={e => setEditing({ ...editing, classification: e.target.value })} className="w-full rounded border px-3 py-2.5 text-sm outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                        <option value="HOTEL">Hotel</option>
                        <option value="HOSTAL">Hostal</option>
                        <option value="HOSTERÍA">Hostería</option>
                        <option value="PENSIÓN">Pensión / Casa de Huéspedes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Estrellas")}</label>
                      <select
                        value={editing.stars}
                        onChange={e => {
                          const stars = Math.min(5, Math.max(1, Number(e.target.value))) as 1 | 2 | 3 | 4 | 5;
                          setEditing({ ...editing, stars, category: `${stars} Estrella${stars > 1 ? "s" : ""}` });
                        }}
                        className="w-full rounded border px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Estrella{s > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>
                    <Field label="Registro de turismo" value={editing.regNumber ?? ""} onChange={regNumber => setEditing({ ...editing, regNumber })} />
                    <Field label="Licencia de funcionamiento (LUAF)" value={editing.licenciaLuaf ?? ""} onChange={licenciaLuaf => setEditing({ ...editing, licenciaLuaf })} />
                    <Field label="Clave Catastral" value={editing.claveCatastral ?? ""} onChange={claveCatastral => setEditing({ ...editing, claveCatastral })} />
                    <Field label="Teléfono" value={editing.phone ?? ""} onChange={phone => setEditing({ ...editing, phone })} />
                    <Field label="Correo" type="email" value={editing.email ?? ""} onChange={email => setEditing({ ...editing, email })} />
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("¿Se muestra en la web?")}</label>
                      <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as PlatformHotel["status"] })} className="w-full rounded border px-3 py-2.5 text-sm outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                        <option value="active">{tx("Sí, publicado")}</option>
                        <option value="paused">{tx("No, pausado")}</option>
                        <option value="pending">{tx("Falta revisar")}</option>
                      </select>
                    </div>
                    <Field label={tx("Habitaciones (aprox.)")} type="number" value={String(editing.rooms)} onChange={rooms => setEditing({ ...editing, rooms: Math.max(0, Number(rooms)) })} />
                  </div>
                </div>
              );
            })()}

            {hotelTab === "ubicacion" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Parroquia")}</label>
                  <select
                    value={editing.parish ?? "Manta"}
                    onChange={e => setEditing({ ...editing, parish: e.target.value, parroquia: e.target.value.toUpperCase() })}
                    className="w-full rounded border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    {["Manta", "Tarqui", "Los Esteros", "San Mateo", "Eloy Alfaro", "Santa Marianita", "San Lorenzo"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <Field label="Sector o barrio" value={editing.sector ?? ""} onChange={sector => setEditing({ ...editing, sector })} />
                <Field label="Cómo se muestra en la web" value={editing.city} onChange={city => setEditing({ ...editing, city })} required />
                <Field label="Dirección" value={editing.address ?? ""} onChange={address => setEditing({ ...editing, address })} />
                <Field label="Latitud" type="number" value={String(editing.lat ?? -0.9537)} onChange={lat => setEditing({ ...editing, lat: Number(lat) })} />
                <Field label="Longitud" type="number" value={String(editing.lng ?? -80.7286)} onChange={lng => setEditing({ ...editing, lng: Number(lng) })} />
                <div className="sm:col-span-2">
                  <Field label="Descripción corta" value={editing.description ?? ""} onChange={description => setEditing({ ...editing, description })} />
                </div>
                <Field label={tx("Servicios (separados por coma)")} value={(editing.amenities ?? []).join(", ")} onChange={value => setEditing({ ...editing, amenities: value.split(",").map(item => item.trim()).filter(Boolean) })} />
                <Field label={tx("Fotos (enlaces separados por coma)")} value={(editing.gallery ?? []).join(", ")} onChange={value => setEditing({ ...editing, gallery: value.split(",").map(item => item.trim()).filter(Boolean) })} />
              </div>
            )}

            {hotelTab === "politicas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Hora de entrada" value={editing.horaCheckIn ?? "15:00"} onChange={horaCheckIn => setEditing({ ...editing, horaCheckIn })} />
                <Field label="Hora de salida" value={editing.horaCheckOut ?? "12:00"} onChange={horaCheckOut => setEditing({ ...editing, horaCheckOut })} />
                <Field label="Días para cancelar sin costo" type="number" value={String(editing.diasCancelacionGratuita ?? 2)} onChange={d => setEditing({ ...editing, diasCancelacionGratuita: Math.max(0, Number(d)) })} />
                <div className="flex items-center px-3 py-2 rounded-lg border text-xs" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <span>{tx("Horas en hora de Ecuador")}</span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <input
                    id="hotel-grava-servicio"
                    type="checkbox"
                    checked={editing.gravaServicio10 ?? true}
                    onChange={e => setEditing({ ...editing, gravaServicio10: e.target.checked })}
                    className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="hotel-grava-servicio" className="text-xs cursor-pointer select-none" style={{ color: "var(--foreground)" }}>
                    <strong className="text-amber-500">{tx("Cobra 10% de servicio")}</strong>
                    <span className="block text-[11px]" style={{ color: "var(--muted-foreground)" }}>{tx("Márcalo si el hotel suma el 10% de servicio a la cuenta. Muchos hostales no lo cobran.")}</span>
                  </label>
                </div>
                <div className="sm:col-span-2 rounded-lg border p-3 text-xs leading-relaxed" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <strong style={{ color: "var(--foreground)" }}>{tx("Sobre las facturas")}:</strong>{" "}
                  {tx("Nosotros solo entregamos el voucher de la reserva. La factura la hace el hotel, como siempre, con su propio sistema.")}
                </div>
              </div>
            )}

            {hotelTab === "financiero" && (() => {
              const pcfg: HotelPaymentConfig = editing.paymentConfig ?? buildDefaultHotelPaymentConfig(editing.stars);
              const patchPay = (patch: Partial<HotelPaymentConfig>) =>
                setEditing({ ...editing, paymentConfig: { ...pcfg, ...patch } });
              return (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                    <strong className="text-emerald-700 dark:text-emerald-300">{tx("Pago directo al hotel (sin retención ni tarjeta virtual):")}</strong>{" "}
                    <span style={{ color: "var(--muted-foreground)" }}>
                      {tx("El 100 % del pago del huésped ingresa directamente a las pasarelas o cuentas bancarias que este hotel active abajo. AlojaManta no retiene fondos de terceros.")}
                    </span>
                  </div>

                  {/* Métodos de pago propios configurables por hotel */}
                  <div className="rounded-lg border p-3.5 space-y-3" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                      {tx("Métodos de pago activos de este hotel (visibles en el checkout)")}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <input
                          type="checkbox"
                          checked={pcfg.cardEnabled}
                          onChange={e => patchPay({ cardEnabled: e.target.checked })}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>
                          <strong className="block" style={{ color: "var(--foreground)" }}>{tx("Tarjeta de Crédito / Débito (Pasarela propia)")}</strong>
                          <span style={{ color: "var(--muted-foreground)" }}>{tx("Datafast / Kushki / PlacetoPay del comercio del hotel")}</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <input
                          type="checkbox"
                          checked={pcfg.payphoneEnabled}
                          onChange={e => patchPay({ payphoneEnabled: e.target.checked })}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>
                          <strong className="block" style={{ color: "var(--foreground)" }}>PayPhone Comercio</strong>
                          <span style={{ color: "var(--muted-foreground)" }}>{tx("Acreditación directa a la cuenta PayPhone del hotel")}</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <input
                          type="checkbox"
                          checked={pcfg.deunaEnabled}
                          onChange={e => patchPay({ deunaEnabled: e.target.checked })}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>
                          <strong className="block" style={{ color: "var(--foreground)" }}>DeUna (Banco Pichincha)</strong>
                          <span style={{ color: "var(--muted-foreground)" }}>{tx("Transferencia inmediata a la cuenta DeUna del hotel")}</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <input
                          type="checkbox"
                          checked={pcfg.transferEnabled}
                          onChange={e => patchPay({ transferEnabled: e.target.checked })}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>
                          <strong className="block" style={{ color: "var(--foreground)" }}>{tx("Transferencia Bancaria Directa")}</strong>
                          <span style={{ color: "var(--muted-foreground)" }}>{tx("Muestra la cuenta bancaria del hotel al huésped")}</span>
                        </span>
                      </label>

                      <label className="sm:col-span-2 flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                        <input
                          type="checkbox"
                          checked={pcfg.receptionEnabled}
                          onChange={e => patchPay({ receptionEnabled: e.target.checked })}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>
                          <strong className="block" style={{ color: "var(--foreground)" }}>{tx("Pago Directo en Recepción del Hotel")}</strong>
                          <span style={{ color: "var(--muted-foreground)" }}>{tx("El huésped garantiza su reserva y paga al llegar en efectivo o datáfono físico del hotel")}</span>
                        </span>
                      </label>
                    </div>

                    {/* Credenciales / Identificadores de comercio por método habilitado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {pcfg.cardEnabled && (
                        <>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Pasarela de tarjetas del hotel")}</label>
                            <select
                              value={pcfg.cardProvider ?? "DATAFAST"}
                              onChange={e => patchPay({ cardProvider: e.target.value as HotelPaymentConfig["cardProvider"] })}
                              className="w-full rounded border px-3 py-2.5 text-sm outline-none"
                              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              <option value="DATAFAST">Datafast</option>
                              <option value="KUSHKI">Kushki</option>
                              <option value="PLACETOPAY">PlacetoPay</option>
                            </select>
                          </div>
                          <Field label="Merchant ID / Comercio (pasarela)" value={pcfg.cardMerchantId ?? ""} onChange={cardMerchantId => patchPay({ cardMerchantId })} />
                        </>
                      )}
                      {pcfg.payphoneEnabled && (
                        <Field label="PayPhone Store ID del hotel" value={pcfg.payphoneStoreId ?? ""} onChange={payphoneStoreId => patchPay({ payphoneStoreId })} />
                      )}
                      {pcfg.deunaEnabled && (
                        <Field label="Cuenta / Celular DeUna del hotel" value={pcfg.deunaAccount ?? ""} onChange={deunaAccount => patchPay({ deunaAccount })} />
                      )}
                    </div>
                  </div>

                  {/* Cuenta bancaria directa del hotel (para transferencias) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Banco del hotel (para transferencias)" value={editing.bancoAcreditacion ?? "Banco Pichincha"} onChange={bancoAcreditacion => setEditing({ ...editing, bancoAcreditacion })} />
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Tipo de cuenta")}</label>
                      <select
                        value={editing.tipoCuentaBancaria ?? "CORRIENTE"}
                        onChange={e => setEditing({ ...editing, tipoCuentaBancaria: e.target.value as PlatformHotel["tipoCuentaBancaria"] })}
                        className="w-full rounded border px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        <option value="CORRIENTE">Cuenta Corriente</option>
                        <option value="AHORROS">Cuenta de Ahorros</option>
                      </select>
                    </div>
                    <Field label="N.º de cuenta del hotel" value={editing.numeroCuentaBancaria ?? ""} onChange={numeroCuentaBancaria => setEditing({ ...editing, numeroCuentaBancaria })} />
                    <Field label="Titular de la cuenta" value={editing.titularCuentaBancaria ?? ""} onChange={titularCuentaBancaria => setEditing({ ...editing, titularCuentaBancaria })} />
                  </div>

                  {/* Convenio / Facturación mensual de AlojaManta al hotel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Esquema comercial con AlojaManta (cierre mensual)")}</label>
                      <select
                        value={editing.modeloCobroPlataforma ?? "CONVENIO_SIN_COBRO"}
                        onChange={e => setEditing({ ...editing, modeloCobroPlataforma: e.target.value as PlatformHotel["modeloCobroPlataforma"] })}
                        className="w-full rounded border px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        <option value="CONVENIO_SIN_COBRO">{tx("Convenio: no se cobra nada (0 %)")}</option>
                        <option value="COMISION_POR_RESERVA">{tx("Facturación mensual por % de reservas")}</option>
                        <option value="MENSUAL_POR_HABITACION">{tx("Suscripción mensual por habitación")}</option>
                        <option value="HIBRIDO">{tx("Comisión reducida + suscripción mensual")}</option>
                      </select>
                    </div>
                    <Field label="N.º de convenio" value={editing.codigoConvenio ?? "CONV-MANTA-2026"} onChange={codigoConvenio => setEditing({ ...editing, codigoConvenio })} />
                    <Field label="Convenio desde" type="date" value={editing.fechaInicioConvenio ?? "2026-01-01"} onChange={fechaInicioConvenio => setEditing({ ...editing, fechaInicioConvenio })} />
                    <Field label="Convenio hasta" type="date" value={editing.fechaFinConvenio ?? "2026-12-31"} onChange={fechaFinConvenio => setEditing({ ...editing, fechaFinConvenio })} />
                    <Field label="Comisión durante el convenio (%)" type="number" value={String(editing.porcentajeComisionConvenio ?? 0)} onChange={v => setEditing({ ...editing, porcentajeComisionConvenio: Math.max(0, Number(v)) })} />
                    <Field label="Comisión facturable post-convenio (%)" type="number" value={String(editing.porcentajeComisionPostConvenio ?? 8)} onChange={v => setEditing({ ...editing, porcentajeComisionPostConvenio: Math.max(0, Number(v)) })} />
                    <Field label="Valor mensual por habitación (US$)" type="number" value={String(editing.tarifaMensualPorHabitacion ?? 2.5)} onChange={v => setEditing({ ...editing, tarifaMensualPorHabitacion: Math.max(0, Number(v)) })} />
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded text-sm cursor-pointer" style={{ color: "var(--muted-foreground)" }}>{tx("Cancelar")}</button>
              <button type="submit" className="px-5 py-2 rounded text-sm font-semibold cursor-pointer" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{tx("Guardar propiedad")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function UsersView({ users, hotels, currentRole, onSave, onDelete }: {
  users: StaffUser[];
  hotels: PlatformHotel[];
  currentRole: AdminRole;
  onSave: (user: StaffUser) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [hotelPickSearch, setHotelPickSearch] = useState("");
  const [logTab, setLogTab] = useState<"audit" | "errors">("audit");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>(() => getErrorLogs());

  useEffect(() => {
    const refreshLogs = () => setAuditLogs(getAuditLogs());
    const refreshErrors = () => setErrorLogs(getErrorLogs());
    window.addEventListener("alojamanta-audit-change", refreshLogs);
    window.addEventListener("alojamanta-error-change", refreshErrors);
    return () => {
      window.removeEventListener("alojamanta-audit-change", refreshLogs);
      window.removeEventListener("alojamanta-error-change", refreshErrors);
    };
  }, []);

  const canManageUsers = currentRole === "superadmin" || currentRole === "admin";
  const roleOptions: AdminRole[] = currentRole === "superadmin"
    ? ["superadmin", "admin", "manager", "receptionist", "auditor"]
    : ["manager", "receptionist", "auditor"];
  const visibleUsers = users.filter(user => `${user.name} ${user.identificacion ?? ""} ${user.email} ${ROLE_INFO[user.role].label}`.toLowerCase().includes(search.toLowerCase()));
  const activeUsers = users.filter(user => user.status === "active").length;
  const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;

  const startNewUser = () => {
    setHotelPickSearch("");
    setEditing({
      id: "",
      name: "",
      identificacion: "",
      email: "",
      phone: "",
      role: currentRole === "superadmin" ? "admin" : "manager",
      hotelIds: hotels[0] ? [hotels[0].id] : [],
      status: "invited",
      lastAccess: "Pendiente",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] mb-1" style={{ color: "var(--primary)" }}>{tx("Personas")}</p>
          <h1 className="text-2xl">{tx("Equipo y accesos")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{tx("Quién entra al panel, a qué hoteles y qué ha hecho cada uno.")}</p>
        </div>
        {canManageUsers && (
          <button onClick={startNewUser} className="px-4 py-2.5 rounded text-sm font-semibold cursor-pointer" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{tx("+ Crear usuario")}</button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Usuarios" value={String(users.length)} sub="cuentas registradas" />
        <KpiCard label="Activos" value={String(activeUsers)} sub={tx("con acceso habilitado")} accent />
        <KpiCard label="Movimientos" value={String(auditLogs.length)} sub={tx("ingresos y cambios")} />
        <KpiCard label="Errores sin revisar" value={String(unresolvedErrors)} sub={`${errorLogs.length} en total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="rounded-md border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tx("Buscar por nombre, cédula o correo")} className="w-full max-w-sm rounded border px-3 py-2 text-xs outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)" }} />
            <span className="mono text-[10px] ml-auto whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{visibleUsers.length} cuentas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Persona", "Rol", "Hoteles", "Estado", "Último ingreso", ""].map(label => <th key={label} className="mono text-left px-4 py-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--muted-foreground)" }}>{tx(label)}</th>)}
              </tr></thead>
              <tbody>
                {visibleUsers.map((user, index) => {
                  const role = ROLE_INFO[user.role];
                  const assignedNames = user.role === "superadmin"
                    ? tx("Todas las propiedades")
                    : user.role === "auditor" && user.hotelIds.length === 0
                      ? tx("Todos (solo lectura)")
                      : user.hotelIds.map(id => hotels.find(h => h.id === id)?.name).filter(Boolean).join(", ") || tx("Sin asignar");
                  return (
                    <tr key={user.id} style={{ borderBottom: index < visibleUsers.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                          {user.email}{user.identificacion ? ` · CI: ${user.identificacion}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3"><span className="mono text-[9px] uppercase px-2 py-1 rounded" style={{ color: role.color, background: role.bg }}>{tx(role.label)}</span></td>
                      <td className="px-4 py-3 text-xs max-w-52" style={{ color: "var(--muted-foreground)" }}>{assignedNames}</td>
                      <td className="px-4 py-3"><span className="text-[10px] font-semibold uppercase" style={{ color: user.status === "active" ? "#10b981" : user.status === "invited" ? "#d97706" : "#ef4444" }}>{tx(user.status === "active" ? "Activo" : user.status === "invited" ? "Invitado" : "Bloqueado")}</span></td>
                      <td className="px-4 py-3 mono text-[10px]" style={{ color: "var(--muted-foreground)" }}>{relDate(user.lastAccess)}</td>
                      <td className="px-4 py-3">
                        {canManageUsers && (
                          <div className="flex gap-1">
                            <button onClick={() => { setHotelPickSearch(""); setEditing({ ...user }); }} className="px-2 py-1 rounded border text-xs cursor-pointer" style={{ borderColor: "var(--border)" }}>{tx("Editar")}</button>
                            {user.role !== "superadmin" && <button onClick={() => { if (confirm(tx("¿Eliminar la cuenta de {name}?", { name: user.name }))) onDelete(user.id); }} className="px-2 py-1 rounded border text-xs cursor-pointer" style={{ borderColor: "#7f1d1d", color: "#ef4444" }}>{tx("Eliminar")}</button>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-md border p-4 h-fit" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>{tx("Qué puede hacer cada rol")}</p>
          {[
            ["Superadministrador", "Ve y edita todos los hoteles, el IVA y los convenios."],
            ["Administrador de hotel", "Maneja su hotel (o sus sucursales) y a su equipo."],
            ["Revenue Manager", "Pone precios, abre o cierra habitaciones a la venta."],
            ["Recepción", "Atiende las reservas, recibe al huésped y registra el cobro."],
            ["Auditor / Contador", "Revisa pagos, comisiones y el historial. No puede modificar nada."],
          ].map(([role, description]) => <div key={role} className="pb-3 mb-3 border-b last:border-0 last:mb-0 last:pb-0" style={{ borderColor: "var(--border)" }}><p className="text-xs font-semibold">{tx(role)}</p><p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{tx(description)}</p></div>)}
        </div>
      </div>

      {/* Registro de Auditoría y Log de Errores del Sistema */}
      <div className="rounded-md border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLogTab("audit")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all"
              style={{
                background: logTab === "audit" ? "var(--primary)" : "var(--muted)",
                color: logTab === "audit" ? "var(--primary-foreground)" : "var(--muted-foreground)",
                borderColor: logTab === "audit" ? "transparent" : "var(--border)",
              }}
            >
              {tx("Historial")} ({auditLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setLogTab("errors")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all"
              style={{
                background: logTab === "errors" ? "#dc2626" : "var(--muted)",
                color: logTab === "errors" ? "#ffffff" : "var(--muted-foreground)",
                borderColor: logTab === "errors" ? "transparent" : "var(--border)",
              }}
            >
              {tx("Errores")} ({errorLogs.length})
              {unresolvedErrors > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                  {unresolvedErrors}
                </span>
              )}
            </button>
          </div>
          <span className="mono text-[10px] px-2 py-1 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            {tx("Se guarda solo")}
          </span>
        </div>

        {logTab === "audit" ? (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Fecha", "Quién", "Rol", "Qué hizo", "Resultado", "Detalle"].map(h => (
                    <th key={h} className="mono text-left px-3.5 py-2.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{tx(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => {
                  const res = log.result ?? "EXITO";
                  const resColor = res === "DENEGADO" ? "#ef4444" : res === "ERROR" ? "#f59e0b" : "#10b981";
                  return (
                    <tr key={log.id} style={{ borderBottom: i < auditLogs.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-3.5 py-2.5 text-[11px] whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{log.timestamp.slice(0, 16)}</td>
                      <td className="px-3.5 py-2.5 font-medium" style={{ color: "var(--foreground)" }}>
                        {log.user}
                        {log.emailAttempt && <span className="block text-[10px]" style={{ color: "var(--muted-foreground)" }}>{log.emailAttempt}</span>}
                      </td>
                      <td className="px-3.5 py-2.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>{tx(log.role)}</td>
                      <td className="px-3.5 py-2.5 text-[11px] font-medium" style={{ color: "var(--foreground)" }}>{actionLabel(log.action)}</td>
                      <td className="px-3.5 py-2.5 text-[11px] font-semibold" style={{ color: resColor }}>{res === "EXITO" ? tx("Bien") : res === "DENEGADO" ? tx("Rechazado") : tx("Falló")}</td>
                      <td className="px-3.5 py-2.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>{log.detail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80">
            {errorLogs.length === 0 ? (
              <div className="p-6 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                {tx("Todo en orden. Si alguien se equivoca de clave o falla un pago, lo verás aquí.")}
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Fecha", "Gravedad", "Dónde", "Qué pasó", "Quién", "Estado", ""].map(h => (
                      <th key={h} className="mono text-left px-3.5 py-2.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{tx(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.map((err, i) => (
                    <tr key={err.id} style={{ borderBottom: i < errorLogs.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td className="px-3.5 py-2.5 text-[11px] whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{err.timestamp.slice(0, 16)}</td>
                      <td className="px-3.5 py-2.5 text-[11px] font-semibold" style={{ color: err.severity === "CRITICAL" ? "#ef4444" : err.severity === "WARN" ? "#f59e0b" : "#f87171" }}>{err.severity === "CRITICAL" ? tx("Grave") : err.severity === "WARN" ? tx("Aviso") : tx("Error")}</td>
                      <td className="px-3.5 py-2.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>{err.module}</td>
                      <td className="px-3.5 py-2.5 text-[11px]" style={{ color: "var(--foreground)" }}>
                        <p className="font-medium">{err.message}</p>
                        {err.detail && <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{err.detail}</p>}
                      </td>
                      <td className="px-3.5 py-2.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>{err.user}</td>
                      <td className="px-3.5 py-2.5 mono text-[10px] font-bold" style={{ color: err.resolved ? "#10b981" : "#f59e0b" }}>
                        {err.resolved ? tx("Revisado") : tx("Pendiente")}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {!err.resolved && (
                          <button
                            type="button"
                            onClick={() => resolveErrorLog(err.id)}
                            className="px-2 py-1 rounded border text-[10px] font-semibold cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                          >
                            {tx("Ya lo revisé")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(3, 7, 18, .78)" }}>
          <form onSubmit={e => { e.preventDefault(); onSave({ ...editing, id: editing.id || `usr-${Date.now()}` }); setEditing(null); }} className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-5">
              <div><p className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--primary)" }}>{tx("Cuenta de personal")}</p><h2 className="text-xl">{editing.id ? tx("Editar usuario") : tx("Nuevo usuario")}</h2></div>
              <button type="button" onClick={() => setEditing(null)} className="text-xl cursor-pointer" style={{ color: "var(--muted-foreground)" }}>×</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={tx("Nombre completo")} value={editing.name} onChange={name => setEditing({ ...editing, name })} required />
              <Field label={tx("Cédula")} value={editing.identificacion ?? ""} onChange={identificacion => setEditing({ ...editing, identificacion })} />
              <Field label={tx("Email corporativo")} type="email" value={editing.email} onChange={email => setEditing({ ...editing, email })} required />
              <Field label="Teléfono" value={editing.phone} onChange={phone => setEditing({ ...editing, phone })} />
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Rol")}</label>
                <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value as AdminRole, hotelIds: e.target.value === "superadmin" ? [] : editing.hotelIds })} className="w-full rounded border px-3 py-2.5 text-sm" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  {roleOptions.map(role => <option key={role} value={role}>{ROLE_INFO[role].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{tx("Estado")}</label>
                <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as StaffUser["status"] })} className="w-full rounded border px-3 py-2.5 text-sm" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="active">{tx("Activo")}</option>
                  <option value="invited">{tx("Invitación pendiente")}</option>
                  <option value="blocked">{tx("Bloqueado")}</option>
                </select>
              </div>
              {editing.role !== "superadmin" && (
                <div className="sm:col-span-2 rounded-lg border p-3 space-y-2" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {tx("Hoteles a cargo")} ({editing.hotelIds.length})
                    </label>
                    <input
                      type="text"
                      value={hotelPickSearch}
                      onChange={e => setHotelPickSearch(e.target.value)}
                      placeholder={tx("Buscar hotel")}
                      className="rounded border px-2 py-1 text-[11px] outline-none"
                      style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                  {editing.role === "auditor" && (
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      {tx("Si no marcas ninguno, podrá ver todos los hoteles (sin editar).")}
                    </p>
                  )}
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {hotels
                      .filter(hotel => `${hotel.name} ${hotel.taxId ?? ""}`.toLowerCase().includes(hotelPickSearch.toLowerCase()))
                      .map(hotel => {
                        const checked = editing.hotelIds.includes(hotel.id);
                        return (
                          <label key={hotel.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded cursor-pointer hover:opacity-90" style={{ background: checked ? "rgba(217, 119, 6, 0.12)" : "transparent" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const nextIds = checked
                                  ? editing.hotelIds.filter(id => id !== hotel.id)
                                  : [...editing.hotelIds, hotel.id];
                                setEditing({ ...editing, hotelIds: nextIds });
                              }}
                              className="accent-amber-500 cursor-pointer"
                            />
                            <span className="truncate font-medium" style={{ color: "var(--foreground)" }}>{hotel.name}</span>
                            {hotel.taxId && <span className="mono text-[10px] ml-auto shrink-0" style={{ color: "var(--muted-foreground)" }}>RUC {hotel.taxId}</span>}
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
            <div className="rounded p-3 mt-4 text-[11px] leading-relaxed" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{tx("Le llegará un correo para que cree su contraseña.")}</div>
            <div className="flex justify-end gap-2 mt-5"><button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm cursor-pointer" style={{ color: "var(--muted-foreground)" }}>{tx("Cancelar")}</button><button type="submit" className="px-5 py-2 rounded text-sm font-semibold cursor-pointer" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{tx("Guardar usuario")}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  LOGIN_EXITOSO: "Entró al panel",
  LOGIN_FALLIDO: "Clave incorrecta",
  LOGOUT: "Salió del panel",
  REGISTRO_HUESPED: "Se registró un huésped",
  ALTA_HOTEL: "Agregó un hotel",
  EDICION_HOTEL: "Editó un hotel",
  BAJA_HOTEL: "Eliminó un hotel",
  RESET_CATASTRO: "Restauró el listado de hoteles",
  ALTA_USUARIO: "Creó una cuenta",
  EDICION_USUARIO: "Editó una cuenta",
  BAJA_USUARIO: "Eliminó una cuenta",
  CONFIG_METODO_PAGO: "Actualizó los métodos de pago del hotel",
  REGISTRAR_COBRO_LOCAL: "Registró un cobro",
  REGISTRAR_COMPROBANTE: "Anotó el n.º de factura",
  CORREGIR_COMPROBANTE: "Corrigió el n.º de factura",
};

function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return tx(ACTION_LABELS[action]);
  const text = action.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function relDate(s: string): string {
  return s.replace(/^Hoy/, tx("Hoy")).replace(/^Ayer/, tx("Ayer")).replace(/^Pendiente$/, tx("Pendiente"));
}

export default function App() {
  const operations = useGuestReservations();
  useRoomCatalogRevision();
  const lang = useLang();
  // Modo Claro por Defecto para AlojaManta
  const [theme, setTheme] = usePersistentState<"light" | "dark">("alojamanta.theme.v2", "light");
  const [appMode, setAppMode] = useState<"auth" | "guest" | "admin">("guest");
  const [authDefaultTab, setAuthDefaultTab] = useState<"guest" | "admin">("guest");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [view, setView] = useState<View>("hotels");
  const [selectedChatThreadId, setSelectedChatThreadId] = useState<string | null>(null);
  const [activeHotelId, setActiveHotelId] = useState<string>("hotel-voyager-manta");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagingThreads = useMessagingThreads();

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ threadId: string }>;
      if (custom.detail?.threadId) {
        setSelectedChatThreadId(custom.detail.threadId);
      }
      setView("messages");
    };
    window.addEventListener(OPEN_PANEL_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_PANEL_CHAT_EVENT, handler);
  }, []);
  const [hotels, setHotels] = usePersistentState<PlatformHotel[]>("hoteldirekt.hotels.manta_116", DEFAULT_HOTELS);
  const [staffUsers, setStaffUsers] = usePersistentState<StaffUser[]>("hoteldirekt.staff", DEFAULT_STAFF);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Auth page (only for admin access or when guest needs to log in)
  if (appMode === "auth") {
    return (
      <AuthPage
        defaultTab={authDefaultTab}
        onAdminLogin={user => {
          setAdminUser(user);
          const firstHotel = user.hotelIds?.[0];
          if (firstHotel) setActiveHotelId(firstHotel);
          setView(user.role === "superadmin" ? "hotels" : user.role === "receptionist" ? "reservations" : "dashboard");
          setAppMode("admin");
        }}
        onGuestLogin={user => { setGuestUser(user); setAppMode("guest"); }}
        onBackToGuest={() => setAppMode("guest")}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === "light" ? "dark" : "light")}
      />
    );
  }

  // Guest platform — default entry point
  if (appMode === "guest") {
    return (
      <GuestPage
        user={guestUser}
        onGuestLogin={user => setGuestUser(user)}
        onLogout={() => setGuestUser(null)}
        onAdminAccess={() => {
          if (adminUser) {
            setAppMode("admin");
            return;
          }
          setAuthDefaultTab("admin");
          setAppMode("auth");
        }}
        adminSessionActive={adminUser !== null}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === "light" ? "dark" : "light")}
      />
    );
  }

  const role = adminUser?.role ?? "receptionist";
  const currentHotels = hotels.map(hotel => {
    const metrics = hotelMetrics(operations, hotel.id);
    const capacity = getRoomOffers(hotel.id).reduce((sum, room) => sum + room.available, 0);
    return { ...hotel, rooms: capacity, occupancy: capacity ? Math.round(metrics.heldToday / capacity * 100) : 0, monthRevenue: metrics.monthCollected };
  });
  const globalAuditRead = role === "auditor" && !(adminUser?.hotelIds?.length);
  const allowedHotels = role === "superadmin" || globalAuditRead ? currentHotels : currentHotels.filter(h => adminUser?.hotelIds?.includes(h.id));
  const activeHotel = allowedHotels.find(h => h.id === activeHotelId) ?? allowedHotels[0] ?? currentHotels[0];
  const visibleStaff = role === "superadmin" || globalAuditRead ? staffUsers : staffUsers.filter(user => user.hotelIds.some(id => adminUser?.hotelIds?.includes(id)));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 h-dvh lg:h-screen flex flex-col border-r transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: 220,
          background: "var(--card)",
          borderColor: "var(--border)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="shrink-0 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold leading-tight" style={{ color: "var(--primary)" }}>
            AlojaManta
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{tx("Portal Cantonal de Alojamientos")}</p>
          {adminUser && (
            <div className="mt-1.5">
              <span
                className="mono inline-block max-w-full truncate text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                style={{ background: ROLE_INFO[adminUser.role].bg, color: ROLE_INFO[adminUser.role].color }}
                title={tx(ROLE_INFO[adminUser.role].label)}
              >
                {tx(ROLE_INFO[adminUser.role].label)}
              </span>
            </div>
          )}
        </div>

        {/* Botón rápido a la web de huéspedes */}
        <div className="shrink-0 px-3 pt-2.5 pb-1">
          <button
            onClick={() => setAppMode("guest")}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-xs"
          >
            <span>{tx("Ver portal de huéspedes")}</span>
          </button>
        </div>

        {/* Hotel selector */}
        {view !== "hotels" && view !== "users" && activeHotel && (
          <div className="shrink-0 px-3 pt-2.5 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>
              {tx(role === "superadmin" ? "Hotel supervisado" : "Mi Hotel")}
            </p>
            <select
              aria-label={tx(role === "superadmin" ? "Hotel supervisado" : "Mi Hotel")}
              className="w-full px-2 py-1.5 rounded text-xs font-medium border outline-none cursor-pointer hover:border-amber-500/50 transition-colors"
              style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)" }}
              value={activeHotelId}
              disabled={allowedHotels.length <= 1}
              onChange={e => setActiveHotelId(e.target.value)}
            >
              {allowedHotels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Nav (desplazable internamente para que el pie y el usuario siempre queden visibles) */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5 mt-1">
          {NAV_ITEMS.filter(item => item.roles.includes(role)).map((item) => (
            <div key={item.view}>
              {item.divider && (
                <div className="border-t my-1.5" style={{ borderColor: "var(--border)" }} />
              )}
              <button
                onClick={() => {
                  setView(item.view);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-all cursor-pointer"
                style={{
                  background: view === item.view ? "var(--secondary)" : "transparent",
                  color: view === item.view ? "var(--foreground)" : "var(--muted-foreground)",
                  borderLeft: view === item.view ? "2px solid var(--primary)" : "2px solid transparent",
                }}
              >
                <span className="w-6 h-6 shrink-0 rounded flex items-center justify-center text-slate-400 group-hover:text-amber-400" style={{ background: "var(--muted)" }}>
                  <NavIcon view={item.view} />
                </span>
                <span className="font-medium text-xs leading-tight flex-1">{tx(item.label)}</span>
                {item.view === "messages" && (() => {
                  const badge = role === "superadmin"
                    ? countUnreadForSuperadmin(messagingThreads)
                    : countUnreadForHotel(messagingThreads, activeHotel?.id ?? "");
                  return badge > 0 ? (
                    <span className="mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shrink-0">
                      {badge}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
          ))}
        </nav>

        {/* Controles fijos + usuario siempre visibles en la base del viewport */}
        <div className="shrink-0 border-t" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="px-2.5 pt-2.5 pb-2 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {/* Selector de idioma Español / English */}
              <button
                type="button"
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer hover:border-amber-500/50"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                title={tx("Cambiar idioma")}
                aria-label={tx("Cambiar idioma")}
              >
                <span>{tx("Idioma")}</span>
                <span className="mono text-[10px] font-bold uppercase" style={{ color: "var(--primary)" }}>
                  {lang === "es" ? "ES" : "EN"}
                </span>
              </button>
              {/* Botón de cambio de tema Claro / Oscuro */}
              <button
                type="button"
                onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer hover:border-amber-500/50"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                title={tx("Alternar entre modo claro y modo oscuro")}
              >
                <span>{theme === "light" ? tx("Claro") : tx("Oscuro")}</span>
                {theme === "light" ? (
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (adminUser) {
                  addAuditLog({
                    usuario: adminUser.name,
                    rol: ROLE_INFO[adminUser.role].label,
                    modulo: "AUTH",
                    accion: "LOGOUT",
                    detalle: "Cierre de sesión manual desde panel administrativo.",
                  });
                }
                setAdminUser(null);
                setAppMode("auth");
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              style={{ background: "var(--muted)" }}
            >
              {tx("← Cerrar sesión")}
            </button>
          </div>

          {/* Usuario activo */}
          <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {(adminUser?.name?.charAt(0) ?? "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  {adminUser?.name ?? "Admin"}
                </p>
                <p className="mono text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>
                  {adminUser?.email ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-lg"
              style={{ color: "var(--foreground)" }}
            >
              ☰
            </button>
            <span className="font-bold text-sm" style={{ color: "var(--primary)" }}>
              AlojaManta
            </span>
          </div>
          <button
            onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
            className="text-sm px-2 py-1 rounded border cursor-pointer"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
            title="Cambiar tema"
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          {view === "hotels" && (
            <HotelsView
              hotels={allowedHotels}
              onSelect={id => { setActiveHotelId(id); setView("dashboard"); }}
              onSave={hotel => {
                const exists = hotels.some(item => item.id === hotel.id);
                const actor = adminUser?.name ?? "Superadministrador";
                const stamped: PlatformHotel = {
                  ...hotel,
                  creadoPor: exists ? (hotel.creadoPor ?? actor) : actor,
                  actualizadoPor: actor,
                };
                const baseList = exists
                  ? hotels.map(item => (item.id === hotel.id ? stamped : item))
                  : [...hotels, stamped];
                // Sincronizar datos fiscales de empresa_propietaria en todos los hoteles que compartan el mismo RUC
                const cleanRuc = (stamped.taxId ?? "").trim();
                const next = cleanRuc
                  ? baseList.map(item =>
                      (item.taxId ?? "").trim() === cleanRuc
                        ? {
                            ...item,
                            razonSocial: stamped.razonSocial ?? item.razonSocial,
                            owner: stamped.owner ?? item.owner,
                            direccionFiscalEmpresa: stamped.direccionFiscalEmpresa ?? item.direccionFiscalEmpresa,
                            emailFacturacionEmpresa: stamped.emailFacturacionEmpresa ?? item.emailFacturacionEmpresa,
                          }
                        : item
                    )
                  : baseList;
                try { localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(next)); } catch {}
                setHotels(next);
                notifyCatalogChanged();
                addAuditLog({
                  usuario: actor,
                  rol: ROLE_INFO[role].label,
                  hotelId: stamped.id,
                  hotelName: stamped.name,
                  modulo: "CATASTRO_HOTELERO",
                  accion: exists ? "EDICION_HOTEL" : "ALTA_HOTEL",
                  detalle: `${exists ? "Actualizado" : "Registrado"} ${stamped.name} (RUC ${stamped.taxId || "N/D"}, Estado: ${stamped.status})`,
                });
              }}
              onDelete={id => {
                const target = hotels.find(h => h.id === id);
                const next = hotels.filter(hotel => hotel.id !== id);
                try { localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(next)); } catch {}
                setHotels(next);
                notifyCatalogChanged();
                addAuditLog({
                  usuario: adminUser?.name ?? "Superadministrador",
                  rol: ROLE_INFO[role].label,
                  hotelId: id,
                  hotelName: target?.name ?? id,
                  modulo: "CATASTRO_HOTELERO",
                  accion: "BAJA_HOTEL",
                  detalle: `Eliminado establecimiento ${target?.name ?? id}`,
                });
              }}
              canDelete={role === "superadmin"}
              onResetCatalog={() => {
                try {
                  localStorage.removeItem(HOTELS_STORAGE_KEY);
                  localStorage.removeItem("hoteldirekt.hotels");
                  localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(DEFAULT_HOTELS));
                } catch {}
                setHotels(DEFAULT_HOTELS);
                notifyCatalogChanged();
                addAuditLog({
                  usuario: adminUser?.name ?? "Superadministrador",
                  rol: ROLE_INFO[role].label,
                  modulo: "CATASTRO_HOTELERO",
                  accion: "RESET_CATASTRO",
                  detalle: "Se volvió a cargar el listado original de hoteles.",
                });
              }}
            />
          )}
          {view === "users" && (
            <UsersView
              users={visibleStaff}
              hotels={allowedHotels}
              currentRole={role}
              onSave={user => {
                const exists = staffUsers.some(item => item.id === user.id);
                setStaffUsers(current => exists ? current.map(item => item.id === user.id ? user : item) : [...current, user]);
                addAuditLog({
                  usuario: adminUser?.name ?? "Administrador",
                  rol: ROLE_INFO[role].label,
                  modulo: "USUARIOS_RBAC",
                  accion: exists ? "EDICION_USUARIO" : "ALTA_USUARIO",
                  detalle: `${exists ? "Actualizada" : "Creada"} cuenta ${user.name} (${user.email}) · Rol: ${ROLE_INFO[user.role].label}`,
                });
              }}
              onDelete={id => {
                const target = staffUsers.find(u => u.id === id);
                setStaffUsers(current => current.filter(user => user.id !== id));
                addAuditLog({
                  usuario: adminUser?.name ?? "Administrador",
                  rol: ROLE_INFO[role].label,
                  modulo: "USUARIOS_RBAC",
                  accion: "BAJA_USUARIO",
                  detalle: `Eliminada cuenta ${target?.name ?? id} (${target?.email ?? ""})`,
                });
              }}
            />
          )}
          {view === "dashboard" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs px-1 pb-1 border-b" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>{tx("Gestionando:")}</span>
                <span className="font-semibold" style={{ color: "var(--primary)" }}>{activeHotel?.name}</span>
                <span style={{ color: "var(--muted-foreground)" }}>·</span>
                <span style={{ color: "var(--muted-foreground)" }}>{activeHotel?.city}</span>
              </div>
              <Dashboard hotelId={activeHotel.id} canReset={role === "superadmin"} />
            </div>
          )}
          {view === "reservations" && activeHotel && <ReservationsView key={activeHotel.id} hotelId={activeHotel.id} hotelName={activeHotel.name} operator={adminUser?.name ?? "Operador local"} canManagePayments={role !== "manager" && role !== "auditor"} canConfigureArrival={role === "superadmin" || role === "admin"} />}
          {view === "rooms" && activeHotel && (
            <RoomsView
              key={activeHotel.id}
              hotelId={activeHotel.id}
              onGoToGuestWeb={() => setAppMode("guest")}
              operator={adminUser?.name ?? "Operador local"}
              canManagePayments={role !== "manager" && role !== "auditor"}
            />
          )}
          {view === "revenue" && <RevenueView hotelId={activeHotel.id} />}
          {view === "guests" && activeHotel && <GuestsView key={activeHotel.id} hotelId={activeHotel.id} />}
          {view === "messages" && activeHotel && (
            <PanelMessagesView
              key={`${activeHotel.id}-${role}`}
              hotelId={activeHotel.id}
              hotelName={activeHotel.name}
              role={role}
              operatorName={adminUser?.name ?? "Operador local"}
              reservations={operations}
              initialThreadId={selectedChatThreadId}
            />
          )}
          {view === "billing" && activeHotel && <BillingView key={activeHotel.id} hotelId={activeHotel.id} operator={adminUser?.name ?? "Operador local"} />}
          {view === "payments" && activeHotel && <PaymentsView key={activeHotel.id} hotelId={activeHotel.id} operator={adminUser?.name ?? "Operador local"} />}
          {view === "rates" && activeHotel && <RatesView key={activeHotel.id} hotelId={activeHotel.id} hotel={activeHotel} />}
        </main>
      </div>

    </div>
  );
}
