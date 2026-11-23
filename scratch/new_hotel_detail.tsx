// ─── Hotel detail ─────────────────────────────────────────────────────────────

function HotelDetail({ hotel, params, onBack, onBook }: { hotel: Hotel; params: SearchParams; onBack: () => void; onBook: (r: RoomOffer) => void }) {
  const tx = useI18n();
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);
  const gallery = [hotel.image, ...hotel.rooms.map(room => room.image)].slice(0, 4);
  const score10 = Math.min(9.9, Math.max(8.2, Number((hotel.rating * 1.98).toFixed(1))));
  const subcriteria = [
    { label: tx("Limpieza e Higiene"), val: Math.min(10, Number((score10 + 0.2).toFixed(1))) },
    { label: tx("Ubicación en Manta"), val: Math.min(10, Number((score10 + 0.1).toFixed(1))) },
    { label: tx("Atención del Personal"), val: score10 },
    { label: tx("Relación Calidad-Precio"), val: Math.max(8.0, Number((score10 - 0.2).toFixed(1))) },
  ];

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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium mb-5 hover:opacity-70 transition-opacity" style={{ color: "var(--muted-foreground)" }}>{tx("← Volver a resultados")}</button>
      <div className="rounded-2xl overflow-hidden border mb-6 bg-card" style={{ borderColor: "var(--border)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-muted">
          {gallery.map((image, index) => (
            <div key={`${image}-${index}`} className={`${index === 0 ? "col-span-2 row-span-2" : ""} overflow-hidden`} style={{ minHeight: index === 0 ? 260 : 128 }}>
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
              <div className="flex items-center gap-2 mb-1"><StarsRow n={hotel.stars} /><span className="text-xs ttext-muted-foreground">{tx(hotel.city)}</span></div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>{hotel.name}</h1>
              <p className="text-sm ttext-muted-foreground mt-0.5">📍 {hotel.address} · {tx(hotel.distance)}</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "#1e3a5f" }}>
              <span className="text-white font-bold text-xl">{score10}</span>
              <div><p className="text-amber-300 font-bold text-xs">{tx("Excelente (/10)")}</p><p className="text-white/60 text-[10px]">{hotel.reviews} {tx("reseñas verificadas")}</p></div>
            </div>
          </div>
          <p className="text-sm ttext-muted-foreground mt-3 leading-relaxed">{txDesc(hotel.description)}</p>
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--muted)" }}>
            <p className="text-xs font-bold uppercase tracking-wider ttext-muted-foreground mb-3">{tx("Servicios del alojamiento")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hotel.amenities.map(a => (
                <div key={a} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium" style={{ background: "var(--background)", color: "#475569" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#d1fae5", color: "#047857" }}>✓</span>
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
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${sc.val * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 mb-5 border" style={{ background: "#fef3c7", borderColor: "#fcd34d" }}>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-amber-800">
          <span>{tx("Entrada")}: {fmtDateShort(params.checkIn)} → {tx("Salida")}: {fmtDateShort(params.checkOut)}</span>
          <span>{nights} {nights > 1 ? tx("noches") : tx("noche")}</span>
          <span>{params.adults + params.children} {params.adults + params.children > 1 ? tx("huéspedes") : tx("huésped")}</span>
        </div>
        <p className="text-xs text-amber-700">{tx("Confirmación inmediata · Cancelación flexible según tarifa")}</p>
      </div>
      <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Tipos de Habitación y Cupos para Venta Web")}</h2>
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
                    {room.amenities.map(a => <span key={a} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "#475569" }}>{tx(a)}</span>)}
                    {room.breakfastIncluded && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#d1fae5", color: "#065f46" }}>{tx("Desayuno incluido")}</span>}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "var(--muted)" }}>
                  <PriceBreakdownBox
                    basePrice={room.pricePerNight}
                    nights={nights}
                    hasService10={hotel.gravaServicio10}
                    hotelName={hotel.name}
                    defaultExpanded={false}
                    showToggle={true}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getRoomAvailability(hotel.id, room) <= 2 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {getRoomAvailability(hotel.id, room) <= 2 ? tx("Últimas {n} habitaciones disponibles", { n: getRoomAvailability(hotel.id, room) }) : tx("{n} habitaciones disponibles", { n: getRoomAvailability(hotel.id, room) })}
                      </span>
                    </div>
                    <button disabled={getRoomAvailability(hotel.id, room) <= 0} onClick={() => onBook(room)} className="px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#f59e0b", color: "#0c1220" }}>
                      {getRoomAvailability(hotel.id, room) <= 0 ? tx("Agotado") : tx("Reservar Cupo →")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

