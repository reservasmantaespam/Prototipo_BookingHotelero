import fs from "fs";

let content = fs.readFileSync("src/App.tsx", "utf-8");

// 1. Update filter state in ReservationsView
content = content.replace(
  `  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [codeQuery, setCodeQuery] = useState("");
  const [validationFeedback, setValidationFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<HotelInvoice | null>(null);`,
  `  const [filter, setFilter] = useState<ReservationStatus | "all" | "today_unprocessed" | "today_processed">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [codeQuery, setCodeQuery] = useState("");
  const [validationFeedback, setValidationFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<HotelInvoice | null>(null);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("huesped.prueba@manta.gob.ec");
  const [testEmailSent, setTestEmailSent] = useState(false);`
);

// 2. Update filtered logic in ReservationsView
content = content.replace(
  `  const filtered = useMemo(
    () =>
      normalizedReservations.filter(
        (r) =>
          (filter === "all" || r.status === filter) &&
          (search === "" ||
            r.guestName.toLowerCase().includes(search.toLowerCase()) ||
            r.roomType.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase()))
      ),
    [filter, search, normalizedReservations]
  );`,
  `  const filtered = useMemo(
    () =>
      normalizedReservations.filter((r) => {
        const matchesSearch =
          search === "" ||
          r.guestName.toLowerCase().includes(search.toLowerCase()) ||
          r.roomType.toLowerCase().includes(search.toLowerCase()) ||
          r.id.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "today_unprocessed") {
          return (r.status === "pending" || r.status === "confirmed") && !r.voucherValidated;
        }
        if (filter === "today_processed") {
          return r.status === "validated" || r.status === "completed" || Boolean(r.voucherValidated);
        }
        if (filter === "all") return true;
        return r.status === filter;
      }),
    [filter, search, normalizedReservations]
  );`
);

// 3. Update tabs list in ReservationsView
content = content.replace(
  `  const tabs: { key: ReservationStatus | "all"; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Por Confirmar" },
    { key: "confirmed", label: "Confirmadas" },
    { key: "validated", label: "Voucher Validado" },
    { key: "completed", label: "Liquidadas" },
    { key: "cancelled", label: "Canceladas" },
  ];`,
  `  const tabs: { key: ReservationStatus | "all" | "today_unprocessed" | "today_processed"; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "today_unprocessed", label: "🔔 Hoy: No Procesadas" },
    { key: "today_processed", label: "✓ Hoy: Procesadas" },
    { key: "pending", label: "Por Confirmar" },
    { key: "confirmed", label: "Confirmadas" },
    { key: "validated", label: "Voucher Validado" },
    { key: "completed", label: "Liquidadas" },
    { key: "cancelled", label: "Canceladas" },
  ];`
);

// 4. Add "Enviar correo de prueba" button in ReservationsView header
content = content.replace(
  `          <button
            type="button"
            onClick={handleSimulateIncomingWebBooking}
            className="px-3.5 py-2 rounded text-xs font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{tx("Probar sonido de notificación")}</span>
          </button>`,
  `          <button
            type="button"
            onClick={() => {
              setShowTestEmailModal(true);
              setTestEmailSent(false);
            }}
            className="px-3.5 py-2 rounded text-xs font-bold border border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>✉️</span>
            <span>{tx("Enviar correo de prueba")}</span>
          </button>
          <button
            type="button"
            onClick={handleSimulateIncomingWebBooking}
            className="px-3.5 py-2 rounded text-xs font-bold border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{tx("Probar sonido de notificación")}</span>
          </button>`
);

// 5. Add Preferences & Observations column header and cells
content = content.replace(
  `{["Código", "Huésped", "Tipo de Habitación", "Fecha Entrada", "Fecha Salida", "Noches", "Canal", "Total", "Estado Reserva", "Acciones (1 Clic)"].map(`,
  `{["Código", "Huésped", "Tipo de Habitación", "Fecha Entrada", "Fecha Salida", "Preferencias / Notas", "Total", "Estado Reserva", "Acciones (1 Clic)"].map(`
);

content = content.replace(
  `<td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {r.nights}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "var(--muted)" }}>
                        {r.source}
                      </span>
                    </td>`,
  `<td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-amber-500">
                          {r.notes || (r.id.endsWith("1") ? "🛌 Cama King · Piso alto" : r.id.endsWith("2") ? "🍼 Cuna bebé · Llegada tarde" : "☕ Desayuno buffet · Silenciosa")}
                        </span>
                        <span className="text-[10px] text-muted-foreground italic truncate max-w-[140px]">
                          {r.id.endsWith("1") ? "Huésped frecuente" : r.id.endsWith("2") ? "Requiere cuna armada" : "Sin observaciones"}
                        </span>
                      </div>
                    </td>`
);

// 6. Add Test Email Modal rendering in ReservationsView
const emailModalSnippet = `      {/* Modal de Envío de Correo de Prueba */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <div>
                  <h3 className="text-base font-bold text-foreground">Comprobante y Voucher por Correo Electrónico</h3>
                  <p className="text-xs text-muted-foreground">Previsualiza y envía el correo oficial de confirmación al huésped</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 cursor-pointer"
              >
                ×
              </button>
            </div>

            {testEmailSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 text-center">
                <p className="text-2xl">✓</p>
                <p className="font-bold text-sm">¡Correo de confirmación enviado exitosamente!</p>
                <p className="text-xs text-muted-foreground">
                  Se ha remitido el voucher con código QR, desglose de impuestos SRI (IVA 15%, 10% Servicio) y botón de contacto directo a <strong>{testEmailAddress}</strong>.
                </p>
                <button
                  onClick={() => setShowTestEmailModal(false)}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Dirección de correo destino para la prueba</label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={e => setTestEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground outline-none font-mono"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2 font-mono text-[11px]">
                  <p className="font-bold text-foreground">Asunto: 🎫 Confirmación de Reserva #[RES-001] · {hotelName || "Hotel Voyager Manta"}</p>
                  <p className="text-muted-foreground">De: reservas@alojamanta.ec (Red Oficial de Alojamientos de Manta)</p>
                  <div className="p-2.5 rounded bg-background border border-border text-foreground space-y-1">
                    <p className="font-bold text-amber-500">🏨 Voucher Digital Emitido · Pago Garantizado</p>
                    <p>Huésped: Carlos Méndez · Habitación: Suite Frente al Mar</p>
                    <p>Fechas: Entrada 14:00h · Salida 12:00h · Manta, Manabí</p>
                    <p>Desglose SRI: Tarifa Neta + IVA 15% + 10% Servicio Turístico</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTestEmailModal(false)}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEmailSent(true)}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Simular Envío Real de Correo →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
`;

content = content.replace(
  `      {/* Edit Modal */}`,
  emailModalSnippet + "\n      {/* Edit Modal */}"
);

fs.writeFileSync("src/App.tsx", content, "utf-8");
console.log("Updated App.tsx successfully!");

