import sys

optimized_booking_modal = '''// ─── Booking modal (Intermediario Oficial de Reservas & Pagos Web) ─────────────

type BookingStep = "details" | "payment" | "invoice";

function BookingModal({
  hotel,
  room,
  params,
  user,
  onClose,
  onGuestLogin,
}: {
  hotel: Hotel;
  room: RoomOffer;
  params: SearchParams;
  user: GuestUser | null;
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
}) {
  const tx = useI18n();
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);

  // RF-04: Planes de Tarifa
  const [ratePlan, setRatePlan] = useState<"flexible" | "non_refundable" | "breakfast_plus">("flexible");
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
    city: "Manta",
    address: "",
    notes: "",
  });

  // Métodos de Pago Intermediario
  const [payMethod, setPayMethod] = useState<"card" | "payphone" | "deuna" | "transfer">("card");
  const [cardHolder, setCardHolder] = useState(user?.name ?? "");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [payphonePhone, setPayphonePhone] = useState("");

  const hotelMeta = HOTEL_COMMERCIAL_INFO[hotel.id] || HOTEL_COMMERCIAL_INFO["costa-sol"];
  const [resId] = useState(() => `RES-${Math.floor(Math.random() * 90000) + 10000}`);
  const [invoiceId] = useState(() => `${hotelMeta.estab || "001"}-${hotelMeta.ptoEmi || "001"}-${String(Math.floor(Math.random() * 900000) + 100000).padStart(9, "0")}`);
  const [issueDate] = useState(() => new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  const [verifyCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase());
  const last4 = cardNum.replace(/\\s/g, "").slice(-4) || "8890";

  const STEPS: { k: BookingStep; l: string }[] = [
    { k: "details", l: tx("1. Datos y Tarifa") },
    { k: "payment", l: tx("2. Pago Seguro") },
    { k: "invoice", l: tx("3. Voucher Oficial") },
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
    if (docType === "CEDULA" && form.dni.replace(/\\D/g, "").length !== 10) {
      setRequestError(tx("La cédula ecuatoriana debe tener 10 dígitos numéricos."));
      return;
    }
    if (docType === "RUC" && form.dni.replace(/\\D/g, "").length !== 13) {
      setRequestError(tx("El RUC ecuatoriano debe tener 13 dígitos numéricos."));
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
            ? "PayPhone Ecuador"
            : payMethod === "deuna"
            ? "DeUna Banco Pichincha"
            : payMethod === "transfer"
            ? "Transferencia Bancaria Directa"
            : "Tarjeta de Crédito / Débito (Pasarela AlojaManta)";

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
          paymentStatus: "paid",
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
          guestCity: form.city,
          guestCountry: form.country,
          guestAddress: form.address,
          payment: {
            amount: total,
            method: "Tarjeta externa",
            reference: `TXN-ALM-${Math.floor(Math.random() * 900000) + 100000}`,
            recordedAt: new Date().toISOString(),
            recordedBy: "Pasarela Web AlojaManta",
          },
        };

        const existing = guestReservationRepository.read() || [];
        guestReservationRepository.persist([newRes, ...existing]);
        consumeRoomAvailability(hotel.id, room);
        setSubmittedReservation(newRes);
        setStep("invoice");

        window.dispatchEvent(new Event(RESERVATIONS_CHANGED_EVENT));
        window.dispatchEvent(new CustomEvent("alojamanta-new-booking", { detail: newRes }));

        addAuditLog({
          usuario: guestFullName,
          rol: user ? "Huésped Registrado" : "Checkout Invitado",
          modulo: "Motor de Reservas Web",
          accion: "RESERVA_WEB_PAGADA",
          detalle: `Reserva ${resId} en ${hotel.name} (${room.type}, ${nights} noches) · Total USD $${total.toFixed(2)} liquidado vía intermediario AlojaManta (${ivaPct}% IVA, $2.50 tasa pernoctación)`,
        });
      } catch (err) {
        setRequestError(err instanceof Error ? err.message : "Error al procesar el pago");
      } finally {
        setProcessing(false);
      }
    }, 1200);
  }

  // ── Shared backdrop
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 border border-border bg-card"
        style={{ maxHeight: "94vh" }}
      >
        {/* Step indicator bar */}
        <div className="flex flex-shrink-0 border-b border-border bg-background/50">
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
          <div className="flex items-center gap-3 px-4 py-2.5 bg-background/80 border-b border-border shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
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
                        if (docType === "CEDULA" || docType === "RUC") val = val.replace(/\\D/g, "");
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

          {/* ── STEP 2: PAYMENT (Pasarela Intermediaria Ágil) ── */}
          {step === "payment" && (
            <form onSubmit={handleExecutePayment} className="space-y-3.5">
              <div className="rounded-xl border border-amber-300/80 bg-amber-500/10 p-2.5 text-xs text-foreground flex items-center gap-2">
                <span className="text-base shrink-0">🛡️</span>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  <strong className="text-foreground">{tx("Garantía AlojaManta:")}</strong> {tx("Cobro seguro como intermediario oficial. Tu voucher se emitirá inmediatamente al pagar.")}
                </p>
              </div>

              {/* Selector de Método de Pago */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { k: "card" as const, icon: "💳", name: tx("Tarjeta"), desc: "Visa/Mastercard" },
                  { k: "payphone" as const, icon: "📱", name: "PayPhone", desc: tx("Nacional") },
                  { k: "deuna" as const, icon: "📲", name: "DeUna", desc: "Pichincha" },
                  { k: "transfer" as const, icon: "🏦", name: tx("Transfer."), desc: tx("Directa") },
                ].map(pm => (
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

              {/* Formulario de Tarjeta */}
              {payMethod === "card" && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-muted-foreground">{tx("Datos de la tarjeta")}</span>
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
                        const v = e.target.value.replace(/\\D/g, "").slice(0, 16);
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
                          let v = e.target.value.replace(/\\D/g, "");
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
                        onChange={e => setCardCvv(e.target.value.replace(/\\D/g, ""))}
                        placeholder="CVV"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "payphone" && (
                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5 text-center">
                  <p className="font-bold text-xs text-foreground">{tx("PayPhone Ecuador")}</p>
                  <p className="text-[11px] text-muted-foreground">{tx("Ingresa tu número celular registrado en PayPhone:")}</p>
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
                  <p className="font-bold text-xs text-foreground">{tx("DeUna / Banco Pichincha")}</p>
                  <p className="text-[11px] text-muted-foreground">{tx("Se generará el código QR y código de pago instantáneo sin comisión.")}</p>
                </div>
              )}

              {payMethod === "transfer" && (
                <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
                  <p className="font-bold text-foreground">{tx("Cuenta Recaudadora AlojaManta:")}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">Banco Pichincha · Cta. Cte. 2100489100 · ALOJAMANTA S.A.S.</p>
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
            <div className="space-y-3.5">
              <div className="text-center py-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-1.5 shadow-xs">
                  ✓
                </div>
                <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("¡Pago Aprobado y Reserva Confirmada!")}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {tx("Voucher Oficial emitido por AlojaManta · Cupo garantizado")}
                </p>
              </div>

              {/* Voucher Card */}
              <div className="rounded-2xl border border-border overflow-hidden shadow-md bg-card">
                <div className="px-4 py-3 bg-slate-950 text-white flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-amber-400" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {hotelMeta.nombreComercial || hotel.name}
                      </p>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {tx("PAGADO")}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">{hotelMeta.razonSocial}</p>
                    <p className="text-[9px] text-slate-400 font-mono">RUC: {hotelMeta.ruc} · Manta, Ecuador</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tx("VOUCHER")}
                    </span>
                    <p className="font-bold mt-0.5 text-slate-200 text-[11px]">{invoiceId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border text-xs">
                  <div className="p-2.5 bg-card">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">{tx("Huésped titular")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate">{form.name || user?.name || "Huésped Titular"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{docType}: {form.dni}</p>
                  </div>
                  <div className="p-2.5 bg-card">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">{tx("Estancia")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate">{tx(room.type)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)} ({nights}n)</p>
                  </div>
                </div>

                <div className="p-2.5 bg-background border-t border-border space-y-0.5 text-xs font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({nights}n):</span>
                    <span>US${base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{ivaPct}% IVA + 10% Serv.:</span>
                    <span>US${(iva + servicio).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tasa Pernoctación (GAD Manta):</span>
                    <span>US${tasaPernoctacion.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border font-bold text-foreground">
                    <span>TOTAL PAGADO:</span>
                    <span className="text-amber-500">US${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="px-3 py-2 bg-muted/40 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-muted-foreground block">{tx("Código de Reserva")}</span>
                    <span className="font-mono font-bold text-xs text-foreground">{resId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold text-muted-foreground block">{tx("PIN de Seguridad")}</span>
                    <span className="font-mono font-bold text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                      PIN: {verifyCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp Directo */}
              <a
                href={buildWhatsAppUrl(hotel.phone, hotel.name, resId, form.name, params.checkIn, params.checkOut, room.type)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>📲</span>
                <span>{tx("Enviar Voucher y Coordinar Llegada por WhatsApp")}</span>
              </a>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  {tx("Cerrar")}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
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
          <div className="p-3 sm:p-4 bg-background border-t border-border flex items-center justify-between gap-3 shrink-0 shadow-lg">
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
                      <span>🔒</span>
                      <span>{tx("Pagar")} US${total.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'''

with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = '// ─── Booking modal (Intermediario Oficial de Reservas & Pagos Web) ─────────────'
end_marker = '// ─── Hotel card ───────────────────────────────────────────────────────────────'

idx1 = code.find(start_marker)
idx2 = code.find(end_marker)

if idx1 == -1 or idx2 == -1:
    print(f'Error: markers not found. idx1={idx1}, idx2={idx2}')
    sys.exit(1)

new_code = code[:idx1] + optimized_booking_modal + '\n\n' + code[idx2:]

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print('Successfully applied zero-bottleneck BookingModal!')
