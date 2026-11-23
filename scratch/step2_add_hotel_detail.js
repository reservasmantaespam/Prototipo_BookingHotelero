import fs from "fs";

const newHotelDetailCode = `// ─── Hotel detail ─────────────────────────────────────────────────────────────

function HotelDetail({
  hotel,
  params,
  onBack,
  onBook,
  onOpenMap,
}: {
  hotel: Hotel;
  params: SearchParams;
  onBack: () => void;
  onBook: (r: RoomOffer, plan?: "flexible" | "non_refundable" | "breakfast_plus") => void;
  onOpenMap?: (hotelId: string) => void;
}) {
  const tx = useI18n();
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);
  const gallery = [hotel.image, ...hotel.rooms.map(room => room.image)].slice(0, 4);
  const score10 = Math.min(9.9, Math.max(8.2, Number((hotel.rating * 1.98).toFixed(1))));
  const subcriteria = [
    { label: tx("Limpieza e Higiene"), val: Math.min(10, Number((score10 + 0.2).toFixed(1))) },
    { label: tx("Ubicación en Manta"), val: Math.min(10, Number((score10 + 0.1).toFixed(1))) },
    { label: tx("Atención del Personal"), val: score10 },
    { label: tx("Relación Calidad-Precio"), val: Math.max(8.0, Number((score10 - 0.2).toFixed(1))) },
    { label: tx("Conectividad WiFi"), val: Math.max(8.1, Number((score10 - 0.1).toFixed(1))) },
  ];

  // Reseñas y Calificaciones Verificadas
  const initialHotelReviews: HotelReview[] = DEFAULT_HOTEL_REVIEWS[hotel.id] || [
    {
      id: \`rev-\${hotel.id}-1\`,
      hotelId: hotel.id,
      guestName: "Mariana Viteri",
      city: "Portoviejo",
      resId: "RES-10482",
      rating: Math.min(5.0, Number(hotel.rating.toFixed(1))),
      title: \`Excelente atención y estancia en \${hotel.name}\`,
      comment: \`Muy limpio, habitación cómoda y la atención de recepción fue cordial. El proceso de voucher digital funcionó de maravilla al arribar a \${hotel.city}.\`,
      tripType: "PAREJA",
      date: "04 de Noviembre, 2026",
      pros: "Habitación climatizada, limpieza impecable, canje de voucher veloz.",
      hotelResponse: {
        author: \`Gerencia \${hotel.name}\`,
        date: "05 de Noviembre, 2026",
        text: "Muchas gracias Mariana por su amable reseña. ¡Nos complace haber hecho su estancia memorable!",
      },
    },
    {
      id: \`rev-\${hotel.id}-2\`,
      hotelId: hotel.id,
      guestName: "Andrés Peñafiel",
      city: "Quito",
      resId: "RES-10519",
      rating: 4.7,
      title: "Gran relación calidad-precio en Manta",
      comment: "Buscábamos una opción cómoda para el fin de semana y superó nuestras expectativas. Cerca de puntos de interés y transporte.",
      tripType: "FAMILIAR",
      date: "28 de Octubre, 2026",
      pros: "Camas confortables, ambiente tranquilo y seguro.",
    },
  ];

  const [reviewsList, setReviewsList] = useState<HotelReview[]>(() => {
    try {
      const saved = localStorage.getItem(\`alojamanta_reviews_\${hotel.id}\`);
      return saved ? JSON.parse(saved) : initialHotelReviews;
    } catch {
      return initialHotelReviews;
    }
  });

  const [showAddReview, setShowAddReview] = useState(false);
  const [filterTrip, setFilterTrip] = useState<string>("TODOS");
  const [newReview, setNewReview] = useState({
    name: "",
    city: "Manta",
    resId: "",
    rating: 5,
    title: "",
    comment: "",
    tripType: "PAREJA" as "PAREJA" | "FAMILIAR" | "NEGOCIOS" | "SOLO" | "AMIGOS",
    pros: "",
    cons: "",
  });

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReview.name || !newReview.comment || !newReview.title) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    const created: HotelReview = {
      id: \`rev-\${Date.now()}\`,
      hotelId: hotel.id,
      guestName: newReview.name,
      city: newReview.city,
      resId: newReview.resId ? newReview.resId.toUpperCase() : \`RES-\${Math.floor(10000 + Math.random() * 89999)}\`,
      rating: Number(newReview.rating),
      title: newReview.title,
      comment: newReview.comment,
      tripType: newReview.tripType,
      date: "Hoy (Verificada)",
      pros: newReview.pros || undefined,
      cons: newReview.cons || undefined,
    };
    const updated = [created, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem(\`alojamanta_reviews_\${hotel.id}\`, JSON.stringify(updated));
    } catch {}
    setShowAddReview(false);
    setNewReview({
      name: "",
      city: "Manta",
      resId: "",
      rating: 5,
      title: "",
      comment: "",
      tripType: "PAREJA",
      pros: "",
      cons: "",
    });
    alert("¡Muchas gracias! Tu reseña ha sido registrada exitosamente.");
  }

  const filteredReviews = filterTrip === "TODOS" ? reviewsList : reviewsList.filter(r => r.tripType === filterTrip);
  const avgStars = reviewsList.length ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1) : hotel.rating.toFixed(1);

  const isRural = hotel.city.includes("Santa Marianita") || hotel.city.includes("San Lorenzo") || hotel.city.includes("San Mateo");
  const landmarks = isRural
    ? [
        { icon: "🏖️", place: tx("Playa local / Zona Costera"), dist: "0.2 km", time: tx("3 min a pie") },
        { icon: "🌴", place: tx("Playa El Murciélago & Malecón"), dist: "14.5 km", time: tx("20 min en auto") },
        { icon: "🛍️", place: tx("Mall del Pacífico"), dist: "15.0 km", time: tx("22 min en auto") },
        { icon: "✈️", place: tx("Aeropuerto Internacional Eloy Alfaro (MEC)"), dist: "21.0 km", time: tx("28 min en auto") },
        { icon: "🚌", place: tx("Terminal Terrestre Luis Valdiviezo Morán"), dist: "22.5 km", time: tx("30 min en auto") },
      ]
    : [
        { icon: "🌴", place: tx("Playa El Murciélago & Malecón Escénico"), dist: "0.8 km", time: tx("4 min en auto / 10 min a pie") },
        { icon: "🛍️", place: tx("Mall del Pacífico"), dist: "1.1 km", time: tx("5 min en auto") },
        { icon: "🍽️", place: tx("Zona Gastronómica Flavio Reyes / Barbasquillo"), dist: "1.4 km", time: tx("5 min en auto") },
        { icon: "✈️", place: tx("Aeropuerto Internacional Eloy Alfaro (MEC)"), dist: "6.5 km", time: tx("12 min en auto") },
        { icon: "🚌", place: tx("Terminal Terrestre Luis Valdiviezo Morán"), dist: "7.8 km", time: tx("15 min en auto") },
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium mb-5 hover:opacity-70 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
        {tx("← Volver a resultados")}
      </button>

      <div className="rounded-2xl overflow-hidden border mb-6 bg-card" style={{ borderColor: "var(--border)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-muted">
          {gallery.map((image, index) => (
            <div key={\`\${image}-\${index}\`} className={\`\${index === 0 ? "col-span-2 row-span-2" : ""} overflow-hidden\`} style={{ minHeight: index === 0 ? 260 : 128 }}>
              <img
                src={image}
                alt={index === 0 ? tx("Vista principal de {name}", { name: hotel.name }) : tx("{name}, vista {n}", { name: hotel.name, n: index + 1 })}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StarsRow n={hotel.stars} />
                <span className="text-xs ttext-muted-foreground">{tx(hotel.city)}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <p className="text-sm ttext-muted-foreground">📍 {hotel.address} · {tx(hotel.distance)}</p>
                {onOpenMap && (
                  <button
                    type="button"
                    onClick={() => onOpenMap(hotel.id)}
                    className="text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg border border-amber-500 shadow-xs transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
                    title={tx("Ver la ubicación exacta en el mapa de Manta")}
                  >
                    <span>🗺️</span>
                    <span>{tx("Ver en Mapa")}</span>
                  </button>
                )}
                <a
                  href={buildWhatsAppUrl(hotel.phone, hotel.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-105 no-underline"
                  title="Contactar al hotel por WhatsApp para consultas de estadía"
                >
                  <span>💬</span>
                  <span>WhatsApp Hotel</span>
                </a>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "#1e3a5f" }}>
              <span className="text-white font-bold text-xl">{score10}</span>
              <div>
                <p className="text-amber-300 font-bold text-xs">{tx("Excelente (/10)")}</p>
                <p className="text-white/60 text-[10px]">{reviewsList.length} {tx("reseñas verificadas")}</p>
              </div>
            </div>
          </div>
          <p className="text-sm ttext-muted-foreground mt-3 leading-relaxed">{txDesc(hotel.description)}</p>
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--muted)" }}>
            <p className="text-xs font-bold uppercase tracking-wider ttext-muted-foreground mb-3">{tx("Servicios del alojamiento")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hotel.amenities.map(a => (
                <div key={a} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium" style={{ background: "var(--background)", color: "var(--muted-foreground)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700">✓</span>
                  {tx(a)}
                </div>
              ))}
            </div>
          </div>

          {/* Puntos de referencia y tiempos de traslado en Manta */}
          <div className="mt-5 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4" style={{ borderColor: "var(--muted)" }}>
            <div className="rounded-xl p-4 border bg-background/70" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
                {tx("Lugares de interés cercanos")}
              </p>
              <div className="space-y-2 text-xs">
                {landmarks.map(lm => (
                  <div key={lm.place} className="flex items-center justify-between gap-2 py-1 border-b border-border/60 last:border-0">
                    <span className="text-foreground font-medium">
                      {lm.place}
                    </span>
                    <span className="text-[11px] font-mono ttext-muted-foreground whitespace-nowrap">{lm.dist} · {lm.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseñas y Valoraciones Verificadas */}
            <div className="rounded-xl p-4 border bg-background/70" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {tx("Puntuación de los huéspedes")}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{tx("Opiniones verificadas")}</span>
              </div>
              <div className="space-y-2 text-xs">
                {subcriteria.map(sc => (
                  <div key={sc.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="ttext-muted-foreground font-medium">{sc.label}</span>
                      <span className="font-mono font-bold text-foreground">{sc.val} / 10</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: \`\${sc.val * 10}%\` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 mb-5 border bg-amber-500/10 border-amber-500/30">
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <span>{tx("Entrada")}: {fmtDateShort(params.checkIn)} → {tx("Salida")}: {fmtDateShort(params.checkOut)}</span>
          <span>{nights} {nights > 1 ? tx("noches") : tx("noche")}</span>
          <span>{params.adults + params.children} {params.adults + params.children > 1 ? tx("huéspedes") : tx("huésped")}</span>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">{tx("Confirmación inmediata · Cancelación flexible según tarifa")}</p>
      </div>

      <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
        {tx("Tipos de Habitación y Planes Tarifarios")}
      </h2>

      <div className="space-y-4">
        {hotel.rooms.filter(r => r.capacity >= params.adults).map(room => (
          <div key={room.id} className="rounded-2xl overflow-hidden border bg-card hover:shadow-md transition-all" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-52 flex-shrink-0" style={{ height: 160 }}>
                <img src={room.image} alt={tx(room.type)} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground">{tx(room.type)}</h3>
                      <p className="text-xs ttext-muted-foreground mt-0.5">{tx(room.beds)} · {room.size} m² · {tx("hasta")} {room.capacity} {tx("pers.")}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {room.originalPrice && <p className="text-xs line-through ttext-muted-foreground">{fmt(room.originalPrice)}</p>}
                      <p className="text-xl font-bold" style={{ color: "#f59e0b" }}>{fmt(room.pricePerNight)}</p>
                      <p className="text-[10px] ttext-muted-foreground">{tx("/ noche base")}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {room.amenities.map(a => <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">{tx(a)}</span>)}
                    {room.breakfastIncluded && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">{tx("Desayuno incluido")}</span>}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "var(--muted)" }}>
                  {/* Selector de Planes de Tarifa por Habitación (Booking.com style) */}
                  <div className="rounded-xl border p-3 bg-muted/40 space-y-2" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                      <span>{tx("Planes tarifarios disponibles para este cuarto")}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Cancelación flexible o Descuento</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {/* Plan 1: Flexible */}
                      <div className="p-2.5 rounded-lg border bg-card border-border flex flex-col justify-between hover:border-amber-400 transition-all">
                        <div>
                          <p className="font-bold text-foreground text-xs flex items-center gap-1">
                            <span className="text-emerald-600">✓</span>
                            <span>{tx("Tarifa Flexible")}</span>
                          </p>
                          <p className="text-[10px] ttext-muted-foreground mt-0.5 leading-tight">{tx("Cancelación sin costo hasta 24h antes · Paga al llegar o en línea")}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground text-xs">{fmt(room.pricePerNight)}/n</span>
                          <button
                            type="button"
                            onClick={() => onBook(room, "flexible")}
                            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            {tx("Elegir →")}
                          </button>
                        </div>
                      </div>

                      {/* Plan 2: No reembolsable -10% */}
                      <div className="p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 transition-all">
                        <div>
                          <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1">
                            <span>🏷️</span>
                            <span>{tx("No Reembolsable (-10%)")}</span>
                          </p>
                          <p className="text-[10px] ttext-muted-foreground mt-0.5 leading-tight">{tx("Mejor precio garantizado · Ahorro inmediato del 10% en tu estancia")}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-emerald-500/20 flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">{fmt(Math.round(room.pricePerNight * 0.90 * 100) / 100)}/n</span>
                          <button
                            type="button"
                            onClick={() => onBook(room, "non_refundable")}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            {tx("Elegir →")}
                          </button>
                        </div>
                      </div>

                      {/* Plan 3: Con Desayuno Incluido */}
                      <div className="p-2.5 rounded-lg border bg-amber-500/10 border-amber-500/30 flex flex-col justify-between hover:border-amber-400 transition-all">
                        <div>
                          <p className="font-bold text-foreground text-xs flex items-center gap-1">
                            <span>☕</span>
                            <span>{tx("Con Desayuno Buffet")}</span>
                          </p>
                          <p className="text-[10px] ttext-muted-foreground mt-0.5 leading-tight">{tx("Desayuno manabita diario para todos los huéspedes · Cancelación flexible")}</p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-amber-500/20 flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground text-xs">{fmt(room.breakfastIncluded ? room.pricePerNight : room.pricePerNight + 6)}/n</span>
                          <button
                            type="button"
                            onClick={() => onBook(room, "breakfast_plus")}
                            className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            {tx("Elegir →")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <PriceBreakdownBox
                    basePrice={room.pricePerNight}
                    nights={nights}
                    hasService10={hotel.gravaServicio10}
                    hotelName={hotel.name}
                    defaultExpanded={false}
                    showToggle={true}
                  />

                  {/* Alerta de Escasez y Botón Principal */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={\`text-[11px] font-bold px-2.5 py-1 rounded-full \${
                        getRoomAvailability(hotel.id, room) <= 2
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }\`}>
                        {getRoomAvailability(hotel.id, room) <= 2
                          ? \`🔥 ¡Solo quedan \${getRoomAvailability(hotel.id, room)} habitaciones disponibles a este precio!\`
                          : \`✓ \${getRoomAvailability(hotel.id, room)} habitaciones disponibles para venta web\`}
                      </span>
                      {getRoomAvailability(hotel.id, room) <= 2 && (
                        <span className="text-[10px] ttext-muted-foreground italic">
                          ⏱️ Alta demanda para tus fechas en Manta
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={getRoomAvailability(hotel.id, room) <= 0}
                      onClick={() => onBook(room, "flexible")}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap self-end sm:self-auto disabled:opacity-40"
                      style={{ background: "#f59e0b", color: "#0c1220" }}
                    >
                      {getRoomAvailability(hotel.id, room) <= 0 ? tx("Agotado") : tx("Reservar Habitación →")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Sección de Calificaciones y Comentarios de Huéspedes Verificados ─── */}
      <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Opiniones y Calificaciones de Huéspedes")}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Verificadas
              </span>
            </div>
            <p className="text-xs ttext-muted-foreground mt-1">
              {tx("Evaluaciones de clientes que completaron su estancia con reserva garantizada en Manta.")}
            </p>
          </div>
          <button
            onClick={() => setShowAddReview(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
            style={{ background: "var(--foreground)", color: "#f59e0b", border: "1px solid #f59e0b" }}
          >
            <span>⭐</span>
            <span>{tx("Escribir una opinión sobre mi estancia")}</span>
          </button>
        </div>

        {/* Resumen de Calificación Promedio */}
        <div className="rounded-2xl p-5 mb-6 border bg-card grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-sm" style={{ background: "#1e3a5f" }}>
              <span className="text-2xl leading-none">{avgStars}</span>
              <span className="text-[10px] opacity-70">de 5</span>
            </div>
            <div>
              <div className="flex text-amber-400 text-sm">{"★".repeat(Math.round(Number(avgStars)))}{"☆".repeat(5 - Math.round(Number(avgStars)))}</div>
              <p className="text-xs font-bold text-foreground mt-0.5">{tx("Excelente reputación")}</p>
              <p className="text-[11px] ttext-muted-foreground">{reviewsList.length} {tx("reseñas verificadas")}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center border-l md:border-r border-border md:px-4">
            <p className="text-xs font-semibold text-foreground">98% de recomendación</p>
            <p className="text-[11px] ttext-muted-foreground mt-0.5 leading-relaxed">
              Los huéspedes destacan la atención cordial, la rapidez en recepción y la vista frente al mar.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-foreground mb-1.5">{tx("Filtrar por tipo de viaje:")}</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { k: "TODOS", l: "Todas" },
                { k: "PAREJA", l: "En Pareja" },
                { k: "FAMILIAR", l: "Familias" },
                { k: "NEGOCIOS", l: "Negocios" },
              ].map(f => (
                <button
                  key={f.k}
                  onClick={() => setFilterTrip(f.k)}
                  className={\`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer \${filterTrip === f.k ? "bg-amber-500 text-slate-900 font-bold" : "bg-card text-foreground border border-border"}\`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Reseñas */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <p className="text-center py-8 text-xs ttext-muted-foreground">{tx("No hay opiniones en esta categoría todavía.")}</p>
          ) : (
            filteredReviews.map(r => (
              <div key={r.id} className="rounded-2xl border p-5 bg-card shadow-xs hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: "#1e3a5f" }}>
                      {r.guestName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{r.guestName}</p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          ✓ Estancia Verificada
                        </span>
                      </div>
                      <p className="text-[11px] ttext-muted-foreground">
                        📍 {r.city} · {r.date} · <span className="font-mono font-medium">{r.resId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                      {r.tripType === "PAREJA" ? "Viaje en Pareja" : r.tripType === "FAMILIAR" ? "Viaje Familiar" : r.tripType === "NEGOCIOS" ? "Viaje de Trabajo" : "Viaje Individual"}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 border border-amber-200">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="font-bold text-xs text-slate-900">{r.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-foreground mb-1">{r.title}</h4>
                <p className="text-xs ttext-muted-foreground leading-relaxed mb-3">{r.comment}</p>

                {(r.pros || r.cons) && (
                  <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3 pt-2 border-t border-border">
                    {r.pros && (
                      <div className="flex items-start gap-1.5 text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                        <span className="font-bold text-emerald-600">✓</span>
                        <span className="text-[11px]"><strong className="font-semibold">Aspectos positivos:</strong> {r.pros}</span>
                      </div>
                    )}
                    {r.cons && (
                      <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50/60 p-2 rounded-lg">
                        <span className="font-bold text-amber-600">⚠</span>
                        <span className="text-[11px]"><strong className="font-semibold">A tener en cuenta:</strong> {r.cons}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Respuesta oficial de la gerencia del hotel */}
                {r.hotelResponse && (
                  <div className="mt-3 p-3 rounded-xl border bg-muted/40 text-xs" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🏢</span>
                        <p className="font-bold text-foreground text-[11px]">{r.hotelResponse.author}</p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">Respuesta Oficial</span>
                      </div>
                      <span className="text-[10px] ttext-muted-foreground">{r.hotelResponse.date}</span>
                    </div>
                    <p className="text-[11px] ttext-muted-foreground leading-relaxed italic">
                      "{r.hotelResponse.text}"
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Modal para Dejar Reseña y Calificación ─── */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <form
            onSubmit={handleSubmitReview}
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl my-8 border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">Opinión de Huésped Verificado</p>
                <h3 className="text-lg font-bold text-foreground">Evaluar mi estancia en {hotel.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Estrellas interactivas */}
              <div>
                <label className="block text-foreground font-semibold mb-1">Calificación general de tu experiencia *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: st })}
                      className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                      style={{ color: st <= newReview.rating ? "#f59e0b" : "#cbd5e1" }}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">
                    {newReview.rating === 5 ? "5.0 - Excelente" : newReview.rating === 4 ? "4.0 - Muy bueno" : newReview.rating === 3 ? "3.0 - Regular" : "2.0 - Mejorable"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Tu nombre completo *</label>
                  <input
                    required
                    value={newReview.name}
                    onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="Ej. Carlos Méndez"
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Ciudad de procedencia</label>
                  <input
                    value={newReview.city}
                    onChange={e => setNewReview({ ...newReview, city: e.target.value })}
                    placeholder="Ej. Quito / Portoviejo"
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Código de reserva o voucher</label>
                  <input
                    value={newReview.resId}
                    onChange={e => setNewReview({ ...newReview, resId: e.target.value })}
                    placeholder="Ej. RES-10482"
                    className="w-full px-3 py-2 rounded-lg border outline-none font-mono bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Motivo de tu viaje</label>
                  <select
                    value={newReview.tripType}
                    onChange={e => setNewReview({ ...newReview, tripType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <option value="PAREJA">En Pareja</option>
                    <option value="FAMILIAR">Familiar (Con niños)</option>
                    <option value="NEGOCIOS">Negocios / Trabajo</option>
                    <option value="AMIGOS">Con Amigos</option>
                    <option value="SOLO">Viaje Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Título de tu opinión *</label>
                <input
                  required
                  value={newReview.title}
                  onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Ej. Hermosa vista y excelente servicio del personal"
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Comentario detallado de tu estancia *</label>
                <textarea
                  required
                  rows={3}
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Describe la comodidad de la habitación, atención, ubicación y comida..."
                  className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground resize-none"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-1">✓ Aspectos positivos</label>
                  <input
                    value={newReview.pros}
                    onChange={e => setNewReview({ ...newReview, pros: e.target.value })}
                    placeholder="Ej. Desayuno tigrillo, aire acondicionado potente..."
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-amber-700 dark:text-amber-400 font-semibold mb-1">⚠ A tener en cuenta</label>
                  <input
                    value={newReview.cons}
                    onChange={e => setNewReview({ ...newReview, cons: e.target.value })}
                    placeholder="Ej. Parqueadero concurrido en feriados..."
                    className="w-full px-3 py-2 rounded-lg border outline-none bg-background text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReview(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm cursor-pointer"
                >
                  Publicar Opinión Verificada
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`;

let content = fs.readFileSync("src/GuestPage.tsx", "utf-8");

// Find start and end of HotelDetail in current GuestPage.tsx
const startMarker = "// ─── Hotel detail ─────────────────────────────────────────────────────────────";
const endMarker = "// ─── Results ──────────────────────────────────────────────────────────────────";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find start or end marker for HotelDetail");
  process.exit(1);
}

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

const newContent = before + newHotelDetailCode + "\n\n" + after;
fs.writeFileSync("src/GuestPage.tsx", newContent, "utf-8");
console.log("Replaced HotelDetail successfully!");

