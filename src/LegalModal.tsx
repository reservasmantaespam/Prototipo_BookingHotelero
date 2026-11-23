import { useState } from "react";
import { tx } from "./i18n";

export interface LegalModalProps {
  onClose: () => void;
  initialTab?: "terms" | "privacy";
  onAcceptBoth?: () => void;
}

export default function LegalModal({ onClose, initialTab = "terms", onAcceptBoth }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">🏛️</span>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Términos del Servicio y Privacidad LOPDP")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx("Normativa legal, condiciones de reserva y protección de datos en el Cantón Manta")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-sm font-bold"
            aria-label="Cerrar modal legal"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b text-xs font-bold" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "terms"
                ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-card font-extrabold shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>📜</span>
            <span>{tx("Términos y Condiciones de Uso")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "privacy"
                ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-card font-extrabold shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🛡️</span>
            <span>{tx("Protección de Datos (LOPDP Ecuador)")}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-muted-foreground leading-relaxed">
          {activeTab === "terms" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-foreground">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1.5 flex items-center gap-2">
                  <span>🏖️</span>
                  <span>{tx("1. Objeto y Alcance de AlojaManta")}</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  {tx(
                    "AlojaManta es la plataforma digital de promoción y reservación hotelera del Cantón Manta (Manabí, Ecuador). Facilita la conexión y contratación directa entre huéspedes nacionales o extranjeros y los 116 establecimientos turísticos homologados del cantón, abarcando las 5 parroquias urbanas (Manta, Tarqui, Los Esteros, San Mateo, Eloy Alfaro) y 2 parroquias rurales (Santa Marianita y San Lorenzo)."
                  )}
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>🧾</span>
                  <span>{tx("2. Confirmación, Vouchers y Tarifa con IVA 15%")}</span>
                </h5>
                <p className="text-[12px] text-muted-foreground">
                  {tx(
                    "Toda reserva confirmada genera un Voucher Oficial descargable en PDF con código alfanumérico único (RES-XXXXX) y PIN de seguridad. Los cobros se procesan directamente hacia los métodos de pago configurados por cada hotel, sin retención de fondos por AlojaManta. El hotel receptor emite directamente la factura o comprobante comercial al huésped con el desglose tributario vigente."
                  )}
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>🔄</span>
                  <span>{tx("3. Políticas de Tarifas y Cancelación")}</span>
                </h5>
                <ul className="list-disc pl-5 space-y-1.5 text-[12px] text-muted-foreground">
                  <li>
                    <strong className="text-foreground">{tx("Tarifa Flexible:")}</strong> {tx("Permite cancelación sin penalidad hasta 24 horas antes del horario fijado de check-in (14:00 COT).")}
                  </li>
                  <li>
                    <strong className="text-foreground">{tx("Tarifa No Reembolsable (-10%):")}</strong> {tx("Ofrece descuento directo e inmediato. En caso de no presentación (no-show) o cancelación posterior, el valor no es reembolsable.")}
                  </li>
                  <li>
                    <strong className="text-foreground">{tx("Tarifa Desayuno Incluido:")}</strong> {tx("Incluye desayuno continental o buffet según la categoría del hotel seleccionado.")}
                  </li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>🛎️</span>
                  <span>{tx("4. Registro de Huéspedes y Check-in")}</span>
                </h5>
                <p className="text-[12px] text-muted-foreground">
                  {tx(
                    "Para el check-in presencial en cualquier establecimiento de Manta, todo huésped mayor de edad debe presentar su documento de identidad original (Cédula de Ciudadanía ecuatoriana o Pasaporte internacional vigente) y el código de reserva generado por la plataforma."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-foreground">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1.5 flex items-center gap-2">
                  <span>⚖️</span>
                  <span>{tx("Marco Legal: Ley Orgánica de Protección de Datos Personales (LOPDP)")}</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  {tx(
                    "En cumplimiento estricto con la Ley Orgánica de Protección de Datos Personales de la República del Ecuador (Registro Oficial Suplemento 459 del 26 de mayo de 2021) y su Reglamento General, AlojaManta y sus establecimientos hoteleros afiliados garantizan el tratamiento lícito, leal, transparente y confidencial de sus datos personales."
                  )}
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>👤</span>
                  <span>{tx("1. Responsables del Tratamiento y Finalidades")}</span>
                </h5>
                <p className="text-[12px] text-muted-foreground">
                  {tx(
                    "Los datos recabados (nombres, correo electrónico, teléfono, número de cédula o pasaporte y preferencias de viaje) son tratados exclusivamente para: (a) procesar la reserva hotelera y emitir el voucher oficial; (b) transmitir la ficha de registro al establecimiento hotelero seleccionado; (c) emitir el comprobante comercial y registro del huésped por parte del hotel; y (d) enviar notificaciones del estado de su estancia."
                  )}
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>🔐</span>
                  <span>{tx("2. Derechos ARCO del Titular de Datos")}</span>
                </h5>
                <p className="text-[12px] text-muted-foreground mb-2">
                  {tx(
                    "Conforme a los Arts. 21 al 27 de la LOPDP, usted tiene derecho a ejercer en cualquier momento sus facultades de:"
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card">
                    <strong className="text-foreground block mb-0.5">🔍 Acceso e Información</strong>
                    Conocer qué datos suyos reposan en la plataforma y cómo son tratados.
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card">
                    <strong className="text-foreground block mb-0.5">✏️ Rectificación</strong>
                    Actualizar o corregir datos incompletos o desactualizados.
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card">
                    <strong className="text-foreground block mb-0.5">🗑️ Eliminación</strong>
                    Solicitar la supresión de sus datos personales cuando cese la reserva.
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/80 bg-card">
                    <strong className="text-foreground block mb-0.5">⛔ Oposición y Revocatoria</strong>
                    Negarse a tratamientos no esenciales o revocar su consentimiento.
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Para ejercer estos derechos, puede escribir directamente a <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">privacidad@alojamanta.ec</code> indicando su documento de identidad.
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background/60 space-y-2">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>🔒</span>
                  <span>{tx("3. Medidas de Seguridad y No Transferencia Comercial")}</span>
                </h5>
                <p className="text-[12px] text-muted-foreground">
                  {tx(
                    "AlojaManta no vende ni cede sus datos a terceros con fines publicitarios. Toda la información viaja cifrada mediante protocolos TLS 1.3 / SSL de alta seguridad y se almacena en infraestructuras con estrictos controles de acceso y autenticación."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3.5 border-t flex items-center justify-between gap-3 text-xs"
          style={{ background: "var(--background)", borderColor: "var(--border)" }}
        >
          <span className="text-muted-foreground text-[11px]">
            {tx("Al crear tu cuenta en AlojaManta aceptas estas normativas.")}
          </span>
          <div className="flex items-center gap-2">
            {onAcceptBoth && (
              <button
                type="button"
                onClick={() => {
                  onAcceptBoth();
                  onClose();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                {tx("Acepto")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition-colors"
            >
              {tx("Cerrar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

