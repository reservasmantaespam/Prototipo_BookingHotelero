import sys

new_booking_modal = '''// ─── Booking modal (Intermediario Oficial de Reservas & Pagos Web) ─────────────

type BookingStep = "auth" | "details" | "payment" | "invoice";

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

  const initialStep: BookingStep = user ? "details" : "auth";
  const [step, setStep] = useState<BookingStep>(initialStep);
  const [processing, setProcessing] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [submittedReservation, setSubmittedReservation] = useState<MyReservation | null>(null);

  // Auth sub-state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authError, setAuthError] = useState("");

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

  const STEPS: { k: BookingStep; l: string }[] = user
    ? [{ k: "details", l: tx("1. Datos y Tarifa") }, { k: "payment", l: tx("2. Pago Seguro") }, { k: "invoice", l: tx("3. Voucher Oficial") }]
    : [{ k: "auth", l: tx("1. Acceso / Invitado") }, { k: "details", l: tx("2. Datos y Tarifa") }, { k: "payment", l: tx("3. Pago Seguro") }, { k: "invoice", l: tx("4. Voucher Oficial") }];

  const stepIndex = STEPS.findIndex(s => s.k === step);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!authEmail || !authPass) { setAuthError(tx("Completa todos los campos.")); return; }
    if (authMode === "register" && !authName) { setAuthError(tx("Indica tu nombre.")); return; }
    const u: GuestUser = { name: authMode === "register" ? authName : authEmail.split("@")[0], email: authEmail };
    onGuestLogin(u);
    setForm(f => ({ ...f, name: u.name, email: u.email }));
    setCardHolder(u.name);
    setAuthError("");
    setStep("details");
  }

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
      setRequestError(tx("La cédula ecuatoriana debe tener 10 dígitos."));
      return;
    }
    if (docType === "RUC" && form.dni.replace(/\\D/g, "").length !== 13) {
      setRequestError(tx("El RUC ecuatoriano debe tener 13 dígitos."));
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

  function handleExecutePayment(e: React.FormEvent) {
    e.preventDefault();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{ background: "var(--card)", maxHeight: "94vh" }}
      >
        {/* Step bar */}
        <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = s.k === step;
            return (
              <div
                key={s.k}
                className="flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wide transition-all"
                style={{
                  background: active ? "#fef3c7" : "var(--background)",
                  color: active ? "#92400e" : done ? "#059669" : "var(--muted-foreground)",
                  borderBottom: active ? "2px solid #f59e0b" : "2px solid transparent",
                }}
              >
                {done ? "✓ " : ""}
                {s.l}
              </div>
            );
          })}
        </div>

        {/* Room strip (visible on auth, details and payment) */}
        {step !== "invoice" && (
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0 bg-background/80 border-b border-border"
          >
            <img src={room.image} alt={tx(room.type)} className="w-14 h-10 rounded-lg object-cover flex-shrink-0 shadow-xs" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm truncate">{hotel.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {tx(room.type)} · {nights}n · {fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm text-amber-500">{fmt(total)}</p>
              <p className="text-[10px] text-muted-foreground">{tx("Total con tasas")}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs bg-muted hover:bg-slate-200 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ── STEP: AUTH ── */}
          {step === "auth" && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="font-bold text-foreground text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {authMode === "login" ? tx("Inicia sesión o reserva como invitado") : tx("Crea tu cuenta gratis")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tx("Accede con tu cuenta o reserva directamente sin necesidad de registrarte")}
                </p>
              </div>

              {/* Guest Checkout Directo */}
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-sm"
              >
                <span>⚡</span>
                <span>{tx("Continuar como invitado")}</span>
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {tx("o accede con tu cuenta")}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex rounded-xl overflow-hidden border border-border">
                {[{ k: "login" as const, l: tx("Iniciar sesión") }, { k: "register" as const, l: tx("Registrarme") }].map(m => (
                  <button
                    key={m.k}
                    onClick={() => setAuthMode(m.k)}
                    className="flex-1 py-2 text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: authMode === m.k ? "#f59e0b" : "var(--background)",
                      color: authMode === m.k ? "#0c1220" : "var(--muted-foreground)",
                    }}
                  >
                    {m.l}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{tx("Nombre completo")}</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="María García"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="maria@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{tx("Contraseña")}</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={authPass}
                    onChange={e => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {authError && (
                  <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">{authError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                >
                  {authMode === "login" ? tx("Entrar y continuar →") : tx("Crear cuenta y continuar →")}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <span>📋</span>
                <span>{tx("1. Datos del huésped titular")}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {tx("Nombre completo del titular *")}
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500 bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={tx("Ej: Carlos Mendoza")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {tx("Email para voucher y confirmación *")}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500 bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="cliente@correo.ec"
                    required
                  />
                </div>
              </div>

              {/* Documento Ecuatoriano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-background border border-border">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{tx("Tipo de Documento *")}</label>
                  <select
                    value={docType}
                    onChange={e => {
                      const t = e.target.value as "CEDULA" | "RUC" | "PASAPORTE";
                      setDocType(t);
                      setForm(f => ({ ...f, dni: "" }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-xs font-semibold outline-none bg-card text-foreground cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="CEDULA">{tx("Cédula de Identidad (10 dígitos)")}</option>
                    <option value="RUC">{tx("RUC (13 dígitos / Empresa)")}</option>
                    <option value="PASAPORTE">{tx("Pasaporte Internacional")}</option>
                  </select>
                </div>

                <div className={docType === "RUC" ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {docType === "CEDULA" && tx("Cédula de Identidad (10 dígitos) *")}
                    {docType === "RUC" && tx("Número de RUC (13 dígitos) *")}
                    {docType === "PASAPORTE" && tx("Número de Pasaporte (Alfanumérico) *")}
                  </label>
                  <input
                    type="text"
                    maxLength={docType === "CEDULA" ? 10 : docType === "RUC" ? 13 : 20}
                    value={form.dni}
                    onChange={e => {
                      let val = e.target.value;
                      if (docType === "CEDULA" || docType === "RUC") {
                        val = val.replace(/\\D/g, "");
                      } else {
                        val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                      }
                      setForm({ ...form, dni: val });
                    }}
                    placeholder={docType === "CEDULA" ? "1314589201" : docType === "RUC" ? "1391789456001" : "A14892015"}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-card text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                </div>

                {docType === "RUC" && (
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {tx("Razón Social o Nombre de Empresa *")}
                    </label>
                    <input
                      type="text"
                      value={form.razonSocial}
                      onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                      placeholder="Ej: IMPORTADORA DEL PACIFICO S.A.S."
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-card text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Teléfono, Ciudad y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("Teléfono / WhatsApp *")}</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+593 98 421 8890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("País")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    placeholder="Ecuador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("Ciudad")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="Manta, Guayaquil, Quito..."
                  />
                </div>
              </div>

              {/* Selección de Plan de Tarifa */}
              <div className="rounded-xl border p-3.5 bg-background/70 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{tx("2. Plan de tarifa")}</span>
                  <span className="text-[10px] font-mono text-amber-600 font-bold">{fmt(effectiveNightlyRate)} / noche</span>
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "flexible" ? "bg-amber-50 border-amber-400 text-foreground font-semibold" : "bg-card border-border text-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "flexible"} onChange={() => setRatePlan("flexible")} className="accent-amber-500" />
                      <div>
                        <p className="font-bold text-foreground">{tx("Tarifa Estándar Flexible (Reembolsable 48h)")}</p>
                        <p className="text-[10px] text-muted-foreground">{tx("Cancelación gratuita hasta 48h antes del check-in")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground">{fmt(room.pricePerNight)}/n</span>
                  </label>

                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "non_refundable" ? "bg-emerald-50 border-emerald-400 text-foreground font-semibold" : "bg-card border-border text-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "non_refundable"} onChange={() => setRatePlan("non_refundable")} className="accent-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-800">{tx("Tarifa Promocional No Reembolsable (-10%)")}</p>
                        <p className="text-[10px] text-muted-foreground">{tx("10% de descuento inmediato · Pago no reembolsable")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{fmt(Math.round(room.pricePerNight * 0.90 * 100) / 100)}/n</span>
                  </label>

                  {!room.breakfastIncluded && (
                    <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "breakfast_plus" ? "bg-amber-50 border-amber-400 text-foreground font-semibold" : "bg-card border-border text-muted-foreground"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="ratePlan" checked={ratePlan === "breakfast_plus"} onChange={() => setRatePlan("breakfast_plus")} className="accent-amber-500" />
                        <div>
                          <p className="font-bold text-foreground">{tx("Plan con Desayuno Incluido (+$8/noche)")}</p>
                          <p className="text-[10px] text-muted-foreground">{tx("Incluye desayuno completo buffet o manabita")}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-foreground">{fmt(room.pricePerNight + 8)}/n</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Extras y Servicios Adicionales */}
              <div className="rounded-xl border p-3.5 bg-background/70 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{tx("3. Servicios adicionales")}</span>
                  {extrasTotal > 0 && <span className="text-[10px] font-mono font-bold text-emerald-700">+{fmt(extrasTotal)}</span>}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { k: "airport" as const, label: tx("Traslado Aeropuerto Manta (MEC)"), price: "+$15.00" },
                    { k: "extrabed" as const, label: tx("Cama supletoria adicional"), price: "+$20.00" },
                    { k: "crib" as const, label: tx("Cuna para bebé sujeta a cupo"), price: tx("Cortesía $0") },
                    { k: "lateout" as const, label: tx("Salida extendida (hasta 16:00h)"), price: "+$15.00" },
                  ].map(ext => (
                    <label key={ext.k} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${selectedExtras[ext.k] ? "bg-amber-50 border-amber-400" : "bg-card border-border"}`}>
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <input
                          type="checkbox"
                          checked={selectedExtras[ext.k]}
                          onChange={e => setSelectedExtras(s => ({ ...s, [ext.k]: e.target.checked }))}
                          className="accent-amber-500 rounded"
                        />
                        {ext.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">{ext.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">{tx("Observaciones o requerimientos especiales")}</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none bg-background text-foreground"
                  style={{ borderColor: "var(--border)" }}
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ej: Llegada en vuelo de la tarde, cama king alta..."
                />
              </div>

              {/* Desglose de Precios Booking */}
              <PriceBreakdownBox
                basePrice={base / nights}
                nights={nights}
                hasService10={hasService}
                hotelName={hotel.name}
                defaultExpanded={true}
                showToggle={true}
              />

              {requestError && (
                <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">{requestError}</p>
              )}

              <div className="flex gap-2 pt-2">
                {!user && (
                  <button
                    onClick={() => setStep("auth")}
                    className="px-4 py-3 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    {tx("← Atrás")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{tx("Continuar al Pago Seguro →")}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: PAYMENT (Intermediario Oficial de Cobros) ── */}
          {step === "payment" && (
            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="font-bold text-foreground text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("Pago Seguro con Pasarela Intermediaria")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tx("AlojaManta procesa tu pago de forma segura y garantiza tu habitación con el hotel")}
                </p>
              </div>

              {/* Banner Intermediario */}
              <div className="rounded-xl border border-amber-300/80 bg-amber-500/10 p-3 text-xs text-foreground flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-lg shrink-0 font-bold">
                  🛡️
                </div>
                <div>
                  <p className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                    {tx("Garantía de Reserva Intermediaria")}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {tx("Tu pago se custodia de forma segura bajo cifrado SSL y estándares SRI. Recibirás tu confirmación y voucher inmediatamente.")}
                  </p>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {tx("Elige tu método de pago")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { k: "card" as const, icon: "💳", name: tx("Tarjeta"), desc: "Visa/Mastercard" },
                    { k: "payphone" as const, icon: "📱", name: "PayPhone", desc: tx("App / Tarjetas") },
                    { k: "deuna" as const, icon: "📲", name: "DeUna", desc: "Pichincha Móvil" },
                    { k: "transfer" as const, icon: "🏦", name: tx("Transfer."), desc: tx("Bancaria Directa") },
                  ].map(pm => (
                    <button
                      key={pm.k}
                      type="button"
                      onClick={() => setPayMethod(pm.k)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        payMethod === pm.k
                          ? "bg-amber-50 dark:bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm font-bold ring-2 ring-amber-500/30"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      <span className="text-xs font-bold leading-tight">{pm.name}</span>
                      <span className="text-[9px] text-muted-foreground">{pm.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de Tarjeta */}
              {payMethod === "card" && (
                <div className="space-y-3">
                  {/* Tarjeta Visual */}
                  <div
                    className="relative rounded-2xl p-4 overflow-hidden text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", minHeight: 130 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-8 h-5 rounded-sm bg-gradient-to-r from-amber-400 to-amber-600 shadow-xs" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300">VISA / MASTERCARD</span>
                    </div>
                    <p className="font-mono text-base tracking-widest mb-3">
                      {cardNum ? cardNum : "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex items-end justify-between text-xs">
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-400">{tx("Titular")}</p>
                        <p className="font-semibold uppercase tracking-wider truncate max-w-[180px]">{cardHolder || form.name || "NOMBRE DEL TITULAR"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-wider text-slate-400">{tx("Expira")}</p>
                        <p className="font-mono font-semibold">{cardExp || "MM/AA"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botón Llenar Datos Demo */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡</span>
                      <span>{tx("Usar tarjeta de prueba (Demo)")}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("Nombre del titular de la tarjeta *")}</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none uppercase bg-background text-foreground"
                      style={{ borderColor: "var(--border)" }}
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="CARLOS MENDEZ"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("Número de tarjeta *")}</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-background text-foreground"
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
                    </div>
                    <div className="grid grid-cols-2 gap-2 col-span-2 sm:col-span-1">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("Expira (MM/AA)")}</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-background text-foreground"
                          style={{ borderColor: "var(--border)" }}
                          maxLength={5}
                          value={cardExp}
                          onChange={e => {
                            let v = e.target.value.replace(/\\D/g, "");
                            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                            setCardExp(v);
                          }}
                          placeholder="12/28"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">{tx("CVV")}</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-background text-foreground"
                          style={{ borderColor: "var(--border)" }}
                          maxLength={4}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\\D/g, ""))}
                          placeholder="889"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPhone */}
              {payMethod === "payphone" && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl font-bold">
                    📱
                  </div>
                  <p className="font-bold text-xs text-foreground">{tx("Cobro directo con PayPhone Ecuador")}</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    {tx("Se enviará una solicitud de cobro instantánea a tu app PayPhone o podrás ingresar cualquier tarjeta de crédito/débito nacional.")}
                  </p>
                  <input
                    type="tel"
                    value={payphonePhone}
                    onChange={e => setPayphonePhone(e.target.value)}
                    placeholder="Número registrado en PayPhone (Ej: 0984218890)"
                    className="w-full px-3 py-2 rounded-lg border text-xs font-mono bg-card text-foreground text-center"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              )}

              {/* DeUna */}
              {payMethod === "deuna" && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    📲
                  </div>
                  <p className="font-bold text-xs text-foreground">{tx("Transferencia Directa DeUna / Banco Pichincha")}</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    {tx("Al confirmar, se generará el código QR y número de referencia para acreditar tu estancia en segundos sin comisiones bancarias.")}
                  </p>
                </div>
              )}

              {/* Transferencia Directa */}
              {payMethod === "transfer" && (
                <div className="p-4 rounded-xl border border-border bg-background space-y-2 text-xs">
                  <p className="font-bold text-foreground">{tx("Datos de la Cuenta Recaudadora AlojaManta:")}</p>
                  <div className="p-2.5 rounded-lg bg-muted/60 space-y-1 font-mono text-[11px]">
                    <p><strong>Banco:</strong> Banco Pichincha (Cta. Corriente)</p>
                    <p><strong>Titular:</strong> ALOJAMANTA S.A.S. (Intermediario)</p>
                    <p><strong>RUC:</strong> 1391789456001</p>
                    <p><strong>Email:</strong> pagos@alojamanta.ec</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {tx("Tu cupo queda apartado inmediatamente. Deberás subir tu comprobante antes del check-in.")}
                  </p>
                </div>
              )}

              {/* Resumen Total a Pagar */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{tx("Subtotal")} ({nights} {nights > 1 ? tx("noches") : tx("noche")}):</span>
                  <span className="font-mono">US${base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{ivaPct}% IVA:</span>
                  <span className="font-mono">US${iva.toFixed(2)}</span>
                </div>
                {hasService && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>10% Servicio Turístico:</span>
                    <span className="font-mono">US${servicio.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tasa Pernoctación Turística (GAD Manta):</span>
                  <span className="font-mono">US${tasaPernoctacion.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border font-bold text-sm text-foreground">
                  <span>{tx("Total a Pagar")}:</span>
                  <span className="font-mono text-base text-amber-500">US${total.toFixed(2)}</span>
                </div>
              </div>

              {requestError && (
                <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">{requestError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="px-4 py-3 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  {tx("← Volver a Datos")}
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{tx("Procesando pago seguro...")}</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>
                        {tx("Pagar")} US${total.toFixed(2)} {tx("y Confirmar Reserva →")}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP: INVOICE / VOUCHER (Confirmación Oficial) ── */}
          {step === "invoice" && (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-2 shadow-xs">
                  ✓
                </div>
                <h3 className="font-bold text-foreground text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("¡Pago aprobado y reserva confirmada!")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tx("Voucher Oficial emitido por AlojaManta · Cupo garantizado")}
                </p>
              </div>

              {/* Tarjeta de Voucher Digital Oficial */}
              <div className="rounded-2xl border border-border overflow-hidden shadow-lg bg-card">
                {/* Cabecera Establecimiento */}
                <div className="px-4 py-3.5 bg-slate-950 text-white flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-amber-400" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {hotelMeta.nombreComercial || hotel.name}
                      </p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {tx("PAGADO")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{hotelMeta.razonSocial}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      RUC: {hotelMeta.ruc} · {hotelMeta.city}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tx("VOUCHER SRI")}
                    </span>
                    <p className="font-bold mt-1 text-slate-200 text-xs">{invoiceId}</p>
                    <p className="text-[9px] text-slate-400">{issueDate}</p>
                  </div>
                </div>

                {/* Banner de Garantía Intermediaria */}
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200/80 text-[11px] text-amber-900 dark:text-amber-200">
                  <p className="font-bold">{tx("Intermediación Oficial AlojaManta:")}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {tx("Tu estancia se encuentra confirmada y liquidada. Presenta este comprobante digital o tu código en recepción.")}
                  </p>
                </div>

                {/* Datos del Huésped & Estancia */}
                <div className="grid grid-cols-2 gap-px bg-border text-xs">
                  <div className="p-3 bg-card">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{tx("Huésped titular")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5">{form.name || user?.name || "Huésped Titular"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{docType}: {form.dni}</p>
                    <p className="text-[10px] text-muted-foreground">{form.email}</p>
                  </div>
                  <div className="p-3 bg-card">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{tx("Estancia y Cupo")}</p>
                    <p className="font-bold text-foreground text-xs mt-0.5">{tx(room.type)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)} ({nights} {nights > 1 ? tx("noches") : tx("noche")})
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {params.adults} {params.adults > 1 ? tx("adultos") : tx("adulto")}
                    </p>
                  </div>
                </div>

                {/* Tabla de Liquidación Fiscal */}
                <div className="p-3 bg-background border-t border-border space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tx("Subtotal Neto")} ({nights}n):</span>
                    <span>US${base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{ivaPct}% IVA:</span>
                    <span>US${iva.toFixed(2)}</span>
                  </div>
                  {hasService && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>10% Servicio Turístico:</span>
                      <span>US${servicio.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tasa Pernoctación Turística (GAD Manta):</span>
                    <span>US${tasaPernoctacion.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border font-bold text-foreground text-sm">
                    <span>{tx("TOTAL LIQUIDADO")}:</span>
                    <span className="text-amber-500">US${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Código de Confirmación y PIN */}
                <div className="px-4 py-2.5 bg-muted/50 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">{tx("Código de Reserva")}</span>
                    <span className="font-mono font-bold text-sm text-foreground tracking-wider">{resId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">{tx("PIN de Seguridad")}</span>
                    <span className="font-mono font-bold text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                      PIN: {verifyCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  {tx("Cerrar")}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>⬇</span>
                  <span>{tx("Descargar Voucher PDF")}</span>
                </button>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                {tx("Comprobante enviado a")} <strong>{form.email || user?.email}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'''

with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = '// ─── Booking modal ───────────────────────────────────────────────────────────'
end_marker = '// ─── Hotel card ───────────────────────────────────────────────────────────────'

idx1 = code.find(start_marker)
idx2 = code.find(end_marker)

if idx1 == -1 or idx2 == -1:
    print(f'Error: markers not found. idx1={idx1}, idx2={idx2}')
    sys.exit(1)

new_code = code[:idx1] + new_booking_modal + '\n\n' + code[idx2:]

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print('Successfully replaced BookingModal in src/GuestPage.tsx!')
