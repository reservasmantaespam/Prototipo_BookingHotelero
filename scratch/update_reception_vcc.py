reception_modal_code = '''import { useState } from "react";
import { useI18n } from "../../i18n";
import { useGuestReservations } from "../../app/useGuestReservations";
import { ReservationDialog } from "../reservations/ReservationDialog";
import { ReservationSummary } from "../reservations/ReservationSummary";
import { HotelReceiptForm, PaymentForm } from "./ReceptionForms";
import { hasRecordedFullPayment } from "./receipts";
import { guestReservationRepository, RESERVATIONS_CHANGED_EVENT } from "../../app/reservations";
import { addAuditLog } from "../../hotelData";

export function ReceptionModal({ hotelId, reservationId, operator, onClose }: {
  hotelId: string; reservationId: string; operator: string; onClose: () => void;
}) {
  const tx = useI18n();
  const reservations = useGuestReservations();
  const reservation = reservations.find(item => item.id === reservationId && item.hotelId === hotelId);
  const [tab, setTab] = useState<"reception" | "voucher">("reception");
  const [feedback, setFeedback] = useState("");
  const [showFullVcc, setShowFullVcc] = useState(false);
  const [posCode, setPosCode] = useState("");
  const [copiedBilling, setCopiedBilling] = useState(false);

  function handleChargeVcc(e: React.FormEvent) {
    e.preventDefault();
    if (!reservation || !reservation.virtualCard) return;
    try {
      const authRef = posCode.trim() || `POS-AUT-${Math.floor(Math.random() * 900000 + 100000)}`;
      const updatedReservation = {
        ...reservation,
        paymentStatus: "paid" as const,
        payment: {
          amount: reservation.virtualCard.amount,
          method: "Tarjeta externa" as const,
          reference: `VCC-DATAFOS-${authRef}`,
          recordedAt: new Date().toISOString(),
          recordedBy: operator,
        },
        virtualCard: {
          ...reservation.virtualCard,
          status: "charged" as const,
          chargedAt: new Date().toISOString(),
          chargedBy: operator,
          posAuthCode: authRef,
        },
      };

      const all = guestReservationRepository.read() || [];
      guestReservationRepository.persist(all.map(item => item.id === reservation.id ? updatedReservation : item));
      window.dispatchEvent(new Event(RESERVATIONS_CHANGED_EVENT));

      addAuditLog({
        usuario: operator,
        rol: "Recepción / Revenue",
        modulo: "Cobros B2B",
        accion: "VCC_EFECTIVIZADA",
        detalle: `Cobro de Tarjeta Virtual AlojaManta efectivizado en POS por US$${reservation.virtualCard.amount.toFixed(2)} (Aut: ${authRef})`,
        hotelId: reservation.hotelId,
        hotelName: reservation.hotel,
      });

      setFeedback(tx("¡Cobro de Tarjeta Virtual efectivizado con éxito en POS del hotel! Fondos liquidados."));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Error al procesar el cobro.");
    }
  }

  function handleCopyBilling() {
    if (!reservation) return;
    const text = `DATOS FACTURA SRI:
Cliente: ${reservation.guestName}
Documento: ${reservation.guestDocumentType || "CÉDULA / RUC"}: ${reservation.guestDocument || "9999999999999"}
Email: ${reservation.guestEmail}
Teléfono: ${reservation.guestPhone || "N/A"}
Hospedaje: ${reservation.room} (${reservation.checkIn} a ${reservation.checkOut}, ${reservation.nights} noches)
Total a Facturar: US$ ${reservation.total.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedBilling(true);
    setTimeout(() => setCopiedBilling(false), 2500);
  }

  return (
    <ReservationDialog title={tx("Gestión y Cobro en Recepción")} onClose={onClose}>
      {!reservation ? (
        <p className="p-5 text-muted-foreground">{tx("No se encontró la reserva en este establecimiento.")}</p>
      ) : (
        <>
          <div data-print-ui className="border-b border-border bg-muted/30">
            <div className="px-5 pt-3.5 pb-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground text-sm">{reservation.guestName}</p>
                  <p className="text-xs text-muted-foreground">{reservation.room} · {reservation.hotel}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-500 text-sm">US${reservation.total.toFixed(2)}</span>
                  <p className="text-[10px] text-muted-foreground font-mono">{reservation.id}</p>
                </div>
              </div>
            </div>
            <div role="tablist" className="flex gap-4 px-5 pt-1">
              <button
                type="button"
                className={`border-b-2 px-1 py-2 text-xs font-bold transition-all ${
                  tab === "reception" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-muted-foreground"
                }`}
                onClick={() => setTab("reception")}
              >
                💳 {tx("Cobro VCC & Facturación")}
              </button>
              <button
                type="button"
                className={`border-b-2 px-1 py-2 text-xs font-bold transition-all ${
                  tab === "voucher" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-muted-foreground"
                }`}
                onClick={() => setTab("voucher")}
              >
                📄 {tx("Voucher del Huésped")}
              </button>
            </div>
          </div>

          <div
            role="tabpanel"
            className={`reservation-print-content p-4 sm:p-5 ${tab === "voucher" ? "" : "hidden"}`}
          >
            <ReservationSummary reservation={reservation} />
          </div>

          {tab === "reception" && (
            <div role="tabpanel" data-print-ui className="p-4 sm:p-5 space-y-4">
              {feedback && (
                <p role="status" className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 text-xs font-semibold">
                  {feedback}
                </p>
              )}

              {/* ─── 1. MÓDULO B2B: TARJETA VIRTUAL ALOJAMANTA (VCC) ─── */}
              {reservation.virtualCard ? (
                <div className="rounded-2xl border border-amber-400/80 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 sm:p-5 shadow-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">💳</span>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 font-mono">
                          Tarjeta Virtual AlojaManta (VCC)
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Liquidación exclusiva para cobro del Hotel · Prohibido transferir
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        reservation.virtualCard.status === "charged"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {reservation.virtualCard.status === "charged" ? "✓ Liquidada en POS" : "🟢 Lista para Datáfono"}
                    </span>
                  </div>

                  {/* Tarjeta Visual de Datáfono */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                        ALOJAMANTA B2B CORPORATE
                      </span>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        US${reservation.virtualCard.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-mono text-base tracking-widest text-slate-100 font-bold">
                        {showFullVcc
                          ? reservation.virtualCard.cardNumber
                          : reservation.virtualCard.cardNumber.replace(/(\\d{4}\\s\\d{4}\\s)\\d{4}(\\s\\d{4})/, "$1••••$2")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowFullVcc(!showFullVcc)}
                        className="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer font-semibold transition-colors"
                      >
                        {showFullVcc ? "Ocultar" : "👁️ Revelar"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-700/60">
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 block">Vence</span>
                        <span className="font-mono font-bold">{reservation.virtualCard.expiry}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 block">CVV</span>
                        <span className="font-mono font-bold text-amber-400">
                          {showFullVcc ? reservation.virtualCard.cvv : "•••"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase text-slate-400 block">Titular</span>
                        <span className="text-[10px] font-mono truncate max-w-[150px] inline-block">
                          {reservation.virtualCard.cardHolder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acción de Cobro en Datáfono */}
                  {reservation.virtualCard.status !== "charged" ? (
                    <form onSubmit={handleChargeVcc} className="pt-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="N° Lote / Autorización POS (Ej: AUTH-8219)"
                        value={posCode}
                        onChange={e => setPosCode(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white outline-none font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        💳 {tx("Efectivizar Cobro en POS del Hotel")}
                      </button>
                    </form>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>✓ Cobro liquidado en Datáfono ({reservation.virtualCard.posAuthCode || "POS-OK"})</span>
                      <span className="font-mono text-[10px] text-emerald-400">{reservation.virtualCard.chargedBy}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback cobro manual */
                hasRecordedFullPayment(reservation) ? (
                  <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 p-4 space-y-1">
                    <h3 className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">{tx("Pago Registrado")}</h3>
                    <p className="text-xl font-bold font-mono">US${reservation.payment!.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{tx(reservation.payment!.method)} · {reservation.payment!.reference || tx("Sin referencia")}</p>
                  </div>
                ) : (
                  <PaymentForm reservation={reservation} operator={operator} onSaved={() => setFeedback(tx("Cobro registrado con éxito."))} />
                )
              )}

              {/* ─── 2. DATOS DEL HUÉSPED PARA FACTURACIÓN SRI DEL HOTEL ─── */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <span>🧾</span>
                    <span>{tx("Datos del Huésped para Emisión de Factura SRI")}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyBilling}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    {copiedBilling ? tx("✓ Copiado al portapapeles") : tx("📋 Copiar para el SRI")}
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-tight">
                  {tx("El hotel debe emitir la factura física o electrónica directa al cliente por el servicio de hospedaje prestado.")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-muted/40 font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Razón Social / Nombre</span>
                    <span className="font-bold text-foreground truncate block">{reservation.guestName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">{reservation.guestDocumentType || "Identificación"}</span>
                    <span className="font-bold text-foreground">{reservation.guestDocument || "9999999999999"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Email para envío de factura</span>
                    <span className="text-foreground truncate block">{reservation.guestEmail}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Teléfono de contacto</span>
                    <span className="text-foreground">{reservation.guestPhone || "N/A"}</span>
                  </div>
                </div>

                {/* Registro opcional del número de factura física/electrónica emitida por el hotel */}
                <HotelReceiptForm key={reservation.id} reservation={reservation} operator={operator} />
              </div>
            </div>
          )}

          <div data-print-ui className="border-t border-border p-3 text-right">
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted cursor-pointer transition-colors"
              onClick={() => window.print()}
            >
              🖨️ {tx("Imprimir / Guardar PDF")}
            </button>
          </div>
        </>
      )}
    </ReservationDialog>
  );
}
'''

with open('src/features/payments/ReceptionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(reception_modal_code)

print('Successfully updated ReceptionModal.tsx with Virtual Credit Card (VCC) & Hotel Billing Module!')
