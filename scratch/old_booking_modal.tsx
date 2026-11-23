// ─── Modal de Reserva ────────────────────────────────────────────────────────

type PasoReserva = "auth" | "details" | "payment" | "invoice";

function ModalReserva({
  hotel,
  room,
  params,
  user,
  initialPlan = "flexible",
  onClose,
  onGuestLogin,
  onReservationCreated,
}: {
  hotel: Hotel;
  room: RoomOffer;
  params: SearchParams;
  user: GuestUser | null;
  initialPlan?: "flexible" | "non_refundable" | "breakfast_plus";
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
  onReservationCreated?: (r: MyReservation) => void;
}) {
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);

  // RF-04: Planes de Tarifa
  const [ratePlan, setRatePlan] = useState<"flexible" | "non_refundable" | "breakfast_plus">(initialPlan);
  // Modalidad de Pago: Pagar ahora en línea vs Pagar en el hotel al llegar
  const [paymentMode, setPaymentMode] = useState<"online" | "hotel">("hotel");
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

  const initialStep: PasoReserva = user ? "details" : "auth";
  const [step, setStep] = useState<PasoReserva>(initialStep);
  const [processing, setProcessing] = useState(false);

  // Auth sub-state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authError, setAuthError] = useState("");

  function handleConfirmPayAtHotel() {
    if (!form.name || !form.email || !form.dni) {
      alert("Por favor completa tus datos obligatorios (Nombre, Correo y Documento de identificación).");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("invoice");
      reproducirSonidoNuevaReserva();

      const createdRes: MyReservation = {
        id: resId,
        hotel: hotel.name,
        hotelId: hotel.id,
        city: hotel.city,
        room: `${room.type} (${ratePlan === "non_refundable" ? "No Reembolsable -10%" : ratePlan === "breakfast_plus" ? "Desayuno Manabita Incluido" : "Tarifa Flexible"})`,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
        total,
        status: "confirmed",
        image: room.image,
        guestName: form.name || user?.name || "Huésped Invitado",
        guestEmail: form.email || user?.email || "invitado@alojamanta.ec",
        guestPhone: form.phone,
        payMethod: "PAGO EN EL HOTEL AL LLEGAR (RECEPCIÓN)",
      };

      if (onReservationCreated) {
        onReservationCreated(createdRes);
      }

      addAuditLog({
        hotelId: hotel.id,
        hotelName: hotel.name,
        action: "RESERVA_PAGO_EN_HOTEL",
        user: form.name || user?.name || "Huésped Web",
        role: "Huésped / Cliente",
        detail: `Reserva ${resId} confirmada con modalidad PAGO AL LLEGAR en ${hotel.name} (${room.type}, ${nights} noches) · Total a cobrar en recepción: US$${total.toFixed(2)} (IVA ${ivaPct}%)`,
      });
    }, 450);
  }

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

  const STEPS: { k: PasoReserva; l: string }[] = user
    ? [{ k: "details", l: "1. Datos y Tarifa" }, { k: "payment", l: "2. Pago Seguro" }, { k: "invoice", l: "3. Voucher de Reserva" }]
    : [{ k: "auth", l: "1. Acceso / Invitado" }, { k: "details", l: "2. Datos y Tarifa" }, { k: "payment", l: "3. Pago Seguro" }, { k: "invoice", l: "4. Voucher de Reserva" }];

  const stepIndex = STEPS.findIndex(s => s.k === step);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!authEmail || !authPass) { setAuthError("Completa todos los campos."); return; }
    if (authMode === "register" && !authName) { setAuthError("Indica tu nombre."); return; }
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
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("invoice");
      reproducirSonidoNuevaReserva();
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
      onReservationCreated?.(newRes);
      window.dispatchEvent(new CustomEvent("alojamanta-nueva-reserva", { detail: newRes }));
    }, 1500);
  }

  // ── Shared backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "#fff", maxHeight: "92vh" }}>

        {/* Step bar */}
        <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid #e2e8f0" }}>
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = s.k === step;
            return (
              <div key={s.k} className="flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-wide transition-all"
                style={{ background: active ? "#fef3c7" : "#f8fafc", color: active ? "#92400e" : done ? "#059669" : "#94a3b8", borderBottom: active ? "2px solid #f59e0b" : "2px solid transparent" }}>
                {done ? "✓ " : ""}{s.l}
              </div>
            );
          })}
        </div>

        {/* Room strip (not on invoice) */}
        {step !== "invoice" && (
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <img src={room.image} alt={room.type} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{hotel.name}</p>
              <p className="text-xs text-slate-500">{room.type} · {nights}n · {fmtDateShort(params.checkIn)} → {fmtDateShort(params.checkOut)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm" style={{ color: "#f59e0b" }}>{fmt(total)}</p>
              <p className="text-[10px] text-slate-400">IVA incl.</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ background: "#e2e8f0", color: "#64748b" }}>✕</button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── STEP: AUTH ── */}
          {step === "auth" && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {authMode === "login" ? "Inicia sesión o reserva como invitado" : "Crea tu cuenta gratis"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Accede con tu cuenta o reserva directamente sin necesidad de registrarte</p>
              </div>

              {/* Guest Checkout */}
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-sm"
              >
                <span>Continuar como invitado</span>
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                <span className="text-[11px] text-slate-400 uppercase font-semibold">o accede con tu cuenta</span>
                <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
              </div>

              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#e2e8f0" }}>
                {[{ k: "login" as const, l: "Iniciar sesión" }, { k: "register" as const, l: "Registrarme" }].map(m => (
                  <button key={m.k} onClick={() => setAuthMode(m.k)} className="flex-1 py-2 text-sm font-semibold transition-all" style={{ background: authMode === m.k ? "#f59e0b" : "#f8fafc", color: authMode === m.k ? "#0c1220" : "#64748b" }}>{m.l}</button>
                ))}
              </div>
              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre completo</label>
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} value={authName} onChange={e => setAuthName(e.target.value)} placeholder="María García" />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="maria@email.com" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contraseña</label>
                  <input type="password" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="••••••••" />
                </div>
                {authError && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fee2e2", color: "#ef4444" }}>{authError}</p>}
                <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  {authMode === "login" ? "Entrar y continuar →" : "Crear cuenta y continuar →"}
                </button>
              </form>
              <button onClick={() => { const u = { name: "Usuario Google", email: "usuario@gmail.com" }; onGuestLogin(u); setForm(f => ({ ...f, ...u })); setCardHolder(u.name); setStep("details"); }} className="w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors" style={{ borderColor: "#e2e8f0", color: "#475569" }}>
                <span>Continuar con Google</span>
              </button>
            </div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">1. Datos del huésped titular</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo del titular *</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Carlos Mendoza"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email para voucher y confirmación *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-amber-500"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="cliente@correo.ec"
                    required
                  />
                </div>
              </div>

              {/* Selector dinámico de Tipo de Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Documento *</label>
                  <select
                    value={docType}
                    onChange={e => {
                      const t = e.target.value as "CEDULA" | "RUC" | "PASAPORTE";
                      setDocType(t);
                      setForm(f => ({ ...f, dni: "" }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-xs font-semibold outline-none bg-white cursor-pointer"
                    style={{ borderColor: "#cbd5e1" }}
                  >
                    <option value="CEDULA">Cédula de Identidad (10 dígitos)</option>
                    <option value="RUC">RUC (13 dígitos / Empresa)</option>
                    <option value="PASAPORTE">Pasaporte Internacional (Alfanumérico)</option>
                  </select>
                </div>

                <div className={docType === "RUC" ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {docType === "CEDULA" && "Cédula de Identidad (10 dígitos) *"}
                    {docType === "RUC" && "Número de RUC (13 dígitos) *"}
                    {docType === "PASAPORTE" && "Número de Pasaporte (Alfanumérico) *"}
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
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono bg-white"
                    style={{ borderColor: "#cbd5e1" }}
                    required
                  />
                  {docType === "CEDULA" && form.dni.length > 0 && form.dni.length !== 10 && (
                    <p className="text-[10px] text-amber-600 mt-0.5">La cédula debe contener exactamente 10 dígitos numéricos.</p>
                  )}
                  {docType === "RUC" && form.dni.length > 0 && form.dni.length !== 13 && (
                    <p className="text-[10px] text-amber-600 mt-0.5">El RUC ecuatoriano debe tener 13 dígitos numéricos (termina en 001).</p>
                  )}
                </div>

                {docType === "RUC" && (
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Razón Social o Nombre de Empresa *</label>
                    <input
                      type="text"
                      value={form.razonSocial}
                      onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                      placeholder="Ej: IMPORTADORA DEL PACIFICO S.A.S."
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
                      style={{ borderColor: "#cbd5e1" }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Teléfono, País, Ciudad y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+593 98 421 8890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">País</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    placeholder="Ecuador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ciudad</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="Manta, Portoviejo, Quito..."
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección domiciliaria o fiscal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Av. 4 de Noviembre y Calle 114, Manta"
                  />
                </div>
              </div>

              {/* Selección de Plan de Tarifa */}
              <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-2" style={{ borderColor: "#e2e8f0" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>2. Plan de tarifa</span>
                  <span className="text-[10px] font-mono text-amber-700">{fmt(effectiveNightlyRate)} / noche</span>
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "flexible" ? "bg-amber-50 border-amber-400 text-slate-900 font-semibold" : "bg-white border-slate-200 text-slate-600"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "flexible"} onChange={() => setRatePlan("flexible")} className="accent-amber-500" />
                      <div>
                        <p className="font-bold text-slate-800">Tarifa Estándar Flexible (Reembolsable 48h)</p>
                        <p className="text-[10px] text-slate-500">Cancelación gratuita hasta 48h antes de la Fecha de Entrada</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{fmt(room.pricePerNight)}/n</span>
                  </label>

                  <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "non_refundable" ? "bg-emerald-50 border-emerald-400 text-slate-900 font-semibold" : "bg-white border-slate-200 text-slate-600"}`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="ratePlan" checked={ratePlan === "non_refundable"} onChange={() => setRatePlan("non_refundable")} className="accent-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-800">Tarifa Promocional No Reembolsable (-10%)</p>
                        <p className="text-[10px] text-slate-500">10% de descuento inmediato · Pago final sin reembolso</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{fmt(Math.round(room.pricePerNight * 0.90 * 100) / 100)}/n</span>
                  </label>

                  {!room.breakfastIncluded && (
                    <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${ratePlan === "breakfast_plus" ? "bg-amber-50 border-amber-400 text-slate-900 font-semibold" : "bg-white border-slate-200 text-slate-600"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="ratePlan" checked={ratePlan === "breakfast_plus"} onChange={() => setRatePlan("breakfast_plus")} className="accent-amber-500" />
                        <div>
                          <p className="font-bold text-slate-800">Plan con Desayuno Manabita Incluido (+$8/noche)</p>
                          <p className="text-[10px] text-slate-500">Incluye desayuno costero completo y cancelación flexible</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{fmt(room.pricePerNight + 8)}/n</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Extras y Servicios Adicionales */}
              <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-2" style={{ borderColor: "#e2e8f0" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>3. Servicios adicionales</span>
                  {extrasTotal > 0 && <span className="text-[10px] font-mono font-bold text-emerald-700">+{fmt(extrasTotal)}</span>}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { k: "airport" as const, label: "Traslado Aeropuerto Manta (MEC)", price: "+$15.00" },
                    { k: "extrabed" as const, label: "Cama supletoria adicional", price: "+$20.00" },
                    { k: "crib" as const, label: "Cuna para bebé sujeta a cupo", price: "Cortesía $0" },
                    { k: "lateout" as const, label: "Salida extendida (hasta 16:00h)", price: "+$15.00" },
                  ].map(ext => (
                    <label key={ext.k} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${selectedExtras[ext.k] ? "bg-amber-50 border-amber-400" : "bg-white border-slate-200"}`}>
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={selectedExtras[ext.k]}
                          onChange={e => setSelectedExtras(s => ({ ...s, [ext.k]: e.target.checked }))}
                          className="accent-amber-500 rounded"
                        />
                        {ext.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-600">{ext.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Observaciones o hora estimada de arribo</label>
                <textarea className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ej: Llegada en vuelo de las 15:30, preferencia piso alto..." />
              </div>

              {/* 4. Modalidad de Pago (Booking.com style: Paga al llegar vs Paga en línea) */}
              <div className="rounded-xl border p-3.5 bg-slate-50/70 space-y-2.5" style={{ borderColor: "#e2e8f0" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>4. ¿Cuándo y cómo deseas pagar?</span>
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Garantía Local Manta
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    paymentMode === "hotel"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300/60 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "hotel"}
                        onChange={() => setPaymentMode("hotel")}
                        className="accent-emerald-600 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <span>🏨</span>
                          <span>Pagar en el hotel (Al llegar)</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          ¡No pagas nada hoy! Cancelas al hacer check-in en la recepción de <strong>{hotel.name}</strong> en efectivo, transferencia bancaria directa o tarjeta física.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md self-start border border-emerald-200">
                      ✓ Sin cargo hoy · Paga al check-in
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    paymentMode === "online"
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-300/60 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === "online"}
                        onChange={() => setPaymentMode("online")}
                        className="accent-amber-500 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <span>💳</span>
                          <span>Pagar ahora en línea</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Paga de forma inmediata y 100% segura con Tarjeta de Crédito/Débito, PayPhone o DeUna. Tu habitación queda saldada y garantizada al instante.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md self-start border border-amber-200">
                      ✓ Confirmación 100% Pagada
                    </span>
                  </label>
                </div>
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
              <div className="flex gap-2 pt-1">
                {!user && (
                  <button
                    type="button"
                    onClick={() => setStep("auth")}
                    className="px-4 py-3 rounded-xl text-sm font-medium border cursor-pointer hover:bg-slate-50 transition-colors"
                    style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                  >
                    ← Atrás
                  </button>
                )}

                {paymentMode === "hotel" ? (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleConfirmPayAtHotel}
                    className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:scale-[1.01] active:scale-95 disabled:opacity-70"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>
                        Confirmando reserva...
                      </span>
                    ) : (
                      <>
                        <span>🏨 Confirmar Reserva y Pagar al Llegar ({fmt(total)})</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.name || !form.email || !form.dni) {
                        alert("Por favor completa tu nombre, correo y documento de identificación.");
                        return;
                      }
                      setStep("payment");
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-[1.01] active:scale-95"
                  >
                    <span>Continuar al Pago Seguro en Línea →</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: PAYMENT ── */}
          {step === "payment" && (
            <form onSubmit={handlePay} className="space-y-4">
              <h3 className="font-bold text-slate-800">Pago con tarjeta</h3>
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
                    <p className="text-white/40 text-[9px] uppercase tracking-widest">Titular</p>
                    <p className="text-white text-sm font-medium truncate max-w-[180px]">{cardHolder || "NOMBRE APELLIDOS"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest">Vence</p>
                    <p className="text-white text-sm font-mono">{cardExp || "MM/AA"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Titular de la tarjeta</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none uppercase" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} placeholder="NOMBRE APELLIDOS" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Número de tarjeta</label>
                  <div className="relative">
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono pr-16" style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
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
                    <label className="block text-xs text-slate-400 mb-1">Fecha de expiración</label>
                    <input className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                      value={cardExp}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCardExp(v);
                      }}
                      placeholder="MM/AA" maxLength={5} required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CVV</label>
                    <input type="password" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ borderColor: "#e2e8f0", color: "#1e293b" }} value={cardCvv} onChange={e => setCardCvv(e.target.value.slice(0, 3))} placeholder="•••" maxLength={3} required />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="accent-amber-400 rounded" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                  <span className="text-xs text-slate-500">Guardar tarjeta para futuras reservas</span>
                </label>
              </div>

              <div className="rounded-xl p-3 space-y-1.5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="flex justify-between text-sm text-slate-500"><span>Subtotal Hospedaje ({nights}n)</span><span>{fmt(roomBase)}</span></div>
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-sm text-slate-500"><span>Extras de Alojamiento</span><span>{fmt(extrasTotal)}</span></div>
                )}
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{ivaPct}% IVA {ivaPct === 8 ? "(Decreto Feriado Turístico)" : "(Tarifa Ordinaria)"}</span>
                  <span className={ivaPct === 8 ? "text-emerald-700 font-bold" : ""}>{fmt(iva)}</span>
                </div>
                {hasService && (
                  <div className="flex justify-between text-sm text-emerald-700 font-medium bg-emerald-50/60 px-2 py-0.5 rounded">
                    <span>10% Servicio Turístico (Art. 41 Ley Turismo)</span>
                    <span className="font-mono font-bold">{fmt(servicio)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1.5 border-t" style={{ borderColor: "#e2e8f0", color: "#1e293b" }}><span>Total a cargar</span><span style={{ color: "#f59e0b" }}>{fmt(total)}</span></div>
              </div>

              {/* LOPDP Consent */}
              <label className="flex items-start gap-2 cursor-pointer select-none text-left p-2.5 rounded-lg border bg-slate-50/60 border-slate-200">
                <input type="checkbox" required defaultChecked className="mt-0.5 accent-amber-500 rounded" />
                <span className="text-[11px] text-slate-600 leading-tight">
                  Acepto los Términos y la Política de Tratamiento de Datos Personales conforme a la <strong>Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador)</strong>. Mis datos personales se tratarán exclusivamente para la reserva y gestión de mi estancia.
                </span>
              </label>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center">
                <span>🔒</span> Pago tokenizado seguro (PCI-DSS compliant) · Cifrado SSL 256-bit · Sin almacenar CVV
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep("details")} className="px-4 py-3 rounded-xl text-sm font-medium border" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>← Atrás</button>
                <button type="submit" disabled={processing} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70" style={{ background: "#f59e0b", color: "#0c1220" }}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>
                      Procesando pago...
                    </span>
                  ) : `Pagar ${fmt(total)} →`}
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
                <h3 className="font-bold text-slate-800 text-base">¡Pago procesado y reserva confirmada!</h3>
                <p className="text-xs text-slate-500 mt-0.5">Voucher Oficial de Reserva Garantizada y liquidación de pasarela</p>
              </div>

              {/* Electronic payment receipt & Voucher */}
              <div className="rounded-2xl border overflow-hidden shadow-lg" style={{ borderColor: "#e2e8f0" }}>
                {/* Header: Payment gateway receipt */}
                <div className="px-5 py-4 flex items-start justify-between" style={{ background: "#0c1220" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg text-amber-400" style={{ fontFamily: "DM Serif Display, serif" }}>{hotelMeta.nombreComercial}</p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">RESERVA GARANTIZADA</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{hotelMeta.razonSocial}</p>
                    <p className="text-[10px] text-slate-400 font-mono">RUC: {hotelMeta.ruc} · {hotelMeta.city}</p>
                    <p className="text-[10px] text-slate-400">Pasarela: PayPhone / Tarjeta · Aut: AUTH-PP-{resId.replace(/\D/g, "").slice(-6) || "948210"}</p>
                  </div>
                  <div className="text-right">
                    <span className="mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">VOUCHER DIGITAL</span>
                    <p className="font-bold mt-1 text-slate-100 font-mono text-xs">{invoiceId}</p>
                    <p className="mono text-[10px] text-slate-400">{issueDate}</p>
                  </div>
                </div>

                {/* Banner de Comprobante */}
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 leading-tight">
                  <p className="font-bold">Voucher de reserva - {hotel.name}:</p>
                  <p className="text-amber-800 text-[10px] mt-0.5">
                    Este documento confirma tu reserva garantizada y pago en línea. Presenta tu código de reserva al llegar al hotel para validar tu estancia.
                  </p>
                </div>

                {/* Client + hotel */}
                <div className="grid grid-cols-2 gap-px" style={{ background: "#e2e8f0" }}>
                  <div className="px-4 py-3 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Huésped titular</p>
                    <p className="font-semibold text-slate-800 text-sm">{form.name || user?.name || "Huésped Invitado"}</p>
                    {docType === "RUC" && form.razonSocial && (
                      <p className="text-xs text-slate-600 font-medium">🏢 {form.razonSocial}</p>
                    )}
                    <p className="text-xs text-slate-500">{form.email || user?.email || "invitado@alojamanta.ec"}</p>
                    {form.dni && (
                      <p className="mono text-xs text-slate-500">
                        {docType === "CEDULA" ? "Cédula: " : docType === "RUC" ? "RUC: " : "Pasaporte: "}
                        {form.dni}
                      </p>
                    )}
                    {form.phone && <p className="text-xs text-slate-500">Tel: {form.phone}</p>}
                    {(form.city || form.country) && (
                      <p className="text-[11px] text-slate-400 truncate">
                        📍 {[form.address, form.city, form.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hotel prestador</p>
                    <p className="font-semibold text-slate-800 text-sm">{hotel.name}</p>
                    <p className="text-xs text-slate-500">{hotel.address}</p>
                    <p className="text-xs text-slate-500">{hotel.city}</p>
                  </div>
                </div>

                {/* Reservation details */}
                <div className="px-4 py-3 bg-white" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Detalle de la estancia reservada</p>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    {[
                      { l: "Nº Reserva", v: resId },
                      { l: "Fecha Entrada", v: `${fmtDateShort(params.checkIn)} · 14:00h` },
                      { l: "Fecha Salida", v: `${fmtDateShort(params.checkOut)} · 12:00h` },
                      { l: "Noches", v: String(nights) },
                    ].map(item => (
                      <div key={item.l}>
                        <p className="text-slate-400">{item.l}</p>
                        <p className="font-semibold text-slate-700 font-mono">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line items con desglose transparente */}
                <table className="w-full text-sm" style={{ borderTop: "1px solid #e2e8f0" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      {["Concepto", "Cantidad", "Precio/u.", "Total"].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{room.type}</p>
                        <p className="text-xs text-slate-400">{hotel.name} · {room.beds}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{nights} noche{nights > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{fmt(effectiveNightlyRate)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{fmt(roomBase)}</td>
                    </tr>
                    {extrasTotal > 0 && (
                      <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                        <td className="px-4 py-2 text-xs text-slate-600" colSpan={3}>Servicios adicionales y extras seleccionados</td>
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-800">{fmt(extrasTotal)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                      <td colSpan={3} className="px-4 py-2 text-xs text-right text-slate-500">Subtotal Neto (Hospedaje y Extras)</td>
                      <td className="px-4 py-2 font-mono text-sm text-slate-700">{fmt(base)}</td>
                    </tr>
                    <tr style={{ background: "#f8fafc" }}>
                      <td colSpan={3} className="px-4 py-2 text-xs text-right text-slate-500">
                        {ivaPct}% IVA {ivaPct === 8 ? "(Decreto Feriado Turístico)" : "(Tarifa Ordinaria)"}
                      </td>
                      <td className="px-4 py-2 font-mono text-sm text-slate-700">{fmt(iva)}</td>
                    </tr>
                    {hasService && (
                      <tr style={{ background: "#f8fafc" }}>
                        <td colSpan={3} className="px-4 py-2 text-xs text-right text-emerald-700 font-medium">10% Servicio Turístico (Ley Turismo Art. 41)</td>
                        <td className="px-4 py-2 font-mono text-sm text-emerald-700 font-bold">{fmt(servicio)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                      <td colSpan={3} className="px-4 py-3 font-bold text-right text-slate-800">TOTAL LIQUIDADO</td>
                      <td className="px-4 py-3 font-bold font-mono text-lg" style={{ color: "#f59e0b" }}>{fmt(total)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Payment confirmation según modalidad */}
                {paymentMode === "hotel" ? (
                  <div className="px-4 py-3 flex items-start gap-3 bg-emerald-50 border-t border-emerald-200">
                    <span className="text-emerald-700 text-xl font-bold">🏨</span>
                    <div className="text-xs">
                      <p className="font-bold text-emerald-900">Modalidad: Pago directo en el hotel al llegar (Check-in)</p>
                      <p className="text-emerald-800 mt-0.5">Saldo pendiente a liquidar en recepción: <strong className="text-amber-800 font-mono text-sm">{fmt(total)}</strong></p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Medios aceptados en recepción: Efectivo en US$, Transferencia bancaria local o Tarjeta física.</p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-3 bg-emerald-50 border-t border-emerald-200">
                    <span className="text-green-600 text-lg">✓</span>
                    <div>
                      <p className="text-xs font-bold text-green-700">Pago procesado en línea correctamente</p>
                      <p className="text-xs text-green-600">Tarjeta **** **** **** {last4} · {fmt(total)} · {issueDate} · Saldo pendiente: US$ 0.00</p>
                    </div>
                  </div>
                )}

                {/* Verification code & Booking Reference */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Código de Confirmación de Reserva</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono font-bold text-slate-800 tracking-wider text-sm">{resId}</p>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono font-bold text-amber-600 text-xs">PIN: {verifyCode}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Menciona este código o tu nombre al presentarte en el establecimiento.</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-center shadow-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estado</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Confirmada
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <a
                  href={buildWhatsAppUrl(
                    hotel.phone,
                    hotel.name,
                    resId,
                    form.name || user?.name || "Huésped",
                    fmtDateShort(params.checkIn),
                    fmtDateShort(params.checkOut),
                    room.type,
                    paymentMode === "hotel" ? "PAGO EN EL HOTEL AL LLEGAR" : "PAGO EN LINEA",
                    paymentMode === "hotel" ? total : 0
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer no-underline hover:scale-[1.01]"
                >
                  <span className="text-base sm:text-lg">💬</span>
                  <span>Contactar a {hotel.name} por WhatsApp con mi Reserva</span>
                </a>
                <div className="flex gap-2">
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border cursor-pointer hover:bg-slate-50 transition-colors" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>Cerrar</button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: "#f59e0b", color: "#0c1220" }}>
                    <span>⬇</span>
                    <span>Descargar Comprobante & Voucher PDF</span>
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 pt-1">Comprobante enviado a <strong>{form.email || user?.email}</strong></p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

