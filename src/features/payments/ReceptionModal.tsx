import { useState } from "react";
import { useI18n } from "../../i18n";
import { useGuestReservations } from "../../app/useGuestReservations";
import { ReservationDialog } from "../reservations/ReservationDialog";
import { ReservationSummary } from "../reservations/ReservationSummary";
import { HotelReceiptForm, PaymentForm } from "./ReceptionForms";
import { hasRecordedFullPayment } from "./receipts";

export function ReceptionModal({ hotelId, reservationId, operator, onClose }: {
  hotelId: string; reservationId: string; operator: string; onClose: () => void;
}) {
  const tx = useI18n();
  const reservations = useGuestReservations();
  const reservation = reservations.find(item => item.id === reservationId && item.hotelId === hotelId);
  const [tab, setTab] = useState<"reception" | "voucher">("reception");
  const [feedback, setFeedback] = useState("");
  const [copiedBilling, setCopiedBilling] = useState(false);

  function handleCopyBilling() {
    if (!reservation) return;
    const text = `DATOS DEL HUÉSPED PARA COMPROBANTE DEL HOTEL:
Cliente / Razón Social: ${reservation.guestRazonSocial || reservation.guestName}
Documento: ${reservation.guestDocumentType || "CÉDULA / RUC"}: ${reservation.guestDocument || "9999999999999"}
Email: ${reservation.guestEmail}
Teléfono: ${reservation.guestPhone || "N/A"}
Hospedaje: ${reservation.room} (${reservation.checkIn} a ${reservation.checkOut}, ${reservation.nights} noches)
Total Pagado: US$ ${reservation.total.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedBilling(true);
    setTimeout(() => setCopiedBilling(false), 2500);
  }

  return (
    <ReservationDialog title={tx("Cobro en recepción")} onClose={onClose}>
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
                {tx("Cobro")}
              </button>
              <button
                type="button"
                className={`border-b-2 px-1 py-2 text-xs font-bold transition-all ${
                  tab === "voucher" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-muted-foreground"
                }`}
                onClick={() => setTab("voucher")}
              >
                {tx("Voucher")}
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

              {/* ─── 1. REGISTRO DE PAGO DIRECTO AL HOTEL (SIN RETENCIÓN NI VCC) ─── */}
              {hasRecordedFullPayment(reservation) ? (
                <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 p-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs text-emerald-800 dark:text-emerald-300">{tx("Pago directo al hotel registrado")}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      100 % {tx("directo al hotel")}
                    </span>
                  </div>
                  <p className="text-xl font-bold font-mono">US${reservation.payment!.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx(reservation.payMethod || reservation.payment!.method)} · {reservation.payment!.reference || tx("Sin referencia")}
                  </p>
                </div>
              ) : (
                <PaymentForm reservation={reservation} operator={operator} onSaved={() => setFeedback(tx("Cobro guardado."))} />
              )}

              {/* ─── RESUMEN DE RECAUDACIÓN DIRECTA DEL HOTEL ─── */}
              {reservation.breakdown && (
                <div className="rounded-2xl border border-border bg-muted/20 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{tx("Acreditación directa al establecimiento")}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {reservation.breakdown.inAgreement ? tx("En convenio (0 % plataforma)") : `${tx("Comisión mensual")} ${reservation.breakdown.commissionPercent}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tx("Total acreditado directo al hotel (sin retención)")}{reservation.cardLast4 ? ` (${reservation.cardBrand || "Tarjeta"} •••• ${reservation.cardLast4})` : ""}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">US${reservation.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-t border-border pt-1">
                    <span>{tx("Comisión facturable al cierre del mes (informativa)")}</span>
                    <span className="font-mono text-amber-600">US${reservation.breakdown.retentionCommissionAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* ─── 2. DATOS DEL HUÉSPED PARA FACTURA / COMPROBANTE DEL HOTEL ─── */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <span>🧾</span>
                    <span>{tx("Datos para la factura")}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyBilling}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    {copiedBilling ? tx("Copiado") : tx("Copiar datos")}
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-tight">
                  {tx("La factura la emite el hotel con su propio sistema.")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-muted/40 font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-muted-foreground block">Razón Social / Nombre</span>
                    <span className="font-bold text-foreground truncate block">{reservation.guestRazonSocial || reservation.guestName}</span>
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
              {tx("Imprimir")}
            </button>
          </div>
        </>
      )}
    </ReservationDialog>
  );
}
