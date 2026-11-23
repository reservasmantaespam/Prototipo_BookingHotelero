// ─── Booking modal ────────────────────────────────────────────────────────────

type BookingStep = "auth" | "details" | "payment" | "invoice";

function BookingModal({
  hotel,
  room,
  params,
  user,
  onClose,
  onGuestLogin,
  onReservationCreated,
}: {
  hotel: Hotel;
  room: RoomOffer;
  params: SearchParams;
  user: GuestUser | null;
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
  onReservationCreated?: (r: MyReservation) => void;
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
  const total = parseFloat((base + iva + servicio).toFixed(2));

  const initialStep: BookingStep = user ? "details" : "auth";
  const [step, setStep] = useState<BookingStep>(initialStep);
  const [processing, setProcessing] = useState(false);

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

  // Card
  const [cardHolder, setCardHolder] = useState(user?.name ?? "");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const hotelMeta = HOTEL_COMMERCIAL_INFO[hotel.id] || HOTEL_COMMERCIAL_INFO["costa-sol"];
  const [resId] = useState(`RES-${Math.floor(Math.random() * 90000) + 10000}`);
  const [invoiceId] = useState(`${hotelMeta.estab}-${hotelMeta.ptoEmi}-${String(Math.floor(Math.random() * 900000) + 100000).padStart(9, "0")}`);
  const issueDate = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const verifyCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  const last4 = cardNum.replace(/\s/g, "").slice(-4) || "****";

  const STEPS: { k: BookingStep; l: string }[] = user
    ? [{ k: "details", l: tx("1. Datos y Tarifa") }, { k: "payment", l: tx("2. Pago Seguro") }, { k: "invoice", l: tx("3. Voucher de Reserva") }]
    : [{ k: "auth", l: tx("1. Acceso / Invitado") }, { k: "details", l: tx("2. Datos y Tarifa") }, { k: "payment", l: tx("3. Pago Seguro") }, { k: "invoice", l: tx("4. Voucher de Reserva") }];

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

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!cardNum || !cardExp || !cardCvv || !cardHolder) return;
    if (getRoomAvailability(hotel.id, room) <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("invoice");
      playNewBookingSound();
      const guestFullName = form.name || cardHolder || "Huésped Invitado";
      addAuditLog({
        usuario: guestFullName,
        rol: user ? "Huésped Registrado" : "Checkout Invitado",
        modulo: "Motor de Reservas Web",
        accion: "RESERVA_WEB_CONFIRMADA",
        detalle: `Reserva ${resId} en ${hotel.name} (${room.type}, ${nights} noches) · Plan: ${ratePlan} · Total USD $${total.toFixed(2)} (IVA ${ivaPct}%)`,
      });
      const newRes: MyReservation = {
        id: resId,
        hotel: hotel.name,
        hotelId: hotel.id,
        city: hotel.city,
        room: room.type,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
        total,
        status: "upcoming",
        image: room.image || hotel.image,
        guestName: guestFullName,
        guestEmail: form.email || user?.email || "invitado@alojamanta.ec",
        guestPhone: form.phone || "+593 98 421 8890",
        payMethod: "Tarjeta Digital (PayPhone / Kushki)",
      };
      consumeRoomAvailability(hotel.id, room);
      onReservationCreated?.(newRes);
      window.dispatchEvent(new CustomEvent("alojamanta-new-booking", { detail: newRes }));
    }, 1500);
  }

  // ── Shared backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "var(--card)", maxHeight: "92vh" }}>

        {/* Step bar */}
        <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid #e2e8f0" }}>
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = s.k === step;
            return (
              <div key={s.k} className="flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wide transition-all"
                style={{ background: active ? "#fef3c7" : "var(--background)", color: active ? "#92400e" : done ? "#059669" : "var(--muted-foreground)", borderBottom: active ? "2px solid #f59e0b" : "2px solid transparent" }}>
                {done ? "✓ " : ""}{s.l}
              </div>
            );
          })}
        </div>

        {/* Room strip (not on invoice) */}
        {step !== "invoice" && (
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "var(--background)", borderBottom: "1px solid #e2e8f0" }}>
            <img src={room.image} alt={tx(room.type)} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm truncate">{hotel.name}</p>
              <p className="text-xs ttext-muted-foreground">{tx(room.type)} · {nights}n · {fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm" style={{ color: "#f59e0b" }}>{fmt(total)}</p>
              <p className="text-[10px] ttext-muted-foreground">{tx("IVA incl.")}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ background: "var(--border)", color: "var(--muted-foreground)" }}>✕</button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── STEP: AUTH ── */}
          {step === "auth" && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="font-bold text-foreground text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {authMode === "login" ? tx("Inicia sesión o reserva como invitado") : tx("Crea tu cuenta gratis")}
                </h3>
                <p className="text-xs ttext-muted-foreground mt-1">{tx("Accede con tu cuenta o reserva directamente sin necesidad de registrarte")}</p>
              </div>

              {/* Guest Checkout */}
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-sm"
              >
                <span>{tx("Continuar como invitado")}</span>
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[11px] ttext-muted-foreground uppercase font-semibold">{tx("o accede con tu cuenta")}</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                {[{ k: "login" as const, l: tx("Iniciar sesión") }, { k: "register" as const, l: tx("Registrarme") }].map(m => (
                  <button key={m.k} onClick={() => setAuthMode(m.k)} className="flex-1 py-2 text-sm font-semibold transition-all" style={{ background: authMode === m.k ? "#f59e0b" : "var(--background)", color: authMode === m.k ? "#0c1220" : "var(--muted-foreground)" }}>{m.l}</button>
                ))}
              </div>
              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs ttext-muted-foreground mb-1">{tx("Nombre completo")}</label>
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", color: "#1e293b" }} value={authName} onChange={e => setAuthName(e.target.value)} placeholder="María García" />
                  </div>
                )}
                <div>
                  <label className="block text-xs ttext-muted-foreground mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", color: "#1e293b" }} value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="maria@email.com" />
                </div>
                <div>
                  <label className="block text-xs ttext-muted-foreground mb-1">{tx("Contraseña")}</label>
                  <input type="password" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", color: "#1e293b" }} value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="••••••••" />
                </div>
                {authError && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fee2e2", color: "#ef4444" }}>{authError}</p>}
                <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  {authMode === "login" ? tx("Entrar y continuar →") : tx("Crear cuenta y continuar →")}
                </button>
              </form>
              <button onClick={() => { const u = { name: "Usuario Google", email: "usuario@gmail.com" }; onGuestLogin(u); setForm(f => ({ ...f, ...u })); setCardHolder(u.name); setStep("details"); }} className="w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 hover:bg-background transition-colors" style={{ borderColor: "var(--border)", color: "#475569" }}>
                <span>{tx("Continuar con Google")}</span>
              </button>
            </div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{tx("1. Datos del huésped titular")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("Nombre completo del titular *")}</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={tx("Ej: Carlos Mendoza")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("Email para voucher y confirmación *")}</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="cliente@correo.ec"
                    required
                  />
                </div>
              </div>

              {/* Selector dinámico de Tipo de Documento */}
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
                    className="w-full px-3 py-2 rounded-lg border text-xs font-semibold outline-none bg-card cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="CEDULA">{tx("Cédula de Identidad (10 dígitos)")}</option>
                    <option value="RUC">{tx("RUC (13 dígitos / Empresa)")}</option>
                    <option value="PASAPORTE">{tx("Pasaporte Internacional (Alfanumérico)")}</option>
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
                        val = val.replace(/\D/g, "");
                      } else {
                        val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                      }
                      setForm({ ...form, dni: val });
                    }}
                    placeholder={docType === "CEDULA" ? "1314589201" : docType === "RUC" ? "1391789456001" : "A14892015"}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-card"
                    style={{ borderColor: "var(--border)" }}
                    required
                  />
                  {docType === "CEDULA" && form.dni.length > 0 && form.dni.length !== 10 && (
                    <p className="text-[10px] text-amber-600 mt-0.5">{tx("La cédula debe contener exactamente 10 dígitos numéricos.")}</p>
                  )}
                  {docType === "RUC" && form.dni.length > 0 && form.dni.length !== 13 && (
                    <p className="text-[10px] text-amber-600 mt-0.5">{tx("El RUC ecuatoriano debe tener 13 dígitos numéricos (termina en 001).")}</p>
                  )}
                </div>

                {docType === "RUC" && (
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-xs font-semibold text-foreground mb-1">{tx("Razón Social o Nombre de Empresa *")}</label>
                    <input
                      type="text"
                      value={form.razonSocial}
                      onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                      placeholder="Ej: IMPORTADORA DEL PACIFICO S.A.S."
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-card"
                      style={{ borderColor: "var(--border)" }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Teléfono, País, Ciudad y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("Teléfono / WhatsApp *")}</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+593 98 421 8890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("País")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    placeholder="Ecuador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("Ciudad")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="Manta, Portoviejo, Quito..."
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold ttext-muted-foreground mb-1">{tx("Dirección domiciliaria o fiscal")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--border)", color: "#1e293b" }}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Av. 4 de Noviembre y Calle 114, Manta"
                  />
                </div>
              </div>

              {/* Selección de Plan de Tarifa */}
              <div className="rounded-xl border p-3.5 bg-background/70 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider ttext-muted-foreground flex items-center justify-between">
                  <span>{tx("2. Plan de tarifa")}</span>
                  <span className="text-[10px] font-mono text-amber-700">{fmt(effectiveNightlyRate)} / noche</span>
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "flexible" ? "bg-amber-50 border-amber-400 text-foreground font-semibold" : "bg-card border-border ttext-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "flexible"} onChange={() => setRatePlan("flexible")} className="accent-amber-500" />
                      <div>
                        <p className="font-bold text-foreground">{tx("Tarifa Estándar Flexible (Reembolsable 48h)")}</p>
                        <p className="text-[10px] ttext-muted-foreground">{tx("Cancelación gratuita hasta 48h antes de la Fecha de Entrada")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground">{fmt(room.pricePerNight)}/n</span>
                  </label>

                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "non_refundable" ? "bg-emerald-50 border-emerald-400 text-foreground font-semibold" : "bg-card border-border ttext-muted-foreground"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "non_refundable"} onChange={() => setRatePlan("non_refundable")} className="accent-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-800">{tx("Tarifa Promocional No Reembolsable (-10%)")}</p>
                        <p className="text-[10px] ttext-muted-foreground">{tx("10% de descuento inmediato · Pago final sin reembolso")}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{fmt(Math.round(room.pricePerNight * 0.90 * 100) / 100)}/n</span>
                  </label>

                  {!room.breakfastIncluded && (
                    <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "breakfast_plus" ? "bg-amber-50 border-amber-400 text-foreground font-semibold" : "bg-card border-border ttext-muted-foreground"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="ratePlan" checked={ratePlan === "breakfast_plus"} onChange={() => setRatePlan("breakfast_plus")} className="accent-amber-500" />
                        <div>
                          <p className="font-bold text-foreground">{tx("Plan con Desayuno Manabita Incluido (+$8/noche)")}</p>
                          <p className="text-[10px] ttext-muted-foreground">{tx("Incluye desayuno costero completo y cancelación flexible")}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-foreground">{fmt(room.pricePerNight + 8)}/n</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Extras y Servicios Adicionales */}
              <div className="rounded-xl border p-3.5 bg-background/70 space-y-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider ttext-muted-foreground flex items-center justify-between">
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
                      <span className="font-mono text-[11px] font-bold ttext-muted-foreground">{ext.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs ttext-muted-foreground mb-1">{tx("Observaciones o hora estimada de arribo")}</label>
                <textarea className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: "var(--border)", color: "#1e293b" }} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ej: Llegada en vuelo de las 15:30, preferencia piso alto..." />
              </div>

              {/* Desglose estilo Booking.com */}
              <PriceBreakdownBox
                basePrice={base / nights}
                nights={nights}
                hasService10={hasService}
                hotelName={hotel.name}
                defaultExpanded={true}
                showToggle={true}
              />
              <div className="flex gap-2">
                {!user && <button onClick={() => setStep("auth")} className="px-4 py-3 rounded-xl text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{tx("← Atrás")}</button>}
                <button onClick={() => setStep("payment")} className="flex-1 py-3 rounded-xl font-bold text-sm hover:opacity-90" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  {tx("Continuar al pago seguro →")}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: PAYMENT ── */}
          {step === "payment" && (
            <form onSubmit={handlePay} className="space-y-4">
              <h3 className="font-bold text-foreground">{tx("Pago con tarjeta")}</h3>
              {/* Visual card */}
              <div className="relative rounded-2xl p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", minHeight: 140 }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 60%)" }} />
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-0.5">
                    <div className="w-8 h-5 rounded-sm opacity-80" style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)" }} />
                  </div>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">VISA / MASTERCARD</span>
                </div>
                <p className="font-mono text-white text-lg tracking-widest mb-3">
                  {cardNum ? cardNum.padEnd(19, " ").replace(/ /g, " ") : "•••• •••• •••• ••••"}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-widest">{tx("Titular")}</p>
                    <p className="text-white text-sm font-medium truncate max-w-[180px]">{cardHolder || tx("NOMBRE APELLIDOS")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest">{tx("Vence")}</p>
                    <p className="text-white text-sm font-mono">{cardExp || "MM/AA"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs ttext-muted-foreground mb-1">{tx("Titular de la tarjeta")}</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none uppercase" style={{ borderColor: "var(--border)", color: "#1e293b" }} value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} placeholder={tx("NOMBRE APELLIDOS")} required />
                </div>
                <div>
                  <label className="block text-xs ttext-muted-foreground mb-1">{tx("Número de tarjeta")}</label>
                  <div className="relative">
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono pr-16" style={{ borderColor: "var(--border)", color: "#1e293b" }}
                      value={cardNum}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNum(raw.replace(/(\d{4})/g, "$1 ").trim());
                      }}
                      placeholder="4242 4242 4242 4242" maxLength={19} required />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-5 h-3 rounded-sm opacity-70" style={{ background: "#ef4444" }} />
                      <div className="w-5 h-3 rounded-sm opacity-70 -ml-2" style={{ background: "#f59e0b" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs ttext-muted-foreground mb-1">{tx("Fecha de expiración")}</label>
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ borderColor: "var(--border)", color: "#1e293b" }}
                      value={cardExp}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCardExp(v);
                      }}
                      placeholder="MM/AA" maxLength={5} required />
                  </div>
                  <div>
                    <label className="block text-xs ttext-muted-foreground mb-1">CVV</label>
                    <input type="password" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ borderColor: "var(--border)", color: "#1e293b" }} value={cardCvv} onChange={e => setCardCvv(e.target.value.slice(0, 3))} placeholder="•••" maxLength={3} required />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="accent-amber-400 rounded" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                  <span className="text-xs ttext-muted-foreground">{tx("Guardar tarjeta para futuras reservas")}</span>
                </label>
              </div>

              <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--background)", border: "1px solid #e2e8f0" }}>
                <div className="flex justify-between text-sm ttext-muted-foreground"><span>{tx("Subtotal Hospedaje")} ({nights}n)</span><span>{fmt(roomBase)}</span></div>
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-sm ttext-muted-foreground"><span>{tx("Extras de Alojamiento")}</span><span>{fmt(extrasTotal)}</span></div>
                )}
                <div className="flex justify-between text-sm ttext-muted-foreground">
                  <span>{ivaPct}% IVA {ivaPct === 8 ? tx("(Decreto Feriado Turístico)") : tx("(Tarifa Ordinaria)")}</span>
                  <span className={ivaPct === 8 ? "text-emerald-700 font-bold" : ""}>{fmt(iva)}</span>
                </div>
                {hasService && (
                  <div className="flex justify-between text-sm text-emerald-700 font-medium bg-emerald-50/60 px-2 py-0.5 rounded">
                    <span>{tx("10% Servicio Turístico (Art. 41 Ley Turismo)")}</span>
                    <span className="font-mono font-bold">{fmt(servicio)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1.5 border-t" style={{ borderColor: "var(--border)", color: "#1e293b" }}><span>{tx("Total a cargar")}</span><span style={{ color: "#f59e0b" }}>{fmt(total)}</span></div>
              </div>

              {/* LOPDP Consent */}
              <label className="flex items-start gap-2 cursor-pointer select-none text-left p-2.5 rounded-lg border bg-background/60 border-border">
                <input type="checkbox" required defaultChecked className="mt-0.5 accent-amber-500 rounded" />
                <span className="text-[11px] ttext-muted-foreground leading-tight">
                  {tx("Acepto los Términos y la Política de Tratamiento de Datos Personales conforme a la")} <strong>{tx("Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador)")}</strong>. {tx("Mis datos personales se tratarán exclusivamente para la reserva y gestión de mi estancia.")}
                </span>
              </label>

              <div className="flex items-center gap-1.5 text-xs ttext-muted-foreground justify-center">
                <span>🔒</span> {tx("Pago tokenizado seguro (PCI-DSS compliant) · Cifrado SSL 256-bit · Sin almacenar CVV")}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep("details")} className="px-4 py-3 rounded-xl text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{tx("← Atrás")}</button>
                <button type="submit" disabled={processing} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>
                      {tx("Procesando pago...")}
                    </span>
                  ) : `${tx("Pagar")} ${fmt(total)} →`}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP: INVOICE ── */}
          {step === "invoice" && (
            <div className="space-y-0">
              {/* Success banner */}
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: "#d1fae5" }}>✓</div>
                <h3 className="font-bold text-foreground text-base">{tx("¡Pago procesado y reserva confirmada!")}</h3>
                <p className="text-xs ttext-muted-foreground mt-0.5">{tx("Voucher Oficial de Reserva Garantizada y liquidación de pasarela")}</p>
              </div>

              {/* Electronic payment receipt & Voucher */}
              <div className="rounded-2xl border overflow-hidden shadow-lg" style={{ borderColor: "var(--border)" }}>
                {/* Header: Payment gateway receipt */}
                <div className="px-5 py-4 flex items-start justify-between" style={{ background: "#0c1220" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg text-amber-400" style={{ fontFamily: "DM Serif Display, serif" }}>{hotelMeta.nombreComercial}</p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">{tx("RESERVA GARANTIZADA")}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{hotelMeta.razonSocial}</p>
                    <p className="text-[10px] ttext-muted-foreground font-mono">RUC: {hotelMeta.ruc} · {hotelMeta.city}</p>
                    <p className="text-[10px] ttext-muted-foreground">Pasarela: PayPhone / Tarjeta · Aut: AUTH-PP-{resId.replace(/\D/g, "").slice(-6) || "948210"}</p>
                  </div>
                  <div className="text-right">
                    <span className="mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{tx("VOUCHER DIGITAL")}</span>
                    <p className="font-bold mt-1 text-slate-100 font-mono text-xs">{invoiceId}</p>
                    <p className="mono text-[10px] ttext-muted-foreground">{issueDate}</p>
                  </div>
                </div>

                {/* Banner de Comprobante */}
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 leading-tight">
                  <p className="font-bold">Voucher de reserva - {hotel.name}:</p>
                  <p className="text-amber-800 text-[10px] mt-0.5">
                    {tx("Este documento confirma tu reserva garantizada y pago en línea. Presenta tu código de reserva al llegar al hotel para validar tu estancia.")}
                  </p>
                </div>

                {/* Client + hotel */}
                <div className="grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
                  <div className="px-4 py-3 bg-card">
                    <p className="text-[10px] font-bold uppercase tracking-wider ttext-muted-foreground mb-1">{tx("Huésped titular")}</p>
                    <p className="font-semibold text-foreground text-sm">{form.name || user?.name || "Huésped Invitado"}</p>
                    {docType === "RUC" && form.razonSocial && (
                      <p className="text-xs ttext-muted-foreground font-medium">🏢 {form.razonSocial}</p>
                    )}
                    <p className="text-xs ttext-muted-foreground">{form.email || user?.email || "invitado@alojamanta.ec"}</p>
                    {form.dni && (
                      <p className="mono text-xs ttext-muted-foreground">
                        {docType === "CEDULA" ? tx("Cédula: ") : docType === "RUC" ? "RUC: " : tx("Pasaporte: ")}
                        {form.dni}
                      </p>
                    )}
                    {form.phone && <p className="text-xs ttext-muted-foreground">Tel: {form.phone}</p>}
                    {(form.city || form.country) && (
                      <p className="text-[11px] ttext-muted-foreground truncate">
                        📍 {[form.address, form.city, form.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-card">
                    <p className="text-[10px] font-bold uppercase tracking-wider ttext-muted-foreground mb-1">{tx("Hotel prestador")}</p>
                    <p className="font-semibold text-foreground text-sm">{hotel.name}</p>
                    <p className="text-xs ttext-muted-foreground">{hotel.address}</p>
                    <p className="text-xs ttext-muted-foreground">{tx(hotel.city)}</p>
                  </div>
                </div>

                {/* Reservation details */}
                <div className="px-4 py-3 bg-card" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider ttext-muted-foreground mb-2">{tx("Detalle de la estancia reservada")}</p>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    {[
                      { l: tx("Nº Reserva"), v: resId },
                      { l: tx("Fecha Entrada"), v: `${fmtDateShort(params.checkIn)} · 14:00h` },
                      { l: tx("Fecha Salida"), v: `${fmtDateShort(params.checkOut)} · 12:00h` },
                      { l: tx("Noches"), v: String(nights) },
                    ].map(item => (
                      <div key={item.l}>
                        <p className="ttext-muted-foreground">{item.l}</p>
                        <p className="font-semibold text-foreground font-mono">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line items con desglose transparente */}
                <table className="w-full text-sm" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <thead style={{ background: "var(--background)" }}>
                    <tr>
                      {[tx("Concepto"), tx("Cantidad"), tx("Precio/u."), "Total"].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider ttext-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{tx(room.type)}</p>
                        <p className="text-xs ttext-muted-foreground">{hotel.name} · {tx(room.beds)}</p>
                      </td>
                      <td className="px-4 py-3 ttext-muted-foreground">{nights} noche{nights > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-mono ttext-muted-foreground">{fmt(effectiveNightlyRate)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{fmt(roomBase)}</td>
                    </tr>
                    {extrasTotal > 0 && (
                      <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                        <td className="px-4 py-2 text-xs ttext-muted-foreground" colSpan={3}>{tx("Servicios adicionales y extras seleccionados")}</td>
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-foreground">{fmt(extrasTotal)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid #e2e8f0", background: "var(--background)" }}>
                      <td colSpan={3} className="px-4 py-2 text-xs text-right ttext-muted-foreground">{tx("Subtotal Neto (Hospedaje y Extras)")}</td>
                      <td className="px-4 py-2 font-mono text-sm text-foreground">{fmt(base)}</td>
                    </tr>
                    <tr style={{ background: "var(--background)" }}>
                      <td colSpan={3} className="px-4 py-2 text-xs text-right ttext-muted-foreground">
                        {ivaPct}% IVA {ivaPct === 8 ? "(Decreto Feriado Turístico)" : "(Tarifa Ordinaria)"}
                      </td>
                      <td className="px-4 py-2 font-mono text-sm text-foreground">{fmt(iva)}</td>
                    </tr>
                    {hasService && (
                      <tr style={{ background: "var(--background)" }}>
                        <td colSpan={3} className="px-4 py-2 text-xs text-right text-emerald-700 font-medium">{tx("10% Servicio Turístico (Ley Turismo Art. 41)")}</td>
                        <td className="px-4 py-2 font-mono text-sm text-emerald-700 font-bold">{fmt(servicio)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                      <td colSpan={3} className="px-4 py-3 font-bold text-right text-foreground">{tx("TOTAL LIQUIDADO")}</td>
                      <td className="px-4 py-3 font-bold font-mono text-lg" style={{ color: "#f59e0b" }}>{fmt(total)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Payment confirmation */}
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#d1fae5", borderTop: "1px solid #a7f3d0" }}>
                  <span className="text-green-600 text-lg">✓</span>
                  <div>
                    <p className="text-xs font-bold text-green-700">{tx("Pago procesado correctamente")}</p>
                    <p className="text-xs text-green-600">Tarjeta **** **** **** {last4} · {fmt(total)} · {issueDate}</p>
                  </div>
                </div>

                {/* Verification code & Booking Reference */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: "var(--background)", borderTop: "1px solid #e2e8f0" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider ttext-muted-foreground">{tx("Código de Confirmación de Reserva")}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono font-bold text-foreground tracking-wider text-sm">{resId}</p>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono font-bold text-amber-600 text-xs">PIN: {verifyCode}</span>
                    </div>
                    <p className="text-[10px] ttext-muted-foreground mt-0.5">{tx("Menciona este código o tu nombre al presentarte en el establecimiento.")}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg border border-border bg-card text-center shadow-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider ttext-muted-foreground block">{tx("Estado")}</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {tx("Confirmada")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{tx("Cerrar")}</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  <span>⬇</span>
                  <span>{tx("Descargar Comprobante & Voucher PDF")}</span>
                </button>
              </div>
              <p className="text-center text-xs ttext-muted-foreground pt-1">{tx("Comprobante enviado a")} <strong>{form.email || user?.email}</strong></p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

